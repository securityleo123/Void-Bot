const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

const SUPPORT_INVITE = process.env.SUPPORT_SERVER_INVITE || 'https://discord.gg/KwgNyfauug';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban then immediately unban a user to delete their messages.')
    .addUserOption(opt => opt.setName('user').setDescription('User to softban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('delete_days').setDescription('Days of messages to delete (1-7, default 7)').setMinValue(1).setMaxValue(7).setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.BanMembers)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.BanMembers)) return;

    const target = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 7;

    if (target && !target.bannable) {
      return interaction.reply({ embeds: [errorEmbed('I cannot softban this user.')], ephemeral: true });
    }

    try {
      await user.send({
        embeds: [errorEmbed(`You have been **softbanned** from **${interaction.guild.name}** (banned and unbanned to clear messages).\n**Reason:** ${reason}\n\nAppeal here: ${SUPPORT_INVITE}`)],
      });
    } catch (_) {}

    try {
      await interaction.guild.members.ban(user, { reason: `Softban: ${reason}`, deleteMessageDays: deleteDays });
      await interaction.guild.members.unban(user, 'Softban unban');
      await interaction.reply({
        embeds: [modEmbed('Member Softbanned', user, interaction.user, reason, { 'Messages Deleted': `${deleteDays} day(s)` })],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to softban: ${err.message}`)], ephemeral: true });
    }
  },
};
