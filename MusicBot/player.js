/**
 * @file player.js
 * plays back audio
 * handles commands from @file audio.js
 * handles audio clients and songs
 * NOTE MAIN SCRIPT
 */

// all
const ytdl = require("ytdl-core");
// all
const youtube_search = require("youtube-search");
// audio connections
const globals = require("./globals.js");

/**
 * @class Song
 * stores Song information and initializes song stream
 */

class Song {
  constructor(req, msg) {
    this.GetData(req, msg);
  }

  GetData(request, msg) {
    youtube_search(request, {maxResults: 1, key: "--"}, (err, results) => {
      if (err) throw err;
      this.name = results[0].title;
      this.link = results[0].link;
      globals.connections[msg.guild.id].AddToQueue(this, msg);
    });
  }
}

/**
 * @class AudioClient
 * handles to transfer, playback, and management of music
 */

class AudioClient {
  /**
   * @param VoiceChannel
   */
  constructor(channel) {
    // main song queue
    this.queue = [];
    // variable to check if audio is currently being streamed
    this.isPlaying = false;
    // variable to check if bot is in voice channel
    this.joined = false;
    // the voice channel
    this.channel = channel;
    // says if AudioClient is in loopqueue mode
    this.loop = false;
    // sets the default volume
    this.volume = 0.25;
  }

  /**
   * Function to initialize connections
   * @param Message
   */

  Play(msg) {
    msg.channel.send("**Now Playing:** `" + this.queue[0].name + "`**.**");
    if(!this.joined) {
      this.channel.join().then(connection => {
        this.connection = connection;
        this.joined = true;
        this.SendAudio(msg); });
    }
    else {
      this.SendAudio(msg);
    }
  }

  /**
   * Function to push audio over an audio channel
   * @param Message
   */

  SendAudio(msg) {
    // gets the audio stream from youtube
    const stream = ytdl(this.queue[0].link, {filter: "audioonly"});
    // creates a playback stream and starts pushing audio
    this.dispatcher = this.connection.playStream(stream);
    this.isPlaying = true
    // setup default volume
    this.dispatcher.setVolume(this.volume);
    // pushes through the queue and decides what to do
    this.dispatcher.on('end', () => {
      this.isPlaying = false;
      // changes queue behavior on loopqueue
      if(this.loop) {
        var shift_song = this.queue.shift();
        this.queue.push(shift_song);
      }
      else {
        this.queue.shift();
      }
      if(this.queue.length > 0) {
        this.Play(msg);
      }
      else
        this.Leave();
    });
  }

  /**
   * Function add song to queue and start playing if necessary
   * @param Song, @param Message
   */

  AddToQueue(song, msg) {
    if(this.queue.length < 1) {
      this.queue.push(song);
      this.Play(msg);
    }
    else {
      msg.channel.send("`" + song.name + "` **added to queue.**");
      this.queue.push(song);
    }
  }

  /**
   * Function to stop playing audio/skip audio
   * @param Boolean
   */

  Stop(skip) {
    // blocks if the client is not playing
    if(this.isPlaying) {
      // closes the audio stream, empties the queue and stops playing
      if(!skip) {
        this.queue = [];
        this.Leave();
        this.dispatcher.end();
      }
      // shifts onward
      else
        this.dispatcher.end();
    }
  }

  /**
   * Function to pause audio stream
   */

  Pause() {
    if(this.isPlaying) {
      this.dispatcher.pause();
    }
  }

  /**
   * Function to resume audio stream
   */

  Resume() {
    if(this.isPlaying) {
      this.dispatcher.resume();
    }
  }

  /**
   * Function to end audio stream, stop playback and delete audio client
   * because it is no longer necessary
   */

  Leave() {
    this.channel.leave();
    this.joined = false;
    this.isPlaying = false;
    delete globals.connections[this.channel.guild.id];
  }
}

// all classes exported
module.exports = {
  AudioClient: AudioClient,
  Song: Song
}
