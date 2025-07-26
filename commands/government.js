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
            const userobj = interaction.options.getUser('user')
            if (userobj.bot) {await interaction.reply({content: 'Bots cant vote silly', ephemeral: true}); return;}
            let idid =  Math.floor(Math.random() * 9000000000) + 1000000000;
                const exists = await idDB.findOne({
                    userID: userid
                });
                
                let exists2 = await idDB.findOne({
                    id: idid
                });
                if (!isTrusted && userobj.id !== interaction.user.id) {
                    await interaction.reply({content: "*You* can not change voter ids.", ephemeral: true})
                    return;
                }
                

                    while (exists2) {
                        idid =  Math.floor(Math.random() * 9000000000) + 1000000000;
                        exists2 = await idDB.findOne({
                            id: idid
                        });
                    }

                const result = await idDB.findOneAndUpdate(
                    { userID: userid },
                    {userID: userid, id: idid},
                    { upsert: true, new: true }
                );
                    if (userobj.id !== interaction.user.id) {
                        await interaction.reply({content: `<@${userid}> now has a new voter id`, ephemeral: true});
                    } else {
                        await interaction.reply({content: `<@${userid}> now has the voter id of ||${idid}||`, ephemeral: true});
                    }
                    
                    await userobj.send(`Your Croissantopia Voter ID is now ||${idid}||. This is the number you will use when voting\n-# This is confidential info and should not be shared.\n-# If you believe a mistake has been made please contact a member of yeast or the current president`);


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
                await interaction.reply(`Deleted <@${userid}>'s voter id`)
                } else {
                await interaction.reply({content: `<@${userid}> does not have a voter id`, ephemeral: true})
                }
            }
        }
    }
}