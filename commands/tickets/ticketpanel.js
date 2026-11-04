const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { checkPermissions } = require('../../utils/permissions');
const { errorEmbed } = require('../../utils/embeds');

const TICKET_PANEL_CHANNEL = '1565948743457439785';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Post the ticket panel in the support server.')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel to post the panel in (defaults to configured channel)').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ManageGuild)) return;

    const channel = interaction.options.getChannel('channel') ||
      interaction.guild.channels.cache.get(TICKET_PANEL_CHANNEL) ||
      interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎫 Support Tickets')
      .setDescription('Need help? Click the button below to open a support ticket.\n\nOur team will assist you as soon as possible.')
      .setFooter({ text: 'Void Support System' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_create')
        .setLabel('Open a Ticket')
        .setEmoji('🎫')
        .setStyle(ButtonStyle.Primary),
    );

    try {
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ embeds: [{ color: 0x57F287, description: `✅ Ticket panel posted in ${channel}.` }], ephemeral: true });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to post panel: ${err.message}`)], ephemeral: true });
    }
  },
};
