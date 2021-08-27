import React from "react";

const TrackItem = ({ track, addToQueue }) => {
  return (
    <li className="search-item"
      onClick={() => {
        addToQueue(track);
      }}
    >
      <img src={track.img} alt="loading" />
      <div>
        <p className="title">{track.title}</p>
        <p className="artist ">{track.artist}</p>
      </div>
    </li>
  );
};

export default TrackItem;
