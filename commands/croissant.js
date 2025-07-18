const { SlashCommandBuilder } = require("discord.js");
const {CroissantEmojiDB, CroissantMessagesDB, creatorDB} = require("../database");
module.exports = {
    data: new SlashCommandBuilder()
            .setName('croissant')
            .setDescription('croissant main command')
            .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('Add an emoji to the database (creator only)')
            .addStringOption(string =>
                string
                .setName('emoji')
                .setDescription('select emoji to add')
                .setRequired(true))
            .addStringOption(string =>
                string
                .setName('name')
                .setDescription('Name of the Emoji ( Will display in users dropdown)')
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('delete')
            .setDescription('delete a emoji from the database')
            .addStringOption(string => 
                string
                .setName('emoji')
                .setDescription('What emoji to delete out of the database')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('delete-messages')
            .setDescription('Deletes all messages in the database from all users that include a specified emoji')
            .addStringOption(string =>
                string
                .setName('emoji')
                .setDescription("What emoji to delete all messages with")
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('leaderboard')
            .setDescription('Who has send the most croissants')
            .addStringOption(string =>
                string
                .setName('emoji-name')
                .setDescription('What croissant to pull up the leaderboard for')
                .setRequired(false)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
        
         .setName('stats')
            .setDescription('Shows the amount of croissants you has sent')
            .addStringOption(string =>
                string
                .setName('emoji-name')
                .setDescription('What emoji do you want to look up')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addUserOption(user =>
                user
                .setName('member')
                .setDescription('Specify a user')
                .setRequired(false))),


    /** @param {import('discord.js').ChatInputCommandInteraction} interaction */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guild = interaction.guild.id
        const isTrusted = interaction.memberPermissions.toArray().includes("ManageEmojisAndStickers");
               if (subcommand === 'stats') {
            const member = interaction.options.getUser('member');
            const emojiText = interaction.options.getString('emoji-name');
            const emojiDB = (await CroissantEmojiDB.findOne({ name: emojiText, guildID: guild}).lean());

            if (!emojiDB) {
                interaction.reply({
                    content: 'That emoji does not exist in the database',
                    ephemeral: true
                });
                return;
            }
                const allEmoji = await CroissantMessagesDB.find({name:emojiDB.name, guildID: guild}).sort({count: -1}).lean();
                const ranking = allEmoji.findIndex(entry => entry.userID === (member == null ? interaction.user.id : member.id));
                const result = await CroissantMessagesDB.findOne({

                     userID: member == null
                     ? interaction.user.id
                     : member.id,
                     name: `${emojiDB.name}`,
                     guildID: guild
                });
                
                if (result) {
                    const date = new Date(result.timestamp).toLocaleDateString();
                    interaction.reply({content: ` ${member == null
                     ? interaction.user
                     : `<@${member.id}>`} has sent ${result.count} ${emojiDB.emoji} since ${date} and is ranked #${ranking + 1 } in ${emojiDB.emoji}`});
                } else {
                    interaction.reply(` ${member == null
                     ? interaction.user
                     : `<@!${member.id}>`} has not sent any ${emojiDB.emoji}`);
                }





        } else if (subcommand === 'add') {
            if (!isTrusted) {
                interaction.reply({
                    content: 'Only authorized users can add emojis',
                    ephemeral: true
                });
                return;
            }
            const emojiID = interaction.options.getString('emoji');
            const emojiText = interaction.options.getString('name');
            const exists = await CroissantEmojiDB.findOne({
                name: emojiText,
                emoji: emojiID,
                guildID: guild
            });
            //I could have used findOneAndUpdate but I would rather have to use delete then be able to change everything from the add command

            if (exists) {
                interaction.reply({
                    content: 'This emoji is already in the database. Please choose another',
                    ephemeral: true
                });
                return;
            }

            const newEntry = new CroissantEmojiDB({emoji: emojiID, name: emojiText, guildID: guild});
            await newEntry.save();

            interaction.reply({ content: `Successfully saved ${emojiID} with text \`${emojiText}\` to the database!`})

        } else if (subcommand === 'delete') {
            if (!isTrusted) {
                interaction.reply({
                    content: 'You are not authorized to run this command',
                    ephemeral: true
                })
                return;
            }
            const emojiName = interaction.options.getString('emoji');

            const entry = await CroissantEmojiDB.findOneAndDelete(
                {emoji: emojiName, guildID: guild}
            )
            if (!entry) {
                interaction.reply({
                    content: 'That emoji does not exist',
                    ephemeral: true
                });
                return;
            }
            interaction.reply(`Successfully deleted \`${emojiName}\` from the database`)
        } else if (subcommand === 'delete-messages') {
            const emoji = interaction.options.getString('emoji');
            if (!isTrusted) {
                interaction.reply({
                    content: 'You are not authorized to run this command',
                    ephemeral: true
                });
                return;
            }
            await interaction.deferReply();
            const result = await CroissantMessagesDB.deleteMany({ guildID: guild, type: emoji });

            if (result.deletedCount === 0) {
                interaction.editReply({
                    content: 'Invalid emoji or no messages found',
                    ephemeral: true
                });
                return;
            }


            interaction.editReply({
                content: `Successfully deleted ${result.deletedCount} User's message(s) for emoji: ${emoji}`,
                ephemeral: true
            });


        } else if (subcommand === 'leaderboard') {
            const emojiName = interaction.options.getString('emoji-name');
            if (emojiName === null) {


                const top10 = await CroissantMessagesDB.find({ guildID: guild}).sort({count: -1}).limit(10).lean();
                let message = `🏆 Top 10 croissanters since 7/9/25\n\n`//INSERT THE DATE THAT THIS CODE IS IMPLEMENTED
                for (let i = 0; i <  top10.length; i++) {
                const userID = top10[i].userID;
                const count = top10[i].count;
                const type = await CroissantEmojiDB.findOne({ name: top10[i].name, guildID: top10[i].guildID});;
                if (i === 0) {
                    message += `<:gold:1393301072122220575> ${i + 1}. <@!${userID}> — ${count} ${type.emoji}\n`;    
                } else if (i === 1) {
                    message += `<:silver:1393301087494209556> ${i + 1}. <@!${userID}> — ${count} ${type.emoji}\n`;
                } else if (i === 2) {
                    message += `<:bronze:1393301100307939460> ${i + 1}. <@!${userID}> — ${count} ${type.emoji}\n`;
                } else {
                    message += `${i + 1}. <@!${userID}> — ${count} ${type.emoji}\n`;    
                }
                
            }
            interaction.reply({content: message});

            } else {
            const emojiEntry = await CroissantEmojiDB.findOne({ name: emojiName, guildID: guild });

            if (!emojiEntry) {
                interaction.reply({
                    content: 'That is not a valid emoji',
                    ephemeral: true
                });
                return;
            }

            const emojiname = emojiEntry.name;
            const sorted = await CroissantMessagesDB
                .find({ name: emojiname, guildID: guild })
                .sort({ count: -1 }) 
                .limit(10)
                .lean();


            if (sorted.length === 0) {
                return interaction.reply({ content: 'No data found for that emoji.', ephemeral: true });
            }

            let message = `🏆 Top 10 croissanters for ${emojiName} since 7/9/25:\n\n`;

            for (let i = 0; i < sorted.length; i++) {
                const userID = sorted[i].userID;
                const count = sorted[i].count;
                if (i === 0) {
                    message += `<:gold:1393301072122220575> ${i + 1}. <@!${userID}> — ${count} ${emojiEntry.emoji}\n`;    
                } else if (i === 1) {
                    message += `<:silver:1393301087494209556> ${i + 1}. <@!${userID}> — ${count} ${emojiEntry.emoji}\n`;
                } else if (i === 2) {
                    message += `<:bronze:1393301100307939460> ${i + 1}. <@!${userID}> — ${count} ${emojiEntry.emoji}\n`;
                } else {
                    message += `${i + 1}. <@!${userID}> — ${count} ${emojiEntry.emoji}\n`;   
                }
            }

            interaction.reply({ content: message });

        }
        }
    }
}