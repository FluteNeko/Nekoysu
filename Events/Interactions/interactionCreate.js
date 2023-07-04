const { Events, ChatInputCommandInteraction, Client } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,

	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 * @param { Client } client 
	 */
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		
		const command = interaction.client.commands.get(interaction.commandName);
		const botOwner = process.env.OWNER_ID;

		if (!command) {
			return console.error(`No command matching ${interaction.commandName} was found.`);
		} else if(!botOwner) {
			return console.error("No OWNER ID was provided. Please, update the `.env` file and restart the bot.");
		} else if(command.developer && interaction.user.id !== botOwner) return interaction.reply({
            content: "This command is only available to the developer.",
            ephemeral: true
        });



        const subCommand = interaction.options.getSubcommand(false);
		
		try {
			if(subCommand) {
				const subCommandFile = interaction.client.subCommands.get(`${interaction.commandName}.${subCommand}`);
				if(!subCommandFile) throw console.error(`No command matching ${interaction.commandName} was found.`);

				await subCommandFile.execute(interaction);
			} else {
				await command.execute(interaction);	
			}
		} catch (error) {
			console.error(error, '\n> interactionCreate.js');
			if(!error) return;
		};
	}
};
