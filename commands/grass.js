const { SlashCommandBuilder} = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('grass')
        .setDescription('A temporary command to scare WKoA'),

    async execute(interaction) {
        interaction.reply('https://media.istockphoto.com/id/531410080/photo/blade-of-grass-isolated-on-white.jpg?s=612x612&w=0&k=20&c=Y45keOv0JEZNDF78ylvmeslH4PaO3JgtCcazcRCrXOc=\n || <@724416180097384498> ||')
    }
}