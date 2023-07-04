const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');



async function get_beatmap(type, value) {
    let request, error;
    const URL   = process.env.OSU_API_URL;
    const TOKEN = `Bearer ${process.env.OSU_API_TOKEN}`;

    const headers = {
        "Accept":        "application/json",
        "Content-Type":  "application/json",
        "Authorization": `${TOKEN}`,
    };

    const params = {
        [type]: `${value}`
    };

    try {
        const { data } = await axios.get(`${URL}/beatmaps/lookup`, {
            headers,
            params
        });

        request = data;
    } catch(err) {
        error = err;
    };

    return { request, error };
};



module.exports = {
    subCommand: "get_beatmaps.lookup",

	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const inputs = [interaction.options.get("checksum"), interaction.options.get("filename"), interaction.options.get("id")];

        const lookupBeatmap = {};
        for(const input of inputs) {
            if(input) {
                lookupBeatmap.type  = input.name;
                lookupBeatmap.value = input.value;
                break;
            }
        };

        const { request: beatmap, error } = await get_beatmap(lookupBeatmap.type, lookupBeatmap.value);
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