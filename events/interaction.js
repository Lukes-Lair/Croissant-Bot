const { CroissantEmojiDB } = require("../database");
module.exports = {
  /**
   * @param {import('discord.js').AutocompleteInteraction} interaction
   */
  async execute(interaction, client) {
    if (interaction.isAutocomplete()) {
      const focused = interaction.options.getFocused(true);
      switch (focused.name) {
        case "emoji-name":
          const choices = (
            await CroissantEmojiDB.distinct("name", {
              guildID: interaction.guild.id,
            })
          ).map((c) => c.toLowerCase());
          const starts = (await choices).filter((c) =>
            c.startsWith(focused.value.toLowerCase())
          );
          await interaction.respond(starts.map((c) => ({ name: c, value: c })));
          break;
        case "emoji":
          const choices2 = (
            await CroissantEmojiDB.distinct("emoji", {
              guildID: interaction.guild.id,
            })
          ).map((c) => c.toLowerCase());
          const starts2 = (await choices2).filter((c) =>
            c.startsWith(focused.value.toLowerCase())
          );
          await interaction.respond(
            starts2.map((c) => ({ name: c, value: c }))
          );
          break;

        default:
          break;
      }
    }
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      interaction.reply({
        content: "Could not find this command",
        ephemeral: true,
      });
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.warn(error);
      interaction.reply({
        content: "there was an error with the command",
        ephemeral: true,
      });
      return;
    }
  },
};
