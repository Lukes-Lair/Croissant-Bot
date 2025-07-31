const { SlashCommandBuilder } = require("discord.js");
const { WelcomeDB } = require("../database");

module.exports = {
  /** @type {import('discord.js').SlashCommandBuilder} */
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Add, edit, or disable welcome messages")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("join")
        .setDescription("add or edit the message when a user joins")
        .addStringOption((string) =>
          string
            .setName("message")
            .setDescription(
              "What will be the welcome message. ${user} = user who joined. ${guild} = server name"
            )
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('leave')
        .setDescription('add or edit the message when a user leaves the server')
        .addStringOption(string =>
          string
            .setName('message')
            .setDescription(
              "What will be the message. ${user} = user who joined. ${guild} = server name"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("disable").setDescription("Disable welcome messages")
    ),

  /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    if (!interaction.memberPermissions.toArray().includes("ManageChannels")) {
      interaction.reply({
        content: "You are not authorized to do that",
        ephemeral: true,
      });
      return;
    }
    const guild = interaction.guild.id;
    const messageText = interaction.options.getString("message");
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "join") {
      await WelcomeDB.findOneAndUpdate(
        { guildID: guild, type: 'join'},
        { guildID: guild, message: messageText },
        { upsert: true, new: true }
      );

      interaction.reply(
        `I will now welcome people with the message \`${messageText}\``
      );
    } else if (subcommand === "disable") {
      if (!interaction.memberPermissions.toArray().includes("ManageChannels")) {
        interaction.reply({
          content: "You are not authorized to do that",
          ephemeral: true,
        });
        return;
      }

      await WelcomeDB.findOneAndDelete({
        guildID: guild,
        type: 'join'
      });

      interaction.reply("Disabled Welcome Messages");
    } else if (subcommand === 'leave') {
      await WelcomeDB.findOneAndUpdate(
        { guildID: guild, type: 'leave'},
        { guildID: guild, message: messageText },
        { upsert: true, new: true }
      );

      interaction.reply(
        `I will now say farewell to people with the message \`${messageText}\``
      );
    }
  },
};
