const { SlashCommandBuilder } = require("discord.js");
const interaction = require("../interaction");
const { WelcomeDB } = require("../database");

module.exports = {
    /** @type {import('discord.js').SlashCommandBuilder} */
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Add, edit, or disable welcome messages')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('add or edit the welcome channel')
                .addStringOption(string =>
                    string
                        .setName('message')
                        .setDescription('What will be the welcome message. Use ${user} = user who joined. Use ${guild} = server name')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable welcome messages')
        ),

    /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        if (!interaction.memberPermissions.toArray().includes("ManageChannels")) {
            interaction.reply({
                content: 'You are not authorized to do that',
                ephemeral: true
            })
            return;
        }
        const guild = interaction.guild.id;
        const messageText = interaction.options.getString('message');
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            
            await WelcomeDB.findOneAndUpdate(
                { guildID: guild },
                { guildID: guild, message: messageText },
                { upsert: true, new: true });

            interaction.reply(`I will now welcome people with the message \`${messageText}\``);

        } else if (subcommand === 'disable') {

            if (!interaction.memberPermissions.toArray().includes("ManageChannels")) {
                interaction.reply({
                    content: 'You are not authorized to do that',
                    ephemeral: true
                })
                return;
            }

            await WelcomeDB.findOneAndDelete({
                guildID: guild
            })

            interaction.reply("Disabled Welcome Messages");
        }

    }
};

