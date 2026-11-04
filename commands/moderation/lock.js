const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { checkPermissions } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel so only specified roles can send messages.')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel to lock (defaults to current)').setRequired(false))
    .addRoleOption(opt =>
      opt.setName('role1').setDescription('Role allowed to still send messages').setRequired(false))
    .addRoleOption(opt =>
      opt.setName('role2').setDescription('Another role allowed to send messages').setRequired(false))
    .addRoleOption(opt =>
      opt.setName('role3').setDescription('Another role allowed to send messages').setRequired(false))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for locking').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ManageChannels)) return;

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const allowedRoles = [
      interaction.options.getRole('role1'),
      interaction.options.getRole('role2'),
      interaction.options.getRole('role3'),
    ].filter(Boolean);

    try {
      // Deny @everyone from sending messages
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      }, { reason });

      // Allow specified roles
      for (const role of allowedRoles) {
        await channel.permissionOverwrites.edit(role, { SendMessages: true }, { reason });
      }

      const roleList = allowedRoles.length
        ? allowedRoles.map(r => r.toString()).join(', ')
        : 'None';

      await interaction.reply({
        embeds: [successEmbed('Channel Locked', `${channel} has been locked.\n**Reason:** ${reason}\n**Roles still allowed:** ${roleList}`)],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to lock channel: ${err.message}`)], ephemeral: true });
    }
  },
};
