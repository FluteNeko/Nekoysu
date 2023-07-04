const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
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
        const { data: { id, playmode, avatar_url, cover_url } } = await axios.get(`${URL}/users/${username}${gamemode ? `/${gamemode}` : ''}`, { 
            params,
            headers
        });

        request = { id, playmode, avatar_url, cover_url };
    } catch(err) {
        error = err;
    };
    

    return { request, error };
};

async function get_osuScores_Firsts(id, gamemode, limit, offset) {
    let request, error;

    const params = {
        "limit":  limit,
        "offset": offset,
        "mode":   gamemode,
    };

    const headers = {
        "Accept":        "application/json",
        "Content-Type":  "application/json",
        "Authorization": `${TOKEN}`,
    };

    try {
        const { data } = await axios.get(`${URL}/users/${id}/scores/best`, { 
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
    subCommand: "scores.firsts",
	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const username = interaction.options.getString("username");
        const gamemode = interaction.options.getString("gamemode");
        const limit    = interaction.options.getInteger("limit")  || 5;
        const offset   = interaction.options.getInteger("offset") || 0;

        await interaction.reply({
            content: `Requesting best scores of ${username} ${gamemode ? `with \`${gamemode}\` as gamemode` : ''}`
        });



        const { request: user, error: userError } = await get_osuUserProfile(username, gamemode)
        if(userError) throw userError;

        const { request: scores, error: scoresError } = await get_osuScores_Firsts(user.id, gamemode || user.playmode, limit, offset);
        if(scoresError) throw scoresError;

        

        const osu = require("../../../Utils/osu.json");
        
        const firstsScoresEmbed = new EmbedBuilder()
            .setColor("#FAD39E")
            .setAuthor({
                name: `Best Scores of ${username} | ${osu.gamemode[gamemode || user.playmode].name}`,
                iconURL: `https://cdn.discordapp.com/emojis/${osu.gamemode[gamemode || user.playmode].id}.png`,
                url: `https://osu.ppy.sh/users/${user.id}`
            })
            .setThumbnail(user.avatar_url)
            .setImage(user.cover_url)
                


        let scoresList = '';        
        for(const score of scores) {
            let mods = '';
            for(const mod of score.mods) {
                mods += mod;
            };

            scoresList += `${score.beatmapset.title} [${score.beatmap.difficulty_rating}* ${score.beatmap.version}] ${mods ? `**+${mods}**` : ''}\n${osu.rank[score.rank.toLowerCase()].use} ${Math.round(score.pp * 100) / 100}pp | ${Math.round(score.accuracy * 10000) / 100}% | ${score.max_combo}x combo\n\n`;
        };

        

        await interaction.editReply({
            content: "",
            embeds: [firstsScoresEmbed.setDescription(scoresList)]
        });
	}
};