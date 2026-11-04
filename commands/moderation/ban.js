const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

const SUPPORT_INVITE = process.env.SUPPORT_SERVER_INVITE || 'https://discord.gg/KwgNyfauug';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server.')
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban').setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('delete_days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.BanMembers)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.BanMembers)) return;

    const target = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    if (target && !target.bannable) {
      return interaction.reply({ embeds: [errorEmbed('I cannot ban this user.')], ephemeral: true });
    }

    // DM the user before banning
    try {
      await user.send({
        embeds: [errorEmbed(`You have been **banned** from **${interaction.guild.name}**.\n**Reason:** ${reason}\n\nIf you believe this was a mistake, appeal here: ${SUPPORT_INVITE}`)],
      });
    } catch (_) { /* DM failed, continue anyway */ }

    try {
      await interaction.guild.members.ban(user, { reason, deleteMessageDays: deleteDays });
      await interaction.reply({
        embeds: [modEmbed('Member Banned', user, interaction.user, reason, { 'Messages Deleted': `${deleteDays} day(s)` })],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to ban: ${err.message}`)], ephemeral: true });
    }
  },
};
