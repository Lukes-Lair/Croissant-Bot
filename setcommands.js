 const {REST, Routes, body} = require("discord.js");
 const fs = require('fs');
 const path = require('path');
 const config = require("./config.json");

    console.log('searching for commands')
    const commandsPath = path.join(__dirname, "commands");
    const allCommands = fs.readdirSync(commandsPath).filter(c => c.endsWith('.js'));
    const commands = []
    for (const file of allCommands) {
        const command = require(`./commands/${file}`);
        if ('data' in command) {
            commands.push(command.data.toJSON())
        }
    }
    console.log('requesting the api')
 const rest = new REST({ version: '10' }).setToken(config.token);
    (async () => {
        try {
            await rest.put( Routes.applicationCommands(config.id), {body: commands});
            console.log('commands set')
        } catch (error) {
            console.error(error);
        }
    }) ()
