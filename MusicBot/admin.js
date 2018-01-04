const globals = require("./globals.js");

function handleAdminCommand(msg, args, func) {
  let mentions = msg.mentions.members;
  for(var item in Array.from(Object(mentions).values())) {
    let member = Array.from(Object(mentions).values())[item]
    switch (func) {
      case "muteVoice":
        muteUserVoice(msg, member);
        break;
      case "unmuteVoice":
        unmuteUserVoice(msg, member);
        break;
    }
  }
}

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

function silenceUser(msg, member) {
  deafenUserVoice(msg, member);
  muteUserVoice(msg, member);
}

function unsilenceUser(msg, member) {
  undeafenUserVoice(msg, member);
  unmuteUserVoice(msg, member);
}

function unbanUser(msg, member) {
  if(!msg.member.hasPermission("BAN_MEMBERS"))
    throw "Inadequate permissions.";
  member.guild.unban(member.user).then(member => { msg.channel.send("**Unbanned `" + msg.user.username + "`.**"); });
}

function softbanUser(msg, member) {
  banUser(msg, member);
  unbanUser(msg, member);
  purgeMessages(msg, 2, false);
  msg.channel.send("**Softbanned `" + msg.user.username + "`.**.");
}

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
