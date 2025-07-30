const { WelcomeDB } = require("../database");

module.exports = {
  /** @param {import("discord.js").GuildMember} user */
  async executeAdd(user) {
    const exists = await WelcomeDB.findOne({ guildID: user.guild.id });
    const channel = user.guild.systemChannel;
    const guild = user.guild.name;

    if (!channel) return;

    if (exists) {
      channel.send(
        `${exists.message
          .replaceAll("${user}", `<@${user.id}>`)
          .replaceAll("${guild}", `${guild}`)}`
      );
    }
  },
};
