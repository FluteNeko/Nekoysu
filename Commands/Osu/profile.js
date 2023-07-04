const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function get_osuUserProfile(username, gamemode) {
    let request, error;

    const URL   = process.env.OSU_API_URL;
    const TOKEN = `Bearer ${process.env.OSU_API_TOKEN}`;

    const params = {
        "key": "username"
    };
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `${TOKEN}`
    };

    try {
        const { data } = await axios.get(`${URL}/users/${username}${gamemode ? `/${gamemode}` : ''}`, { 
            params,
            headers
        });

        request = data;
    } catch(err) {
        error = err;
    };

    return { request, error };
};



module.exports = {
	data: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("Get osu! Profile data.")
		.setDMPermission(true)
        .addStringOption((options) => options
            .setName("username")
            .setDescription("Username or ID.")
            .setRequired(true)
        )
        .addStringOption((options) => options
            .setName("gamemode")
            .setDescription("Gamemode")
            .addChoices(
                { name: "Standard", value: "osu"    },
                { name: "Taiko",    value: "taiko"  },
                { name: "Catch",    value: "fruits" },
                { name: "Mania",    value: "mania"  },
            )
        ),
        
	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const username = interaction.options.getString("username");
        const gamemode = interaction.options.getString("gamemode");

        const { request: profile, error } = await get_osuUserProfile(username.toLowerCase(), gamemode);
        if(error) throw error;



        const osu = require("../../Utils/osu.json");

        const profileEmbed = new EmbedBuilder()
            .setColor("#FAD39E")
            .setAuthor({
                name: `${username}'s Profile | ${osu.gamemode[gamemode || profile.playmode].name}`,
                iconURL: `https://cdn.discordapp.com/emojis/${osu.gamemode[gamemode || profile.playmode].id}.png`,
                url: `https://osu.ppy.sh/users/${profile.id}`
            })
            .setThumbnail(profile.avatar_url)
            .setImage(profile.cover_url)
            .addFields(
                { name: 'Rank', value: `#${profile.statistics.global_rank} (:flag_${profile.country_code.toLowerCase()}: #${profile.statistics.country_rank})` },
                { name: 'Username', value: `${profile.username}` },
                { name: 'PP', value: `${profile.statistics.pp}pp` },
                { name: 'Accuracy', value: `${Math.round(profile.statistics.hit_accuracy * 100) / 100}%` },
                { name: 'Play Count', value: `${profile.statistics.play_count}` },
                { name: 'Play Time', value: `${profile.statistics.play_time}` },
            )
			
		await interaction.reply({
			content: `Username: ${username}`,
            embeds: [profileEmbed]
		});
	}
};