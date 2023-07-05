const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const URL   = process.env.OSU_API_URL;
const TOKEN = `Bearer ${process.env.OSU_API_TOKEN}`;



async function get_osuUserProfile(username, gamemode) {
    let   request, error;

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

async function get_recentActivity(id, limit, offset) {
    let   request, error;

    const params = {
        "limit":  limit,
        "offset": offset,
    };

    const headers = {
        "Accept":        "application/json",
        "Content-Type":  "application/json",
        "Authorization": `${TOKEN}`,
    };

    try {
        const { data } = await axios.get(`${URL}/users/${id}/recent_activity`, { 
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
		.setName("recent_activity")
		.setDescription("Get recent activity. Max of 25.")
		.setDMPermission(true)
        .addStringOption((options) => options
            .setName("username")
            .setDescription("Username or ID.")
            .setRequired(true)
        )
        .addIntegerOption((options) => options
            .setName("limit")
            .setDescription("Limit of activities (Max of 16)")
            .setMinValue(1)
            .setMaxValue(15)
        )
        .addIntegerOption((options) => options
            .setName("offset")
            .setDescription("Offset of the scores")
            .setMinValue(0)
        ),
        
	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const username = interaction.options.getString("username");
        const limit    = interaction.options.getInteger("limit")  || 5;
        const offset   = interaction.options.getInteger("offset") || 0;

        const { request: profile, profileError } = await get_osuUserProfile(username.toLowerCase());
        if(profileError) throw profileError;

        const { request: recentActivity, error } = await get_recentActivity(profile.id, limit, offset);
        if(error) throw error;



        const osu = require("../../Utils/osu.json");
        const locale = interaction.locale;

        const recentActivityEmbed = new EmbedBuilder()
            .setColor("#FAD39E")
            .setTitle(`Recent Activity of ${username}`)
            .setURL(`https://osu.ppy.sh/users/${profile.id}`)
            .setThumbnail(profile.avatar_url);
                

        let inline = 0;
        for(const activity of recentActivity) {
            // Once I figure out every single activity type, convert it into a Switch(case);

            if(activity.type === "rank") {
                if(inline % 2 === 0) {
                    recentActivityEmbed.addFields({
                        name: '\u200b',
                        value: '\u200b'
                    });

                    inline = 1;
                } else {
                    inline++;
                };

                const value = [
                    `・ Grade: ${osu.rank[activity.scoreRank.toLowerCase()].use}`,
                    `・ Rank: \u200b \u200b #\`${activity.rank.toLocaleString(locale)}\``,
                    `・ [Beatmap link](https://osu.ppy.sh${activity.beatmap.url})`
                ].join("\n");

                recentActivityEmbed.addFields({
                    name: `${osu.gamemode[activity.mode].use} ${activity.beatmap.title}\n`,
                    value: value,
                    inline: true
                });
                
                
                //`${osu.gamemode[activity.mode].use} [${activity.beatmap.title}](https://osu.ppy.sh${activity.beatmap.url})\n
                //${osu.rank[activity.scoreRank.toLowerCase()].use} #${activity.rank}\n\n`
            }

            else {
                recentActivityEmbed.setDescription('New type of activity found. Check console.\n\n')
                console.log("\n\nNew Activity on recentActivity.js:\n", JSON.stringify(activity), "\n>recentActivity.js");
            };
        };


			
		await interaction.reply({
            embeds: [recentActivityEmbed]
		});
	}
};