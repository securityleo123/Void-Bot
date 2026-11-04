const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Void is online as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);
    client.user.setPresence({
      activities: [{ name: '/help | void-bot.xyz', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
