/**
 * @file command.js
 * handles all incoming commands
 * delivers command information to appropriate functions
 * executes commands
 */

// all general exports
const general = require("./general.js");
// all audio exports
const audio = require("./audio.js");
// all admin exports
const admin = require("./admin.js");
// execute
const sandbox = require("./sandbox.js");

// dictionary to map all command keywords to command functions
let command_dictionary = {
  "prefix": general.set_prefix,
  "help": general.print_commands,
  "about": general.about,
  "exec": execute_code,

  "play": audio.play,
  "pause": (msg, args) => { audio.handleAudioCommand(msg, args, "pause") },
  "resume": (msg, args) => { audio.handleAudioCommand(msg, args, "resume") },
  "skip": (msg, args) => { audio.handleAudioCommand(msg, args, "skip") },
  "stop": (msg, args) => { audio.handleAudioCommand(msg, args, "stop") },
  "volume": audio.updateVolume,
  "queue": (msg, args) => { audio.handleAudioCommand(msg, args, "queue") },
  "current": (msg, args) => { audio.handleAudioCommand(msg, args, "current") },
  "loopqueue": (msg, args) => { audio.handleAudioCommand(msg, args, "loop") },
  "clearqueue": (msg, args) => { audio.handleAudioCommand(msg, args, "clear") },
  "remove": audio.removeQueueItem,
  "swap": audio.swapQueueItems,
  "move": audio.moveQueueItem,
  "shuffle": (msg, args) => { audio.handleAudioCommand(msg, args, "shuffle") },

  "kick": (msg, args) => { admin.handleAdminCommand(msg, args, "kick") },
  "ban": (msg, args) => { admin.handleAdminCommand(msg, args, "ban") },
  "unban": (msg, args) => { admin.handleAdminCommand(msg, args, "unban") },
  "softban": (msg, args) => { admin.handleAdminCommand(msg, args, "softban") },
  "mute": (msg, args) => { admin.handleAdminCommand(msg, args, "muteVoice") },
  "deafen": (msg, args) => { admin.handleAdminCommand(msg, args, "deafen") },
  "silence": (msg, args) => { admin.handleAdminCommand(msg, args, "silence") },
  "unmute": (msg, args) => { admin.handleAdminCommand(msg, args, "unmuteVoice") },
  "undeafen": (msg, args) => { admin.handleAdminCommand(msg, args, "undeafen") },
  "unsilence": (msg, args) => { admin.handleAdminCommand(msg, args, "unsilence") },
  "purge": (msg, args) => { admin.purge(msg, args, true); }
}

/**
 * Function to handle and resolve all command input
 * @param msg, @param function (callback)
 */

function execute_command(msg, callback) {
  let content = msg.content.slice(1, msg.content.length), cmd = content.split(" ")[0], args = content.slice(cmd.length + 1, content.length);
  if(Object.keys(command_dictionary).includes(cmd)) {
    try {
      command_dictionary[cmd](msg, args);
    }
    catch (err) {
      callback(err);
    }
  }
}

/**
 * Function to deliver executable user code to sandbox
 * @param Message, @param String
 */

function execute_code(msg, args) {
  msg.channel.send(sandbox.execute(args));
}

/**
 * Functions not exported:
 * @func execute_code
 * Aliases:
 * @func execute_command -> @func execute
 */

module.exports = {
  execute: execute_command
}
