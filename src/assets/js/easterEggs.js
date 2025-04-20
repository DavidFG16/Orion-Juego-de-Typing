const purplePlanetElem = document.querySelector("#purple-planet");
const redPlanetElem = document.querySelector("#red-planet");
const TWITCH_LINK = "#";
const YOUTUBE_LINK = "#";
const DEFAULT_TARGET = "self";

purplePlanetElem.addEventListener("click", () => {
    window.open(TWITCH_LINK, DEFAULT_TARGET);
});

redPlanetElem.addEventListener("click", () => {
    window.open(YOUTUBE_LINK, DEFAULT_TARGET);
});