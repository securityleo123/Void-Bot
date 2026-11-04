const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../utils/embeds');
const { createTicket, getTicket, deleteTicket } = require('../utils/ticketStore');

const TRANSCRIPTS_CHANNEL = '1565950123769339944';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // ── Slash commands ──────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`Error in /${interaction.commandName}:`, err);
        const reply = { embeds: [errorEmbed('An unexpected error occurred.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
      return;
    }

    // ── Buttons ─────────────────────────────────────────────────────────────
    if (!interaction.isButton()) return;
    const { customId, guild, member, channel } = interaction;

    // Open ticket
    if (customId === 'ticket_create') {
      const existing = guild.channels.cache.find(
        c => c.name === `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      );
      if (existing) {
        return interaction.reply({ embeds: [errorEmbed(`You already have an open ticket: ${existing}`)], ephemeral: true });
      }

      try {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
            { id: member.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: guild.members.me.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
          ],
        });

        createTicket(ticketChannel.id, member.user.id, guild.id);

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🎫 Ticket Opened')
          .setDescription(`Hello ${member}, welcome to your ticket!\n\nPlease describe your issue and a staff member will assist you shortly.`)
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_confirm_close_Staff closed ticket')
            .setLabel('Close Ticket')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger),
        );

        await ticketChannel.send({ content: `${member}`, embeds: [embed], components: [row] });
        await interaction.reply({ embeds: [successEmbed('Ticket Created', `Your ticket has been created: ${ticketChannel}`)], ephemeral: true });
      } catch (err) {
        await interaction.reply({ embeds: [errorEmbed(`Failed to create ticket: ${err.message}`)], ephemeral: true });
      }
      return;
    }

    // Cancel close
    if (customId === 'ticket_cancel_close') {
      await interaction.update({ embeds: [successEmbed('Cancelled', 'Ticket close cancelled.')], components: [] });
      return;
    }

    // Confirm close
    if (customId.startsWith('ticket_confirm_close_')) {
      const reason = customId.replace('ticket_confirm_close_', '').replace(/_/g, ' ');
      const ticket = getTicket(channel.id);
      if (!ticket) return interaction.reply({ embeds: [errorEmbed('Not a ticket channel.')], ephemeral: true });

      await interaction.update({ embeds: [{ color: 0xFEE75C, description: '⏳ Generating transcript and closing...' }], components: [] });

      // Generate transcript
      try {
        const messages = await channel.messages.fetch({ limit: 100 });
        const sorted = [...messages.values()].reverse();
        const lines = sorted.map(m => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content || '[embed/attachment]'}`);
        const transcript = lines.join('\n');

        const transcriptChannel = guild.channels.cache.get(TRANSCRIPTS_CHANNEL);
        if (transcriptChannel) {
          const { AttachmentBuilder } = require('discord.js');
          const buffer = Buffer.from(transcript, 'utf8');
          const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}-${Date.now()}.txt` });

          const summaryEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📋 Ticket Transcript')
            .addFields(
              { name: 'Channel', value: channel.name, inline: true },
              { name: 'Opened by', value: `<@${ticket.userId}>`, inline: true },
              { name: 'Closed by', value: `${interaction.user.tag}`, inline: true },
              { name: 'Reason', value: reason },
            )
            .setTimestamp();

          await transcriptChannel.send({ embeds: [summaryEmbed], files: [attachment] });
        }

        deleteTicket(channel.id);
        setTimeout(() => channel.delete(`Ticket closed: ${reason}`).catch(() => {}), 3000);
      } catch (err) {
        console.error('Transcript error:', err);
        deleteTicket(channel.id);
        setTimeout(() => channel.delete(`Ticket closed: ${reason}`).catch(() => {}), 3000);
      }
      return;
    }
  },
};
