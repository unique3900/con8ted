import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PiMicrophoneLight, PiMicrophoneSlash } from "react-icons/pi";
import { VscCallOutgoing } from "react-icons/vsc";
const Caller = () => {
  const { roomcode } = useParams();
  const navigate = useNavigate();
  const roomId = roomcode;
  let reloaded = false;
  const [callstatus, setCallstatus] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [connection, setConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);
    startCall(socket);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "identify-sender",
          roomId,
        })
      );
    };

    socket.onerror = (err) => {
      console.log("Something went wrong in sender side", err);
    };

    startCall(socket);

    return () => {
      socket.close();
    };
  }, [roomId, callstatus]);

  const startCall = async (socket: WebSocket) => {
    const pc = new RTCPeerConnection();
    setConnection(pc);
    setCallstatus(true);

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log(message.type);
      switch (message.type) {
        case "create-answer":
          await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
          break;
        case "ice-candidate":
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.send(
        JSON.stringify({
          type: "create-offer",
          sdp: pc.localDescription,
          roomId,
        })
      );
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            roomId,
          })
        );
      }
    };

    pc.ontrack = async (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      const remoteVideo = (await document.getElementById(
        "remoteVideo"
      )) as HTMLVideoElement;
      remoteVideo.srcObject = stream;
      await remoteVideo.play().catch(console.error);
    };

    try {
      const stream = await accessMediaStream(pc);
      setLocalStream(stream);
    } catch (error) {
      console.error("Error accessing media:", error);
    }
  };

  const accessMediaStream = async (pc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const localVideo = document.getElementById(
      "localVideo"
    ) as HTMLVideoElement;
    localVideo.srcObject = stream;

    localVideo.play().catch(console.error);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    return stream;
  };

  const muteCall = () => {
    if (localStream) {
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMuted(!muted);
    }
  };

  const endCall = async () => {
    setCallstatus(false);

    localStream?.getTracks().forEach((track) => track.stop());

    if (connection) {
      connection.close();
      setConnection(null);
    }
    if (socket) {
      socket.close();
      setSocket(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    const localVideo = document.getElementById(
      "localVideo"
    ) as HTMLVideoElement;
    const remoteVideo = document.getElementById(
      "remoteVideo"
    ) as HTMLVideoElement;
    if (localVideo) {
      localVideo.srcObject = null;
    }
    if (remoteVideo) {
      remoteVideo.srcObject = null;
    }

    navigate("/");
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-theme-blue to-indigo-600/80 flex flex-row gap-10 items-center justify-center px-10">
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      <div className="flex flex-col justify-center items-center gap-10">
        <video
          id="localVideo"
          autoPlay
          muted={muted}
          width={600}
          height={600}
          className="relative z-10"
        ></video>
      </div>

      <video id="remoteVideo" className="z-20" width={600} height={600}></video>

      <div className="absolute bottom-36 flex items-center gap-4">
        <button
          onClick={muteCall}
          className="bg-green-700 p-5  text-white rounded-full z-10"
        >
          {muted ? (
            <PiMicrophoneSlash size={22} />
          ) : (
            <PiMicrophoneLight size={22} />
          )}
        </button>
        <button
          onClick={endCall}
          className="bg-red-700 p-5  text-white rounded-full z-10"
        >
          <VscCallOutgoing size={22} />
        </button>
      </div>
    </div>
  );
};

export default Caller;
