const { ChatInputCommandInteraction } = require('discord.js');
const { loadCommands } = require('../../../Handlers/commandHandler');

module.exports = {
    subCommand: "reload.commands",

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */
    execute(interaction) {
        loadCommands(interaction.client);

        return interaction.reply({
            content: "Reloaded Commands ",
            ephemeral: true
        });
    }
};