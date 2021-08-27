import React from "react";

const Header = () => {
  return (
    <header>
      <div className="container">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1024px-Spotify_logo_without_text.svg.png"
          alt="spotify.logo"
        />
        <a href="http://192.168.1.65:5000/login">Become a host</a>
      </div>
    </header>
  );
};

export default Header;
