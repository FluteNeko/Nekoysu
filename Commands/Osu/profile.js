const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');



// OSU API (V2)
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



// Others
function calcTime(locale, seconds) {
    if(seconds < 60) {
        const s = Math.floor(seconds % 60);

        return { 
            display: `${s}s`, 
            extended: `Brand new account.` 
        };
    } 
    
    else if(seconds < 3600) {
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        const totalMinutes = Math.round(seconds / 3600);

        return {
            display: `${m}m ${s}s`,
            extended: totalMinutes !== 1 ? `${totalMinutes} minutes` : `1 minute`
        };
    } 
    
    else if(seconds < 86400) {
        const h = Math.floor(seconds % (3600*24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        const totalHours = Math.round(seconds / 3600);

        return {
            display: `${h}h ${m}m ${s}s`,
            extended: totalHours !== 1 ? `${totalHours} hours` : `1 hour`
        };
    } 
    
    else {
        const d = Math.floor(seconds / (3600*24));
        const h = Math.floor(seconds % (3600*24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const totalHours = Math.round(seconds / 3600).toLocaleString(locale);

        return {
            display: `${d}d ${h}h ${m}m`,
            extended: `${totalHours} hours`
        };
    };
};

function getDate(date) {
    const year  = date.getFullYear();
    const month = date.getMonth() + 1;
    const day   = date.getDate();

    return [day, month, year].join('/');
}


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
        
        const { request: user, error } = await get_osuUserProfile(username.toLowerCase(), gamemode);
        if(error) throw error;
        
        
        
        const osu = require("../../Utils/osu.json");
        const locale = interaction.locale;
        const { id: guild_id } = await interaction.guild.fetch();
        const { id: channel_id } = await interaction.channel.fetch();

        const globalRank   = user.statistics.global_rank  ? user.statistics.global_rank.toLocaleString(locale)  : '- -';
        const countryRank  = user.statistics.country_rank ? user.statistics.country_rank.toLocaleString(locale) : '- -';
        const rankedScore  = user.statistics.ranked_score.toLocaleString(locale);
        const totalScore   = user.statistics.total_score.toLocaleString(locale);
        const pp           = Math.round(user.statistics.pp).toLocaleString(locale);
        const lazer_pp     = Math.round(user.statistics.pp_exp).toLocaleString(locale);
        const playcount    = user.statistics.play_count.toLocaleString(locale)
        const peakRank     = !user.rank_highest ? '- -' : user.rank_highest.rank.toLocaleString(locale);
        const maxCombo     = user.statistics.maximum_combo.toLocaleString(locale);
        
        const peakRankDate   = !user.rank_highest ? '- -' : getDate(new Date(user.rank_highest.updated_at));
        const accuracy       = (Math.round(user.statistics.hit_accuracy * 100) / 100);
        const countryCode    = user.country_code.toLowerCase();
        const total_playtime = user.statistics.play_time;
        const playtime       = calcTime(locale, total_playtime);
        const medals         = user.user_achievements.length;
        

        const userEmbed = new EmbedBuilder()
            .setColor("#FAD39E")
            .setAuthor({
                name: `${username}'s Profile | osu! ${osu.gamemode[gamemode || user.playmode].name}`,
                iconURL: `https://cdn.discordapp.com/emojis/${osu.gamemode[gamemode || user.playmode].id}.png`,
                url: `https://osu.ppy.sh/users/${user.id}`
            })
            .setThumbnail(user.avatar_url)
            .setImage(user.cover_url)
            .addFields(
                { name: 'Ranking',            value: `・ \u200b \`#${globalRank}\`\n:flag_${countryCode}: \`#${countryRank}\``, inline: true },
                { name: 'Performance', value: `[\`${pp}pp\`](https://discord.com/channels/${guild_id}/${channel_id}/# \"lazer: ${lazer_pp}pp\")`, inline: true },
                { name: 'Ranked Score',       value: `[\`${rankedScore}\`](https://discord.com/channels/${guild_id}/${channel_id}/# \"Total Score: ${totalScore}\")`, inline: true },
                { name: 'Accuracy',   value: `\`${accuracy}%\``, inline: true },
                { name: 'Play Count', value: `\`${playcount}\``, inline: true },
                { name: 'Play Time',  value: `\`${playtime.display}\`\n\`(${playtime.extended})\``, inline: true },
                { name: 'Peak Rank',  value: `[\`#${peakRank}\`](https://discord.com/channels/${guild_id}/${channel_id}/# \"Achieved on ${peakRankDate}\")`, inline: true },
                { name: 'Max Combo',  value: `\`${maxCombo}x\``, inline: true },
                { name: 'Medals',     value: `\`${medals}\``, inline: true },
            );

			
		await interaction.reply({
            embeds: [userEmbed]
		});
	}
};