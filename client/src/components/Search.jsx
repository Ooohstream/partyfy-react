import { React, useState, useEffect } from "react";
import TrackList from "./TrackList";
import TrackItem from "./TrackItem";
import QueueItem from "./QueueItem";
import Form from "./UI/Form";
import axios from "axios";
import { DebounceInput } from "react-debounce-input";
import Cookies from "universal-cookie";
import { TransitionGroup, CSSTransition } from "react-transition-group";

const Search = ({ currentQueue }) => {
  const [foundTracks, setFoundTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.length > 0) searchTracks(searchQuery);
    else setFoundTracks([]);
  }, [searchQuery]);

  const searchTracks = async (keyword) => {
    const response = await axios.get(`/search?keyword=${keyword}`);

    if (response.data.error) return;

    setFoundTracks(response.data);
  };

  const addToQueue = async (track) => {
    setFoundTracks([]);
    setSearchQuery("");
    const cookie = new Cookies();
    const response = await axios.post(`/queue`, {
      track: { ...track, id: cookie.get("id") },
    });

    if (response.data.error) return;
  };

  const removeFromQueue = async (index) => {
    const response = await axios.post(`/queue_remove`, { index: index });

    if (response.data.error) return;
  };

  return (
    <div className="search">
      <Form searchTracks={searchTracks}>
        <DebounceInput
          type="text"
          placeholder="Search"
          value={searchQuery}
          onFocus={(e) => (e.target.placeholder = "Search query")}
          onBlur={(e) => (e.target.placeholder = "Search")}
          debounceTimeout={1000}
          onChange={(e) => {
            e.preventDefault();
            setSearchQuery(e.target.value);
          }}
        />
      </Form>
      {foundTracks.length !== 0 ? (
        <TrackList>
          <TransitionGroup>
            {foundTracks.map((track) => (
              <CSSTransition
                key={track.uri}
                timeout={500}
                classNames="animation-item"
              >
                <TrackItem
                  track={track}
                  addToQueue={addToQueue}
                />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </TrackList>
      ) : (
        <TrackList>
          <TransitionGroup>
            {currentQueue.map((track, index) => (
              <CSSTransition
                key={track.uri.slice(0, -1)}
                timeout={500}
                classNames="animation-item"
              >
                <QueueItem
                  track={track}
                  index={index}
                  removeFromQueue={removeFromQueue}
                />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </TrackList>
      )}
    </div>
  );
};

export default Search;
