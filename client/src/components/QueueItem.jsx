import React from "react";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const QueueItem = ({ track, removeFromQueue, index }) => {
  return (
    <li className="queue-item">
      <img src={track.img} alt="loading" />
      <div>
        <p className="title">{track.title}</p>
        <p className="artist ">{track.artist}</p>
      </div>
      {track.id === cookies.get("id") && (
        <span
          onClick={() => {
            removeFromQueue(index);
          }}
        >
          &#10006;
        </span>
      )}
    </li>
  );
};

export default QueueItem;
