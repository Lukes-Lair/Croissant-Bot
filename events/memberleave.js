const { WelcomeDB } = require("../database");
module.exports = {
  async executeLeave(user) {
    const channel = user.guild.systemChannel;
    const obj = await WelcomeDB.findOne({
      type: "leave",
      guildID: user.guild.id,
    });

    if (!channel) return;
    if (!obj) return;

    await channel.send(
      obj.message
        .replaceAll("${user}", `${user}`)
        .replaceAll("${guild}", `${user.guild.name}`)
    );
  },
};
