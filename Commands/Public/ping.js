const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Returns BOT and API Latency")
		.setDMPermission(true),
        
	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
		const latency    = Date.now() - interaction.createdTimestamp;
		const apiLatency = Math.round(interaction.client.ws.ping);

		const embed = new EmbedBuilder()
			.setColor("#E8BB7D")
			.setDescription(" ")
			.setFields([
				{ name: "🗨️ BOT Latency", value: `${latency}ms`,    inline: true },
				{ name: "🛠️ API Latency", value: `${apiLatency}ms`, inline: true }
			])
			.setTitle("🏓 Pong!")
			.setTimestamp();
			

			
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};