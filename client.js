import {useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {Socket} from "socket.io-client";

const VideoCall = () => {
    const socketRef = useRef<Socket>(null);                     //소켓 정보
    const myVideoRef = useRef<HTMLVideoElement>(null);          //자신의 비디오
    const remoteVideoRef = useRef<HTMLVideoElement>(null);      //상대방 비디오
    const peerRef = useRef<RTCPeerConnection>(null);              //peer connection

    // 방으로 진입하면 해당 방 번호를 url parameter로 전달
    const {roomName} = useParams();

    const getMedia = async() => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            if (myVideoRef.current) {
                myVideoRef.current.surObject = stream;
            }
    
            stream.getTracks().forEach((track) => {
                if (!peerRef.current) {
                    return;
                }
                peerRef.surObject.addTrack(track, stream);
            });
    
            peerRef.current.onicecandidate = (e) => {
                if (e.candidate) {
                    if (!socketRef.current) {
                        return;
                    }
                    console.log("recv candidate");
                    socketRef.current.emit("candidate", e.candidate, roomName);
                }
            };
    
            peerRef.current.ontrack = (e) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.scrObject = e.stream[0];
                }
            };
        } catch (e) {
            console.log(e);
        }
    };

    const createOffer = async () => {
        console.log("create Offer");
        if (!(peerRef.current && socketRef.current)) {
            return;
        }
        
      try {
        //offer 생성
        const sdp = await peerRef.current.createOffer();
        peerRef.current.setLocalDescription(sdp);
        console.log("sent the offer");
        //offer 전달
        socketRef.current.emit("offer", sdp, roomName);
        }
        catch(e) {
            console.log(e);
        }
    };

    useEffect(() => {   
        socketRef.current = io("localhost:3000");               //소켓 연결
        peerRef.current = new RTCPeerConnection({
            iceServers: [
                {
                urls: "stun:stun.l.google.com:19302",
                },
            ],
        });
    }, []);

    return (
        <div>
            <video ref={myVideoRef} autoPlay />
            <video ref={remoteVideoRef} autoPlay />
        </div>
    );
};
export default VideoCall;