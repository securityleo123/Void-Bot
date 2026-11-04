const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { checkPermissions } = require('../../utils/permissions');
const { errorEmbed, infoEmbed } = require('../../utils/embeds');
const { getTicket } = require('../../utils/ticketStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('closeticket')
    .setDescription('Close and delete this ticket channel (generates transcript).')
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for closing').setRequired(false)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ManageChannels)) return;

    const ticket = getTicket(interaction.channel.id);
    if (!ticket) {
      return interaction.reply({ embeds: [errorEmbed('This channel is not a ticket.')], ephemeral: true });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_confirm_close_${reason.replace(/ /g, '_')}`)
        .setLabel('Confirm Close')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket_cancel_close')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({
      embeds: [infoEmbed('Close Ticket', `Are you sure you want to close this ticket?\n**Reason:** ${reason}`)],
      components: [row],
    });
  },
};
