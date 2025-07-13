const {CroissantEmojiDB, CroissantMessagesDB} = require("../database");
const {PermissionsBitField, Colors, MessageFlags} = require("discord.js")

module.exports = {
    /** @param {import("discord.js").Message} message */
    async executeMessage(message, client) {
        
        if (message.author.bot) return;
        const allEmojis = (await CroissantEmojiDB.find().lean()).filter(emojis => message.content.includes(emojis.emoji));
        if (allEmojis.length !== 0) {
            const user = message.author.id;
            for(const emoji of allEmojis){
                if (emoji.guildID == message.guild.id){
                await CroissantMessagesDB.findOneAndUpdate(
                    {userID: user, name: emoji.name, guildID: message.guild.id},
                    {$inc: { count: message.content.split(emoji.emoji).length -1 }},
                    {upsert: true, new:true, setDefaultsOnInsert: true}
                );
                }
            }
        }
        if (message.content.toLowerCase() === "hehe") {
            message.channel.send("HEHEHEHEHEHE");
        } 
    }
}
