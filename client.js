const { useState } = require("react");


const [pc, setPc] = useState<RTCPeerConnection>(null);
const [socket, setSocket] = useState<SocketIOClient.I
