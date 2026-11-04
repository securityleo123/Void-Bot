const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server.')
    .addStringOption(opt => opt.setName('user_id').setDescription('User ID to unban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.BanMembers)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.BanMembers)) return;

    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const ban = await interaction.guild.bans.fetch(userId);
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({
        embeds: [successEmbed('User Unbanned', `**${ban.user.tag}** has been unbanned.\n**Reason:** ${reason}`)],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to unban: ${err.message}`)], ephemeral: true });
    }
  },
};
