/**
 * @file admin.js
 * handles all administrative commands
 * recieves commands from @file command.js
 */

 /**
  * Function to handle and resolve ald administrative commands
  * @param Message, @param String, @param String
  * NOTE ignores purge
  */

function handleAdminCommand(msg, args, func) {
  // gets the mentions
  let mentions = msg.mentions.members;
  // iterate though mentions
  for(var item in Array.from(Object(mentions).values())) {
    let member = Array.from(Object(mentions).values())[item];
    switch (func) {
      // mute voice
      case "muteVoice":
        muteUserVoice(msg, member);
        break;
      // unmute voice
      case "unmuteVoice":
        unmuteUserVoice(msg, member);
        break;
      // kick user
      case "kick":
        kickUser(msg, member);
        break;
      // ban user
      case 'ban':
        banUser(msg, member);
        break;
      // unban user
      case 'unban':
        unbanUser(msg, member);
        break;
      // deafen user
      case 'deafen':
        deafenUserVoice(msg, member);
        break;
      // undeafen user
      case "undeafen":
        undeafenUserVoice(msg, member);
        break;
      // silence a user
      case "silence":
        silenceUser(msg, member);
      // unsilence
      case "unsilence":
        unsilenceUser(msg, member);
        break;
      // ban and unban user
      case 'softban':
        softbanUser(msg, member);
        break;
    }
  }
}

/**
 * Each function handles each own admin command
 * @param Message, @param GuildMember
 * NOTE each command checks its own permissions
 */

function kickUser(msg, member) {
  if(!msg.member.hasPermission("KICK_MEMBERS"))
    throw "Inadequate permissions.";
  member.kick().then(member => { msg.channel.send("**Kicked `" + member.user.username + "`**."); });
}

function banUser(msg, member) {
  if(!msg.member.hasPermission("BAN_MEMBERS"))
    throw "Inadequate permissions.";
  member.ban().then(member => { msg.channel.send("**Banned `" + member.user.username + "`**."); });
}

function muteUserVoice(msg, member) {
  if(!msg.member.hasPermission("MUTE_MEMBERS"))
    throw "Inadequate permissions.";
  member.setMute(true).then(member => { msg.channel.send("**Muted `" + member.user.username + "`**."); });
}

function unmuteUserVoice(msg, member) {
  if(!msg.member.hasPermission("MUTE_MEMBERS"))
    throw "Inadequate permissions.";
  member.setMute(false).then(member => { msg.channel.send("**Unmuted `" + member.user.username + "`**."); });
}

function deafenUserVoice(msg, member) {
  if(!msg.member.hasPermission("DEAFEN_MEMBERS"))
    throw "Inadequate permissions.";
  member.setDeaf(true).then(member => { msg.channel.send("**Deafened `" + member.user.username + "`**."); });
}

function undeafenUserVoice(msg, member) {
  if(!msg.member.hasPermission("DEAFEN_MEMBERS"))
    throw "Inadequate permissions.";
  member.setDeaf(false).then(member => { msg.channel.send("**Undeafened `" + member.user.username + "`**."); });
}

// mute and deafen
function silenceUser(msg, member) {
  deafenUserVoice(msg, member);
  muteUserVoice(msg, member);
}

// unmute and undeafen
function unsilenceUser(msg, member) {
  undeafenUserVoice(msg, member);
  unmuteUserVoice(msg, member);
}

function unbanUser(msg, member) {
  if(!msg.member.hasPermission("BAN_MEMBERS"))
    throw "Inadequate permissions.";
  member.guild.unban(member.user).then(member => { msg.channel.send("**Unbanned `" + msg.user.username + "`.**"); });
}

// ban and unban user
function softbanUser(msg, member) {
  banUser(msg, member);
  unbanUser(msg, member);
  // cleanup
  purgeMessages(msg, 2, false);
  msg.channel.send("**Softbanned `" + msg.user.username + "`.**.");
}

/**
 * Function to purge a set number of messages
 * @param Message, @param String, @param Boolean
 * NOTE function checks its own permissions
 * NOTE function maxes out at 100 messages
 */

function purgeMessages(msg, args, isUser) {
  if(!msg.member.hasPermission("MANAGE_MESSAGES") && isUser)
    throw "Inadequate permissions.";
  if(isNaN(args))
    throw "Invalid message count.";
  let count = Number(args) + 1;
  if(count > 100 || count < 0 || !Number.isInteger(count))
    throw "Invalid message count.";
  msg.channel.fetchMessages({limit: count}).then(messages => {
    let msg_array = Array.from(Object(messages).values());
    for(var message in msg_array) {
      msg_array[message].delete();
    }
  });
}

module.exports = {
  handleAdminCommand: handleAdminCommand,
  purge: purgeMessages
}
