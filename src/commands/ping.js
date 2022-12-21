const { CommandInteraction, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Te dice la latencia que tiene el bot con discord'),
    /**
     * @param {CommandInteraction} interaction 
     */
    async run(interaction) {
        interaction.reply({ content: `<@!${interaction.user.id}> - ${interaction.client.ws.ping}ms Pong!` });
    }
}