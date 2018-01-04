/**
 * @file bot.js
 * initializes the bot
 * redirects commands to @file command.js
 * NOTE MAIN SCRIPT
 */

// execute_command
const command = require("./command.js");
// Discord, settings
const globals = require("./globals");
const client = new globals.Discord.Client();

/**
 * @class Guild
 * stores guild specific information, currently only prefix
 */
class Guild {
  constructor() {
    this.prefix = '!';
  }
}

// message handler
client.on('message', message => {
  // checks to if is guild message and if it was not sent by a bot
  if(message.guild && !message.author.bot) {
    // creates a new guild obj when necessary
    if(!Object.keys(globals.settings.guilds).includes(message.guild.id))
      globals.settings.guilds[message.guild.id] = new Guild();
      globals.cache();
    // forwards to command handler if command starts with prefix
    if(message.content.startsWith(globals.settings.guilds[message.guild.id].prefix)) {
      command.execute(message, /* error callback -> */ (err) => {
        message.channel.send({embed: {
          color: 13369344,
          description: ":exclamation: **" + err + "** :exclamation:"
        }});
      });
    }
  }
});

// starts the bot
client.login(globals.settings.token);
