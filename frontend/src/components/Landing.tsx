import React, { useEffect, useRef, useState } from "react";
import Room from "./Room";

const Landing = () => {
  const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [joined, setJoined] = useState(false);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // Media stream
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);

    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);
  if (!joined) {
    return (
      <div className="flex flex-col items-center gap-3">
        <video autoPlay ref={videoRef} />
        <div>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 rounded-xl border-black"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  ml-5 rounded-xl"
            onClick={()=> {
              setJoined(true);
            }}
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <Room
      name={name}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};

export default Landing;
