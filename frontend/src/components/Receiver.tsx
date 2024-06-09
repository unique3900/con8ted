import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Receiver = () => {
  const { roomcode } = useParams();
  const navigate = useNavigate();
  const roomId = roomcode;
  const [muted, setMuted] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connection, setConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "identify-receiver",
          roomId,
        })
      );
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    startReceiving(socket);

    return () => {
      socket.close();
    };
  }, [roomId]);

  const startReceiving = async (socket: WebSocket) => {
    const pc = new RTCPeerConnection();
    setConnection(pc);

    pc.ontrack = async (event) => {
      const [stream] = await event.streams;
      await setRemoteStream(stream);

      const remoteVideo = document.getElementById(
        "remoteVideo"
      ) as HTMLVideoElement;
      remoteVideo.srcObject = stream;
      remoteVideo.play();
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "create-offer":
          handleOfferMessage(pc, socket, message.sdp);
          break;
        case "ice-candidate":
          await pc
            .addIceCandidate(new RTCIceCandidate(message.candidate))
            .catch(console.error);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
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

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected") {
        endCall();
      }
    };

    try {
      accessMediaStream(pc);
    } catch (error) {
      console.error("Error accessing media:", error);
    }
  };

  const endCall = () => {
    if (connection) {
      connection.close();
      setConnection(null);
    }
    if (socket) {
      socket.close();
      setSocket(null);
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
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
  };

  const accessMediaStream = async (pc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const localVideo = document.getElementById(
      "localVideo"
    ) as HTMLVideoElement;
    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.play()
    }
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
    setLocalStream(stream);
  };

  const handleOfferMessage = async (
    pc: RTCPeerConnection,
    socket: WebSocket,
    sdp: RTCSessionDescriptionInit
  ) => {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.send(
        JSON.stringify({
          type: "create-answer",
          sdp: answer,
          roomId,
        })
      );
    } catch (error) {
      console.error("Error handling offer message:", error);
    }
  };

  const muteCall = () => {
    if (localStream) {
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMuted(!muted);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-theme-blue to-indigo-600/80 flex flex-row gap-10 items-center justify-center px-10">
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      <div className="flex flex-col justify-center items-center gap-10">
        <video
          id="localVideo"
          autoPlay
          muted={muted}
          className="relative z-10"
        ></video>
        <div className="flex items-center gap-4">
          <button
            onClick={muteCall}
            className="bg-green-700 p-5  text-white rounded-full z-10"
          >
            Mute
          </button>
          <button
            onClick={endCall}
            className="bg-red-700 p-5  text-white rounded-full z-10"
          >
            End
          </button>
        </div>
      </div>

      <video id="remoteVideo" autoPlay controls className="z-20"></video>
    </div>
  );
};

export default Receiver;
