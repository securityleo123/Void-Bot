const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, modEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove a timeout from a member.')
    .addUserOption(opt => opt.setName('user').setDescription('User to unmute').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ModerateMembers)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.ModerateMembers)) return;

    const target = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });

    try {
      await target.timeout(null, reason);
      await interaction.reply({ embeds: [modEmbed('Member Unmuted', user, interaction.user, reason)] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to unmute: ${err.message}`)], ephemeral: true });
    }
  },
};
