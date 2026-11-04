const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, modEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

const SUPPORT_INVITE = process.env.SUPPORT_SERVER_INVITE || 'https://discord.gg/KwgNyfauug';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server.')
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.KickMembers)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.KickMembers)) return;

    const target = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.reply({ embeds: [errorEmbed('That user is not in this server.')], ephemeral: true });
    if (!target.kickable) return interaction.reply({ embeds: [errorEmbed('I cannot kick this user.')], ephemeral: true });

    try {
      await user.send({
        embeds: [errorEmbed(`You have been **kicked** from **${interaction.guild.name}**.\n**Reason:** ${reason}\n\nRejoin or appeal: ${SUPPORT_INVITE}`)],
      });
    } catch (_) {}

    try {
      await target.kick(reason);
      await interaction.reply({ embeds: [modEmbed('Member Kicked', user, interaction.user, reason)] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to kick: ${err.message}`)], ephemeral: true });
    }
  },
};
