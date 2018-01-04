/**
 * @file audio.js
 * handles audio requests from @file command.js
 * manages audio clients
 */

// audio connections
const globals = require("./globals.js");
// audioclient and song
const player = require("./player.js");
// purge
const admin = require("./admin.js");

/**
 * Function to play music based on a query
 * @param Message, @param String
 * NOTE starts playing audio if possible
 */

function play(msg, query) {
  if(!msg.member.voiceChannel)
    throw "Please connect to a voice channel to play music.";
  if(!Object.keys(globals.connections).includes(msg.guild.id))
    globals.connections[msg.guild.id] = new player.AudioClient(msg.member.voiceChannel);
  // adds itself to queue
  new player.Song(query, msg);
}

/**
 * Function to handle generic audio related commands
 * @param Message, @param String, @param String
 * NOTE handled functions include:
 * @func Pause
 * @func Resume
 * @func Skip
 * @func printQueue
 * @func Current
 * @func Stop
 * @func loopqueue
 * @func clearqueue
 * @func shuffle
 */

function handleAudioCommand(msg, args, func) {
  if(args != "")
    throw "Too many parameters.";
  if(!Object.keys(globals.connections).includes(msg.guild.id))
    throw "Unable to perform function as server does not have a current audio connection.";
  let audioClient = globals.connections[msg.guild.id];
  switch (func) {
    // pause audio
    case "pause":
      audioClient.Pause();
      break;
    // resume audio
    case "resume":
      audioClient.Resume();
      break;
    // skip to next
    case "skip":
      audioClient.Stop(true);
      break;
    // print queue
    case "queue":
      printQueue(msg, audioClient.queue);
      break;
    // now playing
    case "current":
      msg.channel.send({embed: {title:"Now Playing", description: audioClient.queue[0].name, color: 16536917}})
      break;
    // stop audio
    case "stop":
      audioClient.Stop(false);
      break;
    // loopqueue
    case "loop":
      audioClient.loop = !audioClient.loop;
      msg.channel.send("**Loopqueue set to `" + (audioClient.loop ? "Enabled" : "Disabled") + "`.**")
      break;
    // clearqueue
    case "clear":
      audioClient.queue = [audioClient.queue[0]];
      msg.channel.send("**The queue has been successfully cleared.**");
      break;
    // shufflequeue
    case "shuffle":
      audioClient.queue = [audioClient.queue[0]] + shuffleArray(audioClient.queue.slice(1));
      msg.channel.send("**The queue has been shuffled.**\n*Your new queue:*");
      printQueue(msg, audioClient.queue);
      break;
  }
}

/**
 * Function allows for shuffling of Javascript array (in this case for the queue)
 * @param Array
 * NOTE credit to https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Function to change volume
 * @param Message, @param String
 */

function updateVolume(msg, args) {
  if(isNaN(args))
    throw "Invalid volume.";
  let volume = Number(args) / 20;
  // volume measured 1 - 20 (0 = 0, 20 = 1)
  if(volume > 1 || volume < 0)
    throw "Invalid volume."
  if(!Object.keys(globals.connections).includes(msg.guild.id))
    throw "Unable to perform function as server does not have a current audio connection.";
  if(!globals.connections[msg.guild.id].isPlaying)
    throw "Unable to act on nonexistant voice connection.";
  globals.connections[msg.guild.id].volume = volume;
  globals.connections[msg.guild.id].dispatcher.setVolume(volume);
}

/**
 * Function to print out all elements in the queue
 * @param Message, @param Array
 * NOTE sends an embed
 */

function printQueue(msg, queue) {
  let queueString = "";
  for(var item in queue) {
    item = queue[item];
    queueString += item.name + "\n";
  }
  let embed = {
    title: "Queue",
    description: queueString,
    // Rezonate red
    color: 16536917
  }
  msg.channel.send({embed: embed});
}

/**
 * Function to remove an element from the queue
 * @param Message, @param String
 * NOTE position starts counting @ 1 for user simplicity so (-1) to values
 */

function removeQueueItem(msg, args) {
  if(isNaN(args)) {
    throw "Invalid position."
  }
  let pos = Number(args);
  if(pos % 1 != 0)
    throw "Invalid position";
  let queue = globals.connections[msg.guild.id].queue;
  if(pos < 2 || pos > queue.length)
    throw "Invalid position.";
  msg.channel.send("**Song** `" + queue[pos - 1].name + "` **removed from queue.**");
  queue.splice(pos - 1, 1)
}

/**
 * Function to move an element and insert it at an alternate position in the queue
 * @param Message, @param String
 * NOTE position starts counting @ 1 for user simplicity so (-1) to values
 */

function moveQueueItem(msg, args) {
  let arg1 = args.split(" ")[0], arg2 = args.split(" ")[1];
  if(isNaN(arg1) || isNaN(arg2))
    throw "Invalid position.";
  let pos1 = Number(arg1);
  let pos2 = Number(arg2);
  if(pos1 % 1 != 0 || pos2 % 1 != 0)
    throw "Invalid position";
  let queue = globals.connections[msg.guild.id].queue;
  if(pos1 < 2 || pos1 > queue.length || pos2 < 2 || pos2 > queue.length)
    throw "Invalid position.";
  msg.channel.send("**Song** `" + queue[pos1 - 1].name + "` **moved to**`" + pos2 + "`**.**");
  let elem = queue[pos1 - 1];
  queue.splice(pos1 - 1, 1);
  // account for position after splice
  if(pos2 > pos1)
    queue.splice(pos2 - 2, 0, elem);
  else
    queue.splice(pos2 - 1, 0, elem);
}

/**
 * Function to swap to queue items
 * @param Message, @param String
 * NOTE position starts counting @ 1 for user simplicity so (-1) to values
 */

function swapQueueItems(msg, args) {
  let arg1 = args.split(" ")[0], arg2 = args.split(" ")[1];
  if(isNaN(arg1) || isNaN(arg2))
    throw "Invalid position.";
  if(arg1 == arg2)
    throw "Invalid positions.";
  let pos1 = Number(arg1);
  let pos2 = Number(arg2);
  if(pos1 % 1 != 0 || pos2 % 1 != 0)
    throw "Invalid position";
  let queue = globals.connections[msg.guild.id].queue;
  if(pos1 < 2 || pos2 < 2 || pos1 > queue.length || pos2 > queue.length)
    throw 'Invalid position';
  msg.channel.send("**Swapped** `" + queue[pos1 - 1].name + "` **with** `" + queue[pos2 - 1].name + "`** in the play queue.**");
  // quick swap (elem2 is holder)
  var elem2 = queue[pos2 - 1];
  queue[pos2 - 1] = queue[pos1 - 1];
  queue[pos1 - 1] = elem2;
}

/**
 * Functions not exported:
 * @func printQueue
 */
module.exports = {
  play: play,
  handleAudioCommand: handleAudioCommand,
  updateVolume: updateVolume,
  removeQueueItem: removeQueueItem,
  moveQueueItem: moveQueueItem,
  swapQueueItems: swapQueueItems
}
