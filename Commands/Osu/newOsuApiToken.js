const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require('axios');

async function get_osuApiToken() {
    let request, error;

    try {
        const { data } = await axios.post("https://osu.ppy.sh/oauth/token", {
            client_id: "20700",
            client_secret: "BRISg0PgU7QMQ4E179JWYZ1oPs9RQll3xjhY7Z8Z",
            grant_type: "client_credentials",
            scope: "public"
        });

        request = data.access_token;
    } catch(error) {
        error = error;
    };

    return { request, error };
};



module.exports = {
    developer: true,

    data: new SlashCommandBuilder()
		.setName("token")
		.setDescription("Refresh osu api (v2) token.")
		.setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const { request, error } = await get_osuApiToken();
        if(error) throw error;



        console.log(request);

        await interaction.reply({
            content: "Token refreshed. Copy the new one on the terminal and restart the bot."
        })
	}
};