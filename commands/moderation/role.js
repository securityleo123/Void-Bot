const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { checkPermissions, checkBotPermissions } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member.')
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addRoleOption(opt => opt.setName('role').setDescription('Role to toggle').setRequired(true)),

  async execute(interaction) {
    if (!await checkPermissions(interaction, PermissionFlagsBits.ManageRoles)) return;
    if (!await checkBotPermissions(interaction, PermissionFlagsBits.ManageRoles)) return;

    const target = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!target) return interaction.reply({ embeds: [errorEmbed('User not in server.')], ephemeral: true });
    if (role.managed) return interaction.reply({ embeds: [errorEmbed('That role is managed by an integration.')], ephemeral: true });
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ embeds: [errorEmbed('That role is higher than or equal to my highest role.')], ephemeral: true });
    }

    try {
      if (target.roles.cache.has(role.id)) {
        await target.roles.remove(role);
        await interaction.reply({ embeds: [successEmbed('Role Removed', `Removed ${role} from ${target.user.tag}.`)] });
      } else {
        await target.roles.add(role);
        await interaction.reply({ embeds: [successEmbed('Role Added', `Added ${role} to ${target.user.tag}.`)] });
      }
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed: ${err.message}`)], ephemeral: true });
    }
  },
};
