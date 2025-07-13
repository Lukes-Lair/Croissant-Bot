 const {REST, Routes, body} = require("discord.js");
 const fs = require('fs');
 const path = require('path');
 const config = require("./config.json");


    const commandsPath = path.join(__dirname, "commands");
    const allCommands = fs.readdirSync(commandsPath).filter(c => c.endsWith('.js'));
    const commands = []
    for (const file of allCommands) {
        const command = require(`./commands/${file}`);
        if ('data' in command) {
            commands.push(command.data.toJSON())
        }
    }

 const rest = new REST({ version: '10' }).setToken(config.token);
    (async () => {
        try {
            await rest.put( Routes.applicationGuildCommands(config.id, config.guild), {body: []});
        } catch (error) {
            console.error(error);
        }
    }) ()
