const { Events, Client } = require('discord.js');

const { loadCommands } = require('../../Handlers/commandHandler');



module.exports = {
	name: Events.ClientReady,
	once: true,
    
	/**
	 * 
	 * @param {Client} client 
	 */
	execute(client) {
		loadCommands(client);

		console.log(`Ready! Logged in as ${client.user.tag}.`);
	}
};