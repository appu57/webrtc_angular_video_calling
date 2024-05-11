# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.




Capture READY EVENT
Ice candidate
Public ID : When user1 wants to call user2 we will have an IP through which connection will be established between two users . User1 is provided with a public IP by the STUN SERVER every browser will have that STUN SERVER. 

RTCPeer Connection : Interface represents a WebRTC connection between local computer(self) and a remote peer(from the computer that we can get a call from) . It provides methods to connect to remote peer , maintain and monito the connection , and close connection once its no longer needed

Constructor : RTCPeerConnection() returns a new RTC Peer connection representing a connection between peers
Media Tracks : Using RTCPeerConnection().onTrack and other function of RTCPeerConnection we will be able to hear and see them but they wont be able to see or hear us if we dont send our video/audio streams to peer



READY ( FROM LOCAL )  => sends ready event to create peer connection by setting localdescription of offer and settin media tracks  to user B => OFFER( REMOTE SITE )
OFFER( FROM REMOTE ) => on recieving offer and the remote host sends answer(whether to pick or decline) to signalling server by setting answer to remote description and also emits "candidate" from user B to user A .
Now user A sets remote description because while calling userB , userA will not know details of userB , but when user B recieves call user B will know local and remote so it sets both description and send ANSWER .

Now based on answer sent by userB , user A sets remote description. Now both userA and userB has both remote and local description set . And both peer starts gathering the ice candidate(userA iceCandidate for userB and userB for userA) . Then each peer adds ice candidates to the RTCPeerConnection

UserA ( local ) => userB (local and remote ) = ON ANSWER EVENT EMIT > userA(remot)



 