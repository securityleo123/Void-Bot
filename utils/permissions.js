const { errorEmbed } = require('./embeds');

async function checkPermissions(interaction, requiredPerms) {
  if (!interaction.member.permissions.has(requiredPerms)) {
    await interaction.reply({
      embeds: [errorEmbed('You do not have permission to use this command.')],
      ephemeral: true,
    });
    return false;
  }
  return true;
}

async function checkBotPermissions(interaction, requiredPerms) {
  if (!interaction.guild.members.me.permissions.has(requiredPerms)) {
    await interaction.reply({
      embeds: [errorEmbed('I do not have the required permissions to do that.')],
      ephemeral: true,
    });
    return false;
  }
  return true;
}

module.exports = { checkPermissions, checkBotPermissions };
