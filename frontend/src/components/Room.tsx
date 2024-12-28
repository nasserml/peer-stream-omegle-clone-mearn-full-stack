import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const arrse = [];
const URL = "http://localhost:3000";
const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState<boolean>(true);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);

  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  arrse.push(
    socket,
    sendingPc,
    receivingPc,
    remoteVideoTrack,
    setRemoteVideoTrack,
    remoteAudioTrack,
    setRemoteAudioTrack,
    remoteMediaStream
  );

  useEffect(() => {
    console.log("Socket on connect");
    const socket = io(URL);
    socket.on("send-offer", async ({ roomId }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        console.log("Receiving ice candidate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            roomId: roomId,
            type: "sender",
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        console.log("On Negotiation needed");

        const sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);
        socket.emit("offer", { sdp, roomId });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      socket.emit("answer", { sdp: "", roomId });
      console.log("remote sdp========================= offer", remoteSdp);
      console.log("Receiving offer");

      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      await pc.setLocalDescription(sdp);
      const stream = new MediaStream();

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteMediaStream(stream);
      // trickle Ice
      setReceivingPc(pc);
      pc.onicecandidate = async (e) => {
        console.log("On ice candidate on receiver");

        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            roomId: roomId,
            type: "receiver",
          });
        }
      };
      pc.ontrack = ({ track, type }) => {
        if (type === "audio") {
          // setRemoteAudioTrack(track);
          (remoteVideoRef.current?.srcObject as MediaStream)?.addTrack(track);
        } else {
          // setRemoteVideoTrack(track);
          (remoteVideoRef.current?.srcObject as MediaStream)?.addTrack(track);
        }

        remoteVideoRef.current?.play();
      };
      socket.emit("answer", {
        roomId,
        sdp,
      });
      setLobby(false);
    });

    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      console.log(roomId);
      setLobby(false);
      console.log("remote sdp========================= answer", remoteSdp);
      setSendingPc((pc) => {
        if (remoteSdp) {
          console.log("setting remote sdp");
          pc?.setRemoteDescription(remoteSdp as RTCSessionDescription);
        }
        return pc;
      });
      console.log("loop closed");
    });

    socket.on("lobby", () => {
      setLobby(false);
    });

    socket.on("add-ice-candidate", async ({ candidate, type }) => {
      console.log("adding ice candate from remote");

      console.log(type, candidate);

      if (type === "sender") {
        setSendingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setReceivingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });
    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      }
      localVideoRef.current.play();
    }
  }, [localVideoRef]);

  return (
    <div>
      hi {name}
      <video autoPlay width={400} height={400} ref={localVideoRef} />
      {lobby ? <p>Waiting to connect to you some one</p> : null}
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};

export default Room;
