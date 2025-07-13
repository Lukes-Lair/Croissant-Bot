const {Client, IntentsBitField, Collection} = require("discord.js");
const fs = require('fs');
const path = require("path");
const {execute} = require("./interaction.js");
const {executeMessage} = require("./events/messagecreate.js");
const { executeAdd } = require("./events/memberadd.js");
const config = require("./config.json")

const client = new Client({
    allowedMentions: {parse:[]},
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers
    ]
});

    client.commands = new Collection();

    const commandsPath = path.join(__dirname, "commands");
    const allcommands = fs.readdirSync(commandsPath).filter(c => c.endsWith('.js'))

    for (const file of allcommands) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }



    client.on("interactionCreate", async interaction => {
        execute(interaction, client);
    });



client.on("messageCreate", message => {
    executeMessage(message, client);
});

client.on("guildMemberAdd", user => {
    executeAdd(user);
})


client.on('ready', () => {

    console.log("ready");

    client.user.setPresence({
        activities: [{ name: "Croissants", type: 3}],
        status:"online"
    });

})

        client.on('unhandledRejection', handleException => {
            console.log(handleException);
        });
        client.on('unhandledException', handleException => {
            console.log(handleException);
        });
        client.on('uncaughtException', handleException => {
            console.log(handleException);
        });
        client.on('uncaughtRejection', handleException => {
            console.log(handleException);
        });

client.login(config.token);