const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Manage channels.')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a new channel.')
        .addStringOption(opt => opt.setName('name').setDescription('Channel name').setRequired(true))
        .addStringOption(opt =>
          opt.setName('type').setDescription('Channel type').setRequired(false)
            .addChoices(
              { name: 'Text', value: 'text' },
              { name: 'Voice', value: 'voice' },
              { name: 'Announcement', value: 'news' },
            ))
        .addChannelOption(opt => opt.setName('category').setDescription('Category to place channel in').setRequired(false))
        .addStringOption(opt => opt.setName('topic').setDescription('Channel topic').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Delete a channel.')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to delete').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ManageChannels)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.ManageChannels)) return;

    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const name = interaction.options.getString('name');
      const typeStr = interaction.options.getString('type') || 'text';
      const category = interaction.options.getChannel('category');
      const topic = interaction.options.getString('topic');

      const typeMap = { text: ChannelType.GuildText, voice: ChannelType.GuildVoice, news: ChannelType.GuildAnnouncement };
      const channelType = typeMap[typeStr];

      try {
        const channel = await interaction.guild.channels.create({
          name,
          type: channelType,
          parent: category?.id,
          topic: topic || undefined,
        });
        await interaction.reply({ embeds: [successEmbed('Channel Created', `Created ${channel} (${typeStr})`)] });
      } catch (err) {
        await interaction.reply({ embeds: [errorEmbed(`Failed: ${err.message}`)], ephemeral: true });
      }
    }

    if (sub === 'delete') {
      const channel = interaction.options.getChannel('channel');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      try {
        await channel.delete(reason);
        await interaction.reply({ embeds: [successEmbed('Channel Deleted', `#${channel.name} has been deleted.\n**Reason:** ${reason}`)] });
      } catch (err) {
        await interaction.reply({ embeds: [errorEmbed(`Failed: ${err.message}`)], ephemeral: true });
      }
    }
  },
};
