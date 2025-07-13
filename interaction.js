module.exports = {
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            interaction.reply({
                content: 'Could not find this command',
                ephemeral: true
            });
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.warn(error);
            interaction.reply({
                content: 'there was an error with the command',
                ephemeral: true
            });
            return;
        }
    }
}