import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserservicesService {
  private socket: Socket;
  roomName: string;
  iceServers = {  //through Ice Server we connect to STUN SERVER of the broswer , also connect through IP with client side
    iceServers: [
      { urls: "stun:stun.services.mozilla.com" },
      { urls: "stun:stun1.1.google.com:19302" }
    ]
  };
  userStream: MediaStream;
  audioStream:MediaStreamTrack;
  videoStream:MediaStreamTrack;
  currentUser: boolean = false;
  rtcPeerConnection : RTCPeerConnection;
  startGathering:boolean = false;

  constructor() {
  }


  connectToServer(): Promise<boolean> {
    this.socket = io("http://localhost:3000", { transports: ['websocket', 'polling', 'flashsocket'] });//Establishing connection on click is not recommended for video calling because when a peer1 emits an offer and peer2 not connected to socket because connection is not established that time event that was emitted is lost so establish connection during initialization . Where as in chatting application on click connection is used because if a user sends a message and another user is not available , and then comes online he can fetch all messages through a method 
    return new Promise<boolean>((resolve, reject) => {
      if (this.socket.active) {
        resolve(true);
      }
      else {
        reject(false);
      }
    })

  }

  captureJoin(roomName: string): Observable<any> {
    this.roomName = roomName;
    const self = this;
    this.socket.emit("join", roomName);
    return new Observable<any>((observer) => {
      this.socket.on("roomCreated", (response) => {
        navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia;//if browser don't support navigator.webkitGetUserMedia or 
        const constraints = {
          video: false,
          audio: true //instead of true {width:1200 , height:1000px}
        }
        navigator.mediaDevices.getUserMedia(constraints
        ).then(
          function (stream) {
            var uservideo = document.getElementById("user-video") as HTMLVideoElement;
            uservideo.srcObject = stream;
            uservideo.onloadedmetadata = function (e) {
              uservideo.play();
              //using this refers to the objects available within scope
            }
            
            self.userStream = stream;
            this.currentUser = true;
            this.socket.emit("ready", roomName);//other user is ready to join the call
            this.readySocket(stream.getTracks()[0], roomName);
            observer.next({ stream: stream.getTracks()[0], status: "created" });
          }.bind(this))
          .catch(
            function (error) {
              console.log(error);
              observer.error(error);
            }
          );
      })
      this.socket.on("roomJoined", (response) => {
        const self=this;
        navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia;//if browser don't support navigator.webkitGetUserMedia or 
        const constraints = {
          video: false,
          audio: true //instead of true {width:1200 , height:1000px}
        }
        navigator.mediaDevices.getUserMedia(constraints
        ).then(
          function (stream) {
            var uservideo = document.getElementById("user-video") as HTMLVideoElement;
            uservideo.srcObject = stream;
            uservideo.onloadedmetadata = function (e) {
              uservideo.play();
            } //we wont be able to call this.socket here because "this" refers to any objects within the function stream emitted by the media devices
            self.userStream = stream;
            self.currentUser = false;
            observer.next({ stream: stream.getTracks()[0], status: "joined" });
          }) //creates a new function with same body as function (stream) and also bounds the global access variable/function. By binding the global scopeaccess using bind we can now use this.socket in the function .Function call is never affected
          .catch(
            function (error) {
              console.log(error);
              observer.error(error);
            }

          );
      });
      this.socket.on("roomFull", (response) => {
        observer.next("full");

      })
    })
  }

  readySocket(audioStream: MediaStreamTrack , roomName) {//refer README
    const self = this;
    this.socket.on("PeerReady", function () {//we send ready event when we want to call the user, in backend the socket captures the emitted event and broadcast the message to the room (saying the remote peer has answered the call and is ready to connect so which ever user is trying to capture("using on") recieves it), now here we are trying to capture what has been broadcasted to room from backend when "ready" was sent from us and another ready evnent wass sent by backend
      self.rtcPeerConnection = new RTCPeerConnection(self.iceServers);//using ice server STUN server ,  RTCPeerConnection connects
      self.rtcPeerConnection.onicecandidate= function(event)
      {
        console.log("event",event);
        if (event.candidate) {
          self.socket.emit("candidate", event.candidate, roomName);
        }
      }
      self.rtcPeerConnection.ontrack = self.onTrackFunction;// we can also write like rtcPeerConnection.ontrack = function(e){} , basically when RTCPeerConnection is established , it emits event . The event will have some values which we can use in our code further . So .onTrack also emits an event which when emitted sends the values as an arguement to the function
      self.rtcPeerConnection.addTrack(audioStream);//send our audio and video to peer , [0] is video [1] is audio
      
      self.rtcPeerConnection.createOffer(
        function (offer)//sends sdp details
        {
          self.rtcPeerConnection.setLocalDescription(new RTCSessionDescription(offer));
          self.socket.emit("offer", offer, roomName);
          console.log("sent an offer")
        },
        function (error) {
          console.log("Unable to call the user currently", error);
        }
      )
    });


  };

  onTrackFunction(event) {
    var peervideo = document.getElementById("peer-video") as HTMLVideoElement;
    console.log(event);
    peervideo.srcObject = event.streams[0];//will have audio and video
    console.log(peervideo.srcObject);
    peervideo.onloadedmetadata = function (e) {
      peervideo.play();
    }
    console.log("User on call and ready to be viewed")
  }

  offerSocket(): Observable<any> { //when user1 sends call request(offer) to user2 , offerSocket() in user2 is called to send our answer to the call
    const self = this;
    return new Observable<any>((observer) => {
      if (this.currentUser == false) {
        this.socket.on("PeerOffer", function (response) {
          self.socket.emit("join",response.roomName);
          self.socket.on("roomJoined",function(){
            navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia;//if browser don't support navigator.webkitGetUserMedia or 
            const constraints = {
              video: false,
              audio: true //instead of true {width:1200 , height:1000px}
            }
            navigator.mediaDevices.getUserMedia(constraints
            ).then(
              function (stream) {
                var uservideo = document.getElementById("user-video") as HTMLVideoElement;
                uservideo.srcObject = stream;
                uservideo.onloadedmetadata = function (e) {
                  uservideo.play();
                  self.userStream=stream;
                  self.audioStream=stream.getTracks()[0];
                  observer.next(stream);
                } })
                .catch(
                  function (error) {
                    console.log(error);
                  }
      
                );  
                console.log("entered")
                self.rtcPeerConnection = new RTCPeerConnection(self.iceServers);//using ice server STUN server ,  RTCPeerConnection connects
                self.rtcPeerConnection.onicecandidate= function(event)
                {
                  console.log(event);
                  if (event.candidate) {
                    self.socket.emit("candidate", event.candidate, self.roomName);
                  }
                }
                // console.log(self.userStream.getTracks()[0]);
                self.rtcPeerConnection.ontrack = self.onTrackFunction;// we can also write like rtcPeerConnection.ontrack = function(e){} , basically when RTCPeerConnection is established , it emits event . The event will have some values which we can use in our code further . So .onTrack also emits an event which when emitted sends the values as an arguement to the function
                // self.rtcPeerConnection.addTrack(self.audioStream);//send our audio and video to peer , [0] is video [1] is audio
                console.log(response.offer);
                self.rtcPeerConnection.setRemoteDescription(response.offer);
                self.rtcPeerConnection.createAnswer(
                  function (answer)//sends sdp details
                  {
                    self.rtcPeerConnection.setLocalDescription(answer);
                    self.socket.emit("answer", answer, response.roomName);
                    console.log("sent an answer")
                  },
                  function (error) {
                    console.log("Unable to call the user currently", error);
                  }
                )
              })
        });
      }
      else {
        observer.error("You are a current User");
      }
    })

  }
  captureCandidateSocket():Observable<boolean> {
    console.log(this.rtcPeerConnection);
    const self = this;
    return new Observable<boolean>((observer)=>{
      this.socket.on("candidate", (candidate) => {
        
        console.log(this.currentUser);
        console.log(candidate);
        var onIceCandidate = new RTCIceCandidate(candidate);
        console.log(onIceCandidate);
        console.log(self.rtcPeerConnection);
        self.rtcPeerConnection.addIceCandidate(onIceCandidate);
        
     })
     observer.next(true);
    })
  
  }


  captureAnswerSocket():Observable<boolean> {
    return new Observable<boolean>((observer)=>{
      this.socket.on("answer", (response) => {
        console.log(response);
        this.rtcPeerConnection.setRemoteDescription(response);
        this.startGathering=true;
        observer.next(true);
      });
    }
    );
  }

  getUserStream():Observable<any>{
    return new Observable<any>((observer)=>{
      observer.next(this.userStream);
    }) 
  }

  leaveRoom():Observable<boolean>{
    return new Observable<boolean>((observer)=>{
      this.socket.emit("leave",this.roomName);
      observer.next(true);
    }) 
  }

  getPeerLeaveEvent():Observable<boolean>{
    return new Observable<boolean>((observer)=>{

    this.socket.on("Peer disconnected",function(){
      if(this.rtcPeerConnection)
      {
        this.rtcPeerConnection.ontrack=null;
        this.rtcPeerConnection.onicecandidate=null;
        this.rtcPeerConnection.close();
        observer.next(true);
      }
    });
  });
}
}
