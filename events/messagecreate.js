const {CroissantEmojiDB, CroissantMessagesDB} = require("../database");
let spam = [];
let spam2 = []
module.exports = {
    /** @param {import("discord.js").Message} message */
    async executeMessage(message, client) {
        if (message.author.bot) return;
        if (message.content.toLowerCase() === "hehe") {
            await message.channel.send("HEHEHEHEHEHE");
        } 
        const allEmojis = (await CroissantEmojiDB.find({ guildID: message.guild.id}).lean()).filter(emojis => message.content.includes(emojis.emoji));
        if (allEmojis.length === 0) return;
            spam.push(message.author.id);
            if (spam.filter(item => item === message.author.id).length >= 3) {
                return;
            }
            const user = message.author.id;
            for(const emoji of allEmojis){
                const inc = message.content.split(emoji.emoji).length -1
                await CroissantMessagesDB.findOneAndUpdate(
                    {userID: user, name: emoji.name, guildID: message.guild.id},
                    {$inc: { count: inc > 5 ? 0 : inc  }},
                    {upsert: true, new:true, setDefaultsOnInsert: true}
                );
            } 
    },
    deleteFromSpam() {
        if (spam.length !== 0) {
        for (let i = 0; i < spam.length; i++) {
            if (spam2.findIndex(s => s === spam[i]) == -1) {
                spam2.push(spam[i]);
            }
        }
        for (let i = 0; i < spam2.length; i++) {
            const val = spam.findIndex(s => s === spam2[i]);
            spam.splice(val, 1);
        }
        }
        }
}
