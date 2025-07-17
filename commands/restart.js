const {exec} = require("child_process");
const { SlashCommandBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('restart the bot'),
/** @param {import('discord.js').ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        
        if (interaction.user.id !== '843980934645809163') {
            interaction.reply({content:'You are NOT allowed to do that', ephemeral: true})
            return;
        }
        exec(`${config.command}`)
        await interaction.reply({content: 'restarted!', ephemeral: true})
    }
}