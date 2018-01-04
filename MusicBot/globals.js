const fs = require("fs");
const Discord = require("discord.js");

let settings = require("./settings.json");

function cache() {
  let settings_string = JSON.stringify(settings, null, 2);
  fs.writeFile("settings.json", settings_string, (err) => {
    if (err) console.log("Failed to cache settings file.");
  });
}

let audio_connections = {};

module.exports = {
  cache: cache,
  settings: settings,
  Discord: Discord,
  connections: audio_connections,
  fs: fs
}
