const { SlashCommandBuilder } = require("discord.js");
const { candidateDB, creatorDB } = require("../database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('government')
        .setDescription('See all info about Croissantopia government')
        .addSubcommandGroup(subcommandgroup =>
            subcommandgroup
            .setName('candidates')
            .setDescription('See the candidates for the current election')
            .addSubcommand(subcommand =>
                subcommand
                .setName('add')
                .setDescription('add a candidate to the DB')
                .addUserOption(user => 
                    user
                    .setName('user')
                    .setDescription('user')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand =>
                subcommand
                .setName('delete')
                .setDescription('delete a candidate from the DB')
                .addUserOption(user => 
                    user
                    .setName('candidate')
                    .setDescription('Candidate')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand =>
                subcommand
                .setName('list')
                .setDescription('List the candidates for the current election')
            )
            
        ),

        /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        const isTrusted = await creatorDB.findOne({userID: interaction.user.id});
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'add') {

            if (!isTrusted){
                interaction.reply({
                    content: 'Only authorized users can add candidates',
                    ephemeral:true
                });
                return;
            }

        const user = interaction.options.getUser('user');

        const exists = await candidateDB.findOne({ userID: user.id});

        if (exists) {
            interaction.reply({
                content: 'That candidate is already added',
                ephemeral:true
            })
            return;
        }

        const entry = new candidateDB({ userID: user.id });
        entry.save();

        interaction.reply(`${user} has been saved as a candidate`)
        } else if (subcommand === 'delete') {

            if (!isTrusted) {
                interaction.reply({
                    content: 'You are not authorized to run this command'
                });
                return;
            }

            const user = interaction.options.getUser('candidate');
            const attempt = await candidateDB.findOneAndDelete({userID: user.ids});
            if (attempt == null) {
                interaction.reply({
                    content: 'That is not a valid candidate ',
                    ephemeral: true
                });
                return;
            }
            interaction.reply(`${user} is no longer a candidate`);
        } else if (subcommand === 'list') {

            const candidates = await candidateDB.distinct("userID");
            let message = `The current election candidates are:\n`;

            for (const user of candidates) {

                message += `<@${user}>\n`;
                
            }

            interaction.reply(message)

        }

    }
}