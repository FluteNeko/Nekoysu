const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');



async function get_beatmap(id) {
    let   request, error;
    const URL   = process.env.OSU_API_URL;
    const TOKEN = `Bearer ${process.env.OSU_API_TOKEN}`;

    const headers = {
        "Accept":        "application/json",
        "Content-Type":  "application/json",
        "Authorization": `${TOKEN}`,
    };

    try {
        const { data } = await axios.get(`${URL}/beatmaps/${id}`, {
            headers
        });

        request = data;
    } catch(err) {
        error = err;
    };

    return { request, error };
};



module.exports = {
    subCommand: "get_beatmaps.beatmap",

	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const beatmapID = interaction.options.getInteger("id");

        const { request: beatmap, error } = await get_beatmap(beatmapID);
        if(error) throw error;



        const minutes = Math.floor(beatmap.total_length / 60);
        const seconds = Math.floor(beatmap.total_length % 60);
        const beatmapTime = `${minutes}:${seconds}`;

        const beatmapEmbed = new EmbedBuilder()
            .setColor("#FAD39E")
            .setTitle(`${beatmap.beatmapset.title} - ${beatmap.beatmapset.artist}`)
            .setURL(beatmap.url)
            .setThumbnail(beatmap.beatmapset.covers.list)
            .setImage(beatmap.beatmapset.covers.cover)
            .setFields(
                { name: "Ranked Status", value: `${beatmap.status}` },
                { name: "Difficulty", value: `${beatmap.version} [${beatmap.difficulty_rating}*]` },
                { name: "Max Combo", value: `${beatmap.max_combo}x` },
                { name: "Time Lenght", value: `${beatmapTime}` },
                { name: "Details", value: `[AR \`${beatmap.ar}\` | OD \`${beatmap.accuracy}\` | CS \`${beatmap.cs}\` | HP \`${beatmap.drain}\`]` },
            )
        

            
        await interaction.reply({
            embeds: [beatmapEmbed]
        });
	}
};