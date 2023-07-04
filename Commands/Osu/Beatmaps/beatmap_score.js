const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const URL   = process.env.OSU_API_URL;
const TOKEN = `Bearer ${process.env.OSU_API_TOKEN}`;



async function get_osuUserProfile(username, gamemode) {
    let request, error;

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

async function get_beatmap(beatmap) {
    let   request, error;

    const headers = {
        "Accept":        "application/json",
        "Content-Type":  "application/json",
        "Authorization": `${TOKEN}`,
    };

    try {
        const { data } = await axios.get(`${URL}/beatmaps/${beatmap}`, {
            headers
        });

        request = data;
    } catch(err) {
        error = err;
    };

    return { request, error };
};

async function get_beatmapScore(user, beatmap, gamemode) {
    let request, error;

    const headers = {
        "Accept":        "application/json",
        "Content-Type":  "application/json",
        "Authorization": `${TOKEN}`,
    };
    const params = {
        "mode": gamemode
    };

    try {
        const { data } = await axios.get(`${URL}/beatmaps/${beatmap}/scores/users/${user}`, {
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
    data: new SlashCommandBuilder()
		.setName("beatmap_score")
		.setDescription("Get user's score on a Beatmap.")
		.setDMPermission(true)
        .addStringOption((options) => options
            .setName("username")
            .setDescription("Username or ID.")
            .setRequired(true)
        )
        .addIntegerOption(options => options
            .setName("beatmap")
            .setDescription("Beatmap ID.")
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
        const username  = interaction.options.getString("username");
        const beatmapID = interaction.options.getInteger("beatmap");
        const gamemode  = interaction.options.getString("gamemode");

        await interaction.reply({
            content: `Getting \`${username}\`'s score on Beatmap ID \`${beatmapID}\`...`
        })



        const { request: user, error: userError } = await get_osuUserProfile(username.toLowerCase(), gamemode);
        if(userError) throw userError;

        const { request: beatmap, error: beatmapError } = await get_beatmap(beatmapID);
        if(beatmapError) throw beatmapError;

        const { request: beatmapScore, error } = await get_beatmapScore(user.id, beatmapID, gamemode || user.playmode);
        if(error) throw error;



        const osu = require("../../../Utils/osu.json");
        const filterSpecialCharacters = /([\/,*!?_])/g;

        const scoreProgress = (perfect, passed) => {
            if(perfect) {
                return "Full-Combo"
            }

            else if(!perfect && passed) {
                return "Passed"
            }

            else {
                return "Failed"
            };
        };
        const scoreSubmittedAt = (date) => {
            const scoreSubmittedAt_inTime = new Date(date).getTime() / 1000;
            return `<t:${scoreSubmittedAt_inTime}:f>`;
        }
        const mods = (modsList) => {
            let mods;

            for(const mod of modsList) {
                mods += mod;
            };

            return mods;
        };

        

        const beatmapScoreEmbed = new EmbedBuilder()
            .setColor("#FAD39E")
            .setAuthor({
                name: `Played by ${username} | osu! ${osu.gamemode[gamemode || user.playmode].name}`,
                iconURL: `https://cdn.discordapp.com/emojis/${osu.gamemode[gamemode || user.playmode].id}.png`,
                url: `https://osu.ppy.sh/scores/${gamemode ? gamemode : user.playmode}/${beatmapScore.score.id}`
            })
            .setTitle(`${beatmap.beatmapset.title.replace(filterSpecialCharacters, '\\$1')} - ${beatmap.beatmapset.artist} [${beatmapScore.score.beatmap.version} | ${beatmapScore.score.beatmap.difficulty_rating}*]`)
            .setURL(beatmapScore.score.beatmap.url)
            .setThumbnail(user.avatar_url)
            .setImage(beatmap.beatmapset.covers.cover)
            .setFields(
                { name: "Grade",        value: `${osu.rank[beatmapScore.score.rank.toLowerCase()].use} [**${scoreProgress(beatmapScore.score.perfect, beatmapScore.score.passed)}**]`, inline: true },
                { name: "Global Rank",  value: `#${beatmapScore.position.toLocaleString("en-US")}`,         inline: true },
                { name: "Score",        value: `${beatmapScore.score.score.toLocaleString("en-US")}`,       inline: true },
                { name: "PP",           value: `${Math.round(beatmapScore.score.pp)}`,                     inline: true },
                { name: "Accuracy",     value: `${Math.round(beatmapScore.score.accuracy * 10000) / 100}%`, inline: true },
                { name: "Max Combo",    value: `${beatmapScore.score.max_combo}x`,                          inline: true },
                { name: "Mods",         value: `${beatmapScore.score.mods[0] ? mods(beatmapScore.score.mods) : 'NM'}`,                          inline: true },
                { name: "Statistics",   value: `300:  \`${beatmapScore.score.statistics.count_300}\`\n100:\u2000\`${beatmapScore.score.statistics.count_100}\`\n50:\u2000\u2000\`${beatmapScore.score.statistics.count_50}\`\nMiss: \`${beatmapScore.score.statistics.count_miss}\``, inline: true },
                { name: "Submitted on", value: `${scoreSubmittedAt(beatmapScore.score.created_at)}`,        inline: true },
            )
            
            

        await interaction.editReply({
            content: '',
            embeds: [beatmapScoreEmbed]
        });
	}
};