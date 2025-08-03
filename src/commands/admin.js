const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  // The 'data' property defines the command's structure for Discord's API.
  // It uses SlashCommandBuilder to create a slash command.
  data: new SlashCommandBuilder()
    .setName('admin') // The command name as it will appear in Discord.
    .setDescription('Administrative commands for the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) // Only members with "Kick Members" permission can see and use this command.
    .addSubcommand(subcommand => // A subcommand for kicking a user.
      subcommand
        .setName('kick')
        .setDescription('Kicks a user from the server.')
        .addUserOption(option => // Adds an option to select a user.
          option.setName('target')
            .setDescription('The user to kick.')
            .setRequired(true)
        )
        .addStringOption(option => // Adds an option for the kick reason.
          option.setName('reason')
            .setDescription('The reason for kicking the user.')
            .setRequired(false) // This option is not required.
        )
    )
    .addSubcommand(subcommand => // A subcommand for banning a user.
      subcommand
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .addUserOption(option => // Adds an option to select a user.
          option.setName('target')
            .setDescription('The user to ban.')
            .setRequired(true)
        )
        .addStringOption(option => // Adds an option for the ban reason.
          option.setName('reason')
            .setDescription('The reason for banning the user.')
            .setRequired(false)
        )
    ),

  // The 'execute' function contains the logic for what the command does.
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getMember('target'); // Get the target member object.
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    // Check if the target user exists.
    if (!targetUser) {
      return interaction.reply({ content: 'That user is not a member of this server.', ephemeral: true });
    }

    // Check if the bot has permissions to interact with the target user.
    if (targetUser.id === interaction.guild.ownerId) {
      return interaction.reply({ content: 'I cannot kick or ban the server owner.', ephemeral: true });
    }
    
    if (interaction.member.roles.highest.position <= targetUser.roles.highest.position) {
        return interaction.reply({ content: 'You cannot perform this action on this user.', ephemeral: true });
    }

    // Handle the 'kick' subcommand.
    if (subcommand === 'kick') {
      try {
        await targetUser.kick(reason);
        await interaction.reply({
          content: `Successfully kicked ${targetUser.user.tag}. Reason: ${reason}`,
          ephemeral: false
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `I could not kick that user. Please check my permissions.`,
          ephemeral: true
        });
      }
    }

    // Handle the 'ban' subcommand.
    if (subcommand === 'ban') {
      try {
        await targetUser.ban({ reason });
        await interaction.reply({
          content: `Successfully banned ${targetUser.user.tag}. Reason: ${reason}`,
          ephemeral: false
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `I could not ban that user. Please check my permissions.`,
          ephemeral: true
        });
      }
    }
  },
};
