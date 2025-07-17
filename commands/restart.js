const {exec} = require("child_process");
const { SlashCommandBuilder } = require("discord.js");
require("dotenv").config();
const path = require("path")

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
        exec(path.join("..", "restart.sh"), async (error) => {
            if (error) {
                console.error(`❌ Error during restart:\n${error.message}`);
                 await interaction.reply({content: `Restart Failed! error: ${error}`, ephemeral: true})
                return;
            } else {
                await interaction.reply({content: 'restarted!', ephemeral: true})
            }
    
        })

    }
}