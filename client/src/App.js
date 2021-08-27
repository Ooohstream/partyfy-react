import { React, useEffect, useState } from "react";
import { io } from "socket.io-client";
import CurrentPlayback from "./components/CurrentPlayback";
import Header from "./components/Header";
import Search from "./components/Search";
import Cookies from "universal-cookie";
import { nanoid } from "nanoid";

const App = () => {
  const [currentPlayback, setCurrentPlayback] = useState({});
  const [currentQueue, setCurrentQueue] = useState([]);

  useEffect(() => {
    let socket = io("/");
    socket.on("current-playback", (gotPlayback) => {
      setCurrentPlayback({ ...gotPlayback });
    });
    socket.on("current-queue", (queue) => {
      setCurrentQueue(queue);
    });

    const cookies = new Cookies();

    if (!cookies.get("id")) cookies.set("id", nanoid());
  }, []);

  return (
    <>
      <Header />
      <CurrentPlayback currentPlayback={currentPlayback} />
      <Search currentQueue={currentQueue} />
    </>
  );
};

export default App;
