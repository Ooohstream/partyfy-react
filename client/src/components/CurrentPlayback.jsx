import { React } from "react";
import Loader from "./UI/Loader/Loader";

const CurrentPlayback = ({ currentPlayback }) => {
  return (
    <div className="current-playback-container">
      {currentPlayback && Object.keys(currentPlayback).length !== 0 ? (
        <div className="current-playback">
          <img src={currentPlayback.img} alt="no_image" id="blurred" />
          <img src={currentPlayback.img} alt="no_image" id="cover"/>
          {/* eslint-disable-next-line */}
          <marquee>
            {currentPlayback.artist} - {currentPlayback.title}
          </marquee>
          <progress
            value={currentPlayback.progress}
            max={currentPlayback.duration}
          ></progress>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default CurrentPlayback;
