const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, modEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

const DURATIONS = {
  '60s': 60_000,
  '5m': 5 * 60_000,
  '10m': 10 * 60_000,
  '1h': 60 * 60_000,
  '6h': 6 * 60 * 60_000,
  '12h': 12 * 60 * 60_000,
  '1d': 24 * 60 * 60_000,
  '7d': 7 * 24 * 60 * 60_000,
  '28d': 28 * 24 * 60 * 60_000,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member.')
    .addUserOption(opt => opt.setName('user').setDescription('User to mute').setRequired(true))
    .addStringOption(opt =>
      opt.setName('duration')
        .setDescription('Duration of the mute')
        .setRequired(true)
        .addChoices(
          { name: '60 seconds', value: '60s' },
          { name: '5 minutes', value: '5m' },
          { name: '10 minutes', value: '10m' },
          { name: '1 hour', value: '1h' },
          { name: '6 hours', value: '6h' },
          { name: '12 hours', value: '12h' },
          { name: '1 day', value: '1d' },
          { name: '7 days', value: '7d' },
          { name: '28 days', value: '28d' },
        ))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ModerateMembers)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.ModerateMembers)) return;

    const target = interaction.options.getMember('user');
    const user = interaction.options.getUser('user');
    const durationKey = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const ms = DURATIONS[durationKey];

    if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in server.')], ephemeral: true });
    if (!target.moderatable) return interaction.reply({ embeds: [errorEmbed('I cannot mute this user.')], ephemeral: true });

    try {
      await target.timeout(ms, reason);
      await interaction.reply({
        embeds: [modEmbed('Member Muted', user, interaction.user, reason, { Duration: durationKey })],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to mute: ${err.message}`)], ephemeral: true });
    }
  },
};
