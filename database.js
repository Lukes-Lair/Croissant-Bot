const config = require("./config.json")
const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
    userID: { type: String, required: true }
});
const candidateDB = mongoose.model("candidates", candidateSchema);


const welcomeSchema = new mongoose.Schema({
    guildID: { type: String, required: true },
    message: { type: String, required: true }
})
const WelcomeDB = mongoose.model("welcome", welcomeSchema);


const croissantEmojiSchema = new mongoose.Schema({
    emoji: { type: String, required: true },
    name: { type: String, required: true },
    guildID: { type: String, required: true }
})
const CroissantEmojiDB = mongoose.model("croissantEmojis", croissantEmojiSchema)


const croissantMessagesSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    guildID: { type: String, required: true },
    name: { type: String, required: true },
    count: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
})
const CroissantMessagesDB = mongoose.model("croissantmessages", croissantMessagesSchema);


const creatorSchema = new mongoose.Schema({
    userID: { type: String, required: true }
})
const creatorDB = mongoose.model("creators", creatorSchema);


async function connect() {
    try {
        await mongoose.connect(config.url);
        console.log("connected");
    } catch (error) {
        console.log(error);
    }
}
connect();

module.exports = {
    CroissantEmojiDB,
    CroissantMessagesDB,
    creatorDB,
    WelcomeDB,
    candidateDB,
}
