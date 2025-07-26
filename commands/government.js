const { SlashCommandBuilder } = require("discord.js");
const { candidateDB, creatorDB, hierarchyDB, idDB } = require("../database");

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
            
        )
        .addSubcommandGroup(subcommandgroup =>
            subcommandgroup
            .setName('hierarchy')
            .setDescription('Commands to do with the hierarchy of Croissantopia')
            .addSubcommand(subcommand =>
                subcommand
                .setName('list')
                .setDescription('List the hierarchy of Croissantopia')
            )
            .addSubcommand(subcommand =>
                subcommand
                .setName('add')
                .setDescription('Add/Change the hierarchy of Croissantopia')
                .addUserOption(user =>
                    user
                        .setName('user')
                        .setDescription('Choose a user')
                        .setRequired(true)
                )
                .addStringOption(string =>
                    string
                        .setName('title')
                        .setDescription("What is the user's government title")
                        .setRequired(true)
                )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('delete')
                    .setDescription('Delete a user from the hierarchy')
                    .addUserOption(user =>
                        user
                            .setName('user')
                            .setDescription('User')
                            .setRequired(true)
                    )
            )
        )
        .addSubcommandGroup(subcommandgroup =>
            subcommandgroup
                .setName('id')
                .setDescription("Add, Remove, or edit a citizen's id")
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('add')
                        .setDescription('Add an citizen id to a user')
                        .addUserOption(user =>
                            user
                                .setName('user')
                                .setDescription('User to add')
                                .setRequired(true)
                        )
                        .addStringOption(int =>
                            int
                                .setName('id')
                                .setDescription('id of the user')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('delete')
                        .setDescription('Delete an citizen id from a user')
                        .addUserOption(user =>
                            user
                                .setName('user')
                                .setDescription('The user to delete')
                                .setRequired(true)
                        )
                )
        ),

        /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        const isTrusted = await creatorDB.findOne({userID: interaction.user.id});
        const subcommand = interaction.options.getSubcommand();
        const subcommandgroup = interaction.options.getSubcommandGroup();

        if (subcommandgroup === 'candidates'){
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
                    content: 'You are not authorized to run this command',
                    ephemeral:true
                });
                return;
            }

            const user = interaction.options.getUser('candidate');
            const attempt = await candidateDB.findOneAndDelete({userID: user.id});
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
        } else if (subcommandgroup === 'hierarchy') {
            if (subcommand === 'add') {
                  if (!isTrusted) {
                interaction.reply({
                    content: 'You are not authorized to run this command',
                    ephemeral:true
                });
                return;
            }

            const user = interaction.options.getUser('user');
            const title = interaction.options.getString('title')

        const exists = await hierarchyDB.findOne({ userID: user.id});

        if (exists) {
            exists.title = title;
            await exists.save();
            interaction.reply(`${user}'s title is now ${title}`);
            return;
        }

        const entry = new hierarchyDB({ userID: user.id , title: title});
        await entry.save();

        interaction.reply(`${user} is now ${title}`)

            } else if (subcommand === 'delete') {
                if (!isTrusted) {
                    interaction.reply({
                        content: 'You are not authorized to run this command',
                        ephemeral:true
                    });
                    return;
                }

                const user = interaction.options.getUser('user');

                const deleted = await hierarchyDB.findOneAndDelete({userID: user.id})
                if (!deleted) {
                    interaction.reply({content: 'That user is not in the hierarchy', ephemeral: true});
                    return;
                }
                interaction.reply(`${user} was deleted from the hierarchy`);
            } else if (subcommand === 'list') {
                const candidates = await hierarchyDB.find();
            let message = `The current Government hierarchy is:\n`;

            for (const user of candidates) {

                message += `${user.title} - <@${user.userID}>\n`;
                
            }

            interaction.reply(message)
            }
        } else if (subcommandgroup === 'id') {
                
            if (subcommand === 'add') {
            const userid = interaction.options.getUser('user').id
            const idid = await interaction.options.getString('id')
                const exists = await idDB.findOne({
                    userID: userid
                });
                const exists2 = await idDB.findOne({
                    id: idid
                });

                if (exists2) {
                    await interaction.reply({ content:`Im sorry but you can not use that id`, ephemeral: true})
                    return;
                }

                if (!isTrusted && interaction.user.id !== userid) {
                    await interaction.reply({content: "*You* can not change Ids.", ephemeral: true})
                    return;
                }

                if (!isTrusted && exists) {
                    await interaction.reply({content: "*You* can not change Ids.", ephemeral: true})
                    return;
                }

                if (idid.length != 10) {
                    await interaction.reply({content: 'The id has to be 10 digits', ephemeral: true});
                    return;
                }
                const result = await idDB.findOneAndUpdate(
                    { userID: userid },
                    {userID: userid, id: idid},
                    { upsert: true, new: true }
                );

                    await interaction.reply({content: `<@${userid}> now has the id ${idid}`, ephemeral: true});


            } else if (subcommand === 'delete') {
                const userid = interaction.options.getUser('user').id
                if (!isTrusted) {
                    await interaction.reply({content: 'You are not authorized to do that', ephemeral: true});
                    return;
                }
                const result = await idDB.findOneAndDelete({
                    userID: userid
                });

                if (result){
                await interaction.reply(`Deleted <@${userid}>'s id`)
                } else {
                await interaction.reply({content: `<@${userid}> does not have an id`, ephemeral: true})
                }
            }
        }
    }
}