const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { checkPermissions } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a previously locked channel.')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel to unlock (defaults to current)').setRequired(false))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for unlocking').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ManageChannels)) return;

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
      }, { reason });

      await interaction.reply({
        embeds: [successEmbed('Channel Unlocked', `${channel} has been unlocked.\n**Reason:** ${reason}`)],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to unlock: ${err.message}`)], ephemeral: true });
    }
  },
};
