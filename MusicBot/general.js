/**
 * @file general.js
 * handles all commands related to general actions
 * manages some globals
 */

// prefix, fs
const globals = require("./globals.js");

/**
 * Function to update the guild-specific prefix
 * @param Message, @param String
 */

function set_prefix(msg, args) {
  // checks to verify if one has permissions to perform actions
  if(!msg.member.hasPermission("ADMINISTRATOR")) {
    throw "Inadequate permissions";
  }
  msg.channel.send("Prefix changed from `" + globals.settings.guilds[msg.guild.id].prefix + "` to `" + args + "` by **" + msg.author.username + "**.");
  globals.settings.guilds[msg.guild.id].prefix = args;
  // caches globals
  globals.cache();
}

/**
 * Function to print commands for the help command
 * @param Message, @param String
 */

function print_commands(msg, args) {
  // ensures that too many args were not passed
  if(args != "")
    throw "Too many arguments.";
  // read in the commands from the commands.txt file and sends embed
  let command;
  globals.fs.readFile("commands.txt", "utf8", (err, data) => {
    if (err) throw err;
    command = String(data).split("~");
    send_command_embed(msg, command)
  });
}

/**
 * Function to send command embed
 * @param Message, @param String
 */

function send_command_embed(msg, command) {
  let embed = new globals.Discord.RichEmbed();
  embed.setTitle("Commands");
  embed.setColor(16536917);
  embed.setDescription("The prefix for your server is `" + globals.settings.guilds[msg.guild.id].prefix + "`.");
  embed.addField("General", command[0]);
  embed.addField("Music", command[1]);
  embed.addField("Admin", command[2]);
  msg.author.send({embed: embed});
}

/**
 * Function to print about page
 * @param Message, @param String
 */

function about(msg, args) {
  // ensures that the correct amount of args were passed
  if(args != "")
    throw "Too many arguments.";
  let embed = new globals.Discord.RichEmbed();
  embed.setTitle("About");
  embed.setColor(16536917);
  embed.setDescription("Rezonate is a general purpose music bot with some administrative functionality included.");
  // NOTE all fields are inline
  embed.addField("Name", "Rezonate", true);
  embed.addField("Developer", "ComedicChimera#3451", true);
  embed.addField("Framework", "Discord.js V.11", true);
  // get CPU usage
  const startUsage = process.cpuUsage();
  const now = Date.now();
  // spin for 500 ms
  while(Date.now() - now < 500);
  const endUsage = process.cpuUsage(startUsage);
  embed.addField("CPU Usage", (endUsage.user + endUsage.system) + "μs", true);
  // calculate memory usage
  embed.addField("Memory Usage", String(Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100) + "MB", true);
  embed.addField("Platform", process.platform.toUpperCase(), true);
  msg.channel.send({embed: embed});
}

/**
 * Functions not exported:
 * @func send_command_embed
 */

module.exports = {
  set_prefix: set_prefix,
  print_commands: print_commands,
  about: about
}
