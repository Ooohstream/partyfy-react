/* express installation */

const express = require("express");
const path = require("path");
const app = express();

/* Body middleware */

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

/* socket.io installation */

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

/* Spotify API wrapper installation */

const spotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new spotifyWebApi({
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  redirectUri: `${process.env.adress}/callback`,
});

/* CONSTANTS */
/* Should be moved to another file */

const PORT = process.env.PORT || 5000;
const queue = [];
let currentPlayback = {};
let added = false;

/* Helper functions */
/* Should be moved to another file */

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

/* REACT connection */

app.use(express.static(path.join(__dirname, "client", "build"))));

/* OR */

// app.get("/", (req, res) => {
//   res.send("Hello world!");
// });

/* On connection event socket.io */

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("current-playback", currentPlayback);
  socket.emit("current-queue", queue);
});

/* Login to Spotify */

app.get("/login", (req, res) => {
  const scopes = [
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-read-playback-position",
  ];
  res.redirect(spotifyApi.createAuthorizeURL(scopes, "my-state"));
});

/* Spotify redirect endpoint */

app.get("/callback", (req, res) => {
  spotifyApi
    .authorizationCodeGrant(req.query.code)
    .then((data) => {
      /* Set tokens to make requests */

      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);

      console.log("Access token received!");

      /* Token refresh cycle */

      setInterval(() => {
        spotifyApi
          .refreshAccessToken()
          .then((data) => {
            console.log("The access token has been refreshed!");
            spotifyApi.setAccessToken(data.body["access_token"]);
          })
          .catch((err) => {
            console.log("Refresh error", err);
          });
      }, 3300000);

      /* Current playback cycle, talks to frontend */

      setInterval(() => {
        spotifyApi
          .getMyCurrentPlayingTrack()
          .then((data) => {
            if (data.statusCode === 200) {
              currentPlayback = {
                artist: data.body.item.artists[0].name,
                title: data.body.item.name,
                img: data.body.item.album.images[0].url,
                duration: data.body.item.duration_ms,
                progress: data.body.progress_ms,
              };

              let currentPlaybackDurationArr = millisToMinutesAndSeconds(
                currentPlayback.duration
              )
                .split(":")
                .map((el) => parseInt(el));
              let currentPlaybackProgressArr = millisToMinutesAndSeconds(
                currentPlayback.progress
              )
                .split(":")
                .map((el) => parseInt(el));

              if (
                currentPlaybackDurationArr[0] ===
                  currentPlaybackProgressArr[0] &&
                currentPlaybackProgressArr[1] >
                  currentPlaybackDurationArr[1] - 2 &&
                added === false
              ) {
                if (queue.length !== 0)
                  spotifyApi
                    .addToQueue(queue.shift().uri)
                    .then((data) => {
                      io.emit("current-queue", queue);
                    })
                    .catch((err) => {});
                added = true;
                setTimeout(() => {
                  added = false;
                }, 3000);
              }

              io.emit("current-playback", currentPlayback);
            } else if (data.statusCode === 204) {
              io.emit("current-playback", {});
            }
          })
          .catch((err) => {
            console.log("Error getting currently playing track", err);
          });
      }, 1000);
    })
    .catch((err) => {
      console.log("Authentication error", err);
    });

  /* Redirect to home page */

  res.redirect("http://192.168.1.65:5000");
});

/* Get a list of objects 

  title: 
  artist: 
  img: 
  uri: 

*/

app.get("/search", (req, res) => {
  spotifyApi
    .searchTracks(req.query.keyword)
    .then((data) => {
      res.json(
        data.body.tracks.items.map((track) => {
          return {
            title: track.name,
            artist: track.artists[0].name,
            img: track.album.images[0].url,
            uri: track.uri,
          };
        })
      );
    })
    .catch((err) => {
      res.json(err.body);
    });
});

/* Add track to queue */

app.post("/queue", (req, res) => {
  queue.push(req.body.track);
  io.emit("current-queue", queue);
  res.send("success!");
});

app.post("/queue_remove", (req, res) => {
  if (req.body.index > -1) {
    queue.splice(req.body.index, 1);
  }
  io.emit("current-queue", queue);
  res.send("success!")
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
