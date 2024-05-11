import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { UserservicesService } from 'src/app/services/userservices.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  currentUser: boolean = false;
  videoForm: FormGroup;
  userStream: MediaStreamTrack;
  muteToggle: boolean = false;
  hideToggle: boolean = false;

  constructor(private userservice: UserservicesService) {
  }

  ngAfterViewInit(): void {

    var user = document.getElementById("user-video") as HTMLVideoElement;
    this.userservice.offerSocket().subscribe((res) => {
      console.log(res);
    });
    this.userservice.captureCandidateSocket().subscribe((res) => {
      console.log(res);
    });

    this.userservice.captureAnswerSocket().subscribe((res) => {
      console.log(res);
    })

  }


  ngOnInit(): void {
    console.log("data");
    this.userservice.connectToServer().then((res) => {
      console.log("User connected to Server");
    }).catch((err) => {
      console.log("Unable to connect user to the server");
    })
  }

  joinCall() {
    var roomName = document.getElementById("roomName") as HTMLInputElement;
    if (roomName.value == "") {
      console.log("Invalid roomname");
    }
    else {
      console.log(roomName);
      this.userservice.captureJoin(roomName.value).subscribe((res) => {
        if (res.status == ("created")) {
          this.currentUser = true;
          this.userStream = res.stream;
          console.log(this.currentUser);

          console.log("A user has been added to a room");
        }
        else if (res.status == ("full")) {
          this.currentUser = false;
          console.log("Unable to join")
        }
        else {
          console.log("EMITTTED");
          this.userStream = res.stream;

        }


      });


    }
  }

  muteUserMicrophone() {
    var mute = document.getElementById("mute");
    this.muteToggle = !this.muteToggle;

    if (this.muteToggle) {
      this.userStream.enabled = false;
      mute.textContent = "Unmute"
    }
    else {
      this.userStream.enabled = true;
      mute.textContent = "Mute";
    }
    console.log(this.userStream);


  }
  hideCamera() {
    var hide = document.getElementById("hide");
    if (this.hideToggle) {
      //  this.videostream.enabled=false;streams.getTracks()[1]
      hide.textContent = "Unmute"
    }
    else {
      this.userStream.enabled = true;
      hide.textContent = "Mute";
    }

  }

  leaveCall(){
    var userVideo = document.getElementById("user-video") as HTMLVideoElement;
      //  this.videostream.enabled=false;streams.getTracks()[1]
      this.userservice.leaveRoom().subscribe((res)=>{
        // userVideo.srcObject.getTracks()[0].stop();
        userVideo.style.display="none";
        console.log("User disconnected");
      })
    
    
  }

}
