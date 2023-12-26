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