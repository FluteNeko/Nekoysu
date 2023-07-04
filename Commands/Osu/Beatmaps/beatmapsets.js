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
        const { data } = await axios.get(`${URL}/beatmapsets/${id}`, {
            headers
        });

        request = data;
    } catch(err) {
        error = err;
    };

    return { request, error };
};



module.exports = {
    subCommand: "get_beatmaps.beatmapsets",
    
	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const beatmapsetID = interaction.options.getInteger("id");

        const { request: beatmapset, error } = await get_beatmap(beatmapsetID);
        if(error) throw error;


        
        const beatmapsetEmbed = new EmbedBuilder()
            .setColor("#FAD39E")
            .setTitle(`${beatmapset.title} - ${beatmapset.artist}`)
            .setURL(beatmapset.url)
            .setThumbnail(beatmapset.covers.list)
            .setImage(beatmapset.covers.cover)
            .setFields(
                { name: "Ranked Status",      value: `${beatmapset.status}` },
                { name: "Total Difficulties", value: `${beatmapset.beatmaps.length}` },
                { name: "Made By:",           value: `${beatmapset.creator}` },
                { name: "Genre:",             value: `${beatmapset.genre.name}` },
                { name: "BPM:",               value: `${beatmapset.bpm}` },
            )
        
        await interaction.reply({
            embeds: [beatmapsetEmbed]
        });
	}
};