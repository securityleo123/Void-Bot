const { EmbedBuilder } = require('discord.js');

const COLORS = {
  success: 0x57F287,
  error: 0xED4245,
  warn: 0xFEE75C,
  info: 0x5865F2,
  mod: 0x2B2D31,
};

function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle('❌ Error')
    .setDescription(description)
    .setTimestamp();
}

function modEmbed(action, target, moderator, reason, extra = {}) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.mod)
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
      { name: 'Moderator', value: `${moderator.tag}`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided' },
    )
    .setTimestamp();
  for (const [name, value] of Object.entries(extra)) {
    embed.addFields({ name, value: String(value) });
  }
  return embed;
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

module.exports = { successEmbed, errorEmbed, modEmbed, infoEmbed, COLORS };
