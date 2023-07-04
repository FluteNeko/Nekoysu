const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    developer: true,

	data: new SlashCommandBuilder()
		.setName("get_beatmaps")
		.setDescription("[UNDER DEVELOPMENT] Beatmaps related command.")
		.setDMPermission(true)
        .addSubcommand((options) => options
            .setName("beatmap")
            .setDescription('Get baetmap data.')
            .addIntegerOption((options) => options
                .setName("id")
                .setDescription("Beatmaps ID.")
                .setMinValue(1)
                .setRequired(true)
            )
        )
        .addSubcommand((options) => options
            .setName("beatmaps")
            .setDescription('Get beatmaps data.')
            .addStringOption((options) => options
                .setName("ids")
                .setDescription("Beatmaps IDs (separate with a comma). Max of 10 ids.")
                .setRequired(true)
            )
        )
        .addSubcommand((options) => options
            .setName("beatmapsets")
            .setDescription('Get beatmapset data.')
            .addIntegerOption((options) => options
                .setName("id")
                .setDescription("Beatmapset ID.")
                .setMinValue(1)
                .setRequired(true)
            )
        )
        .addSubcommand((options) => options
            .setName("lookup")
            .setDescription('Get beatmap data based on checksum, filename or id.')
            .addStringOption((options) => options
                .setName("checksum")
                .setDescription("A beatmap checksum.")
            )
            .addStringOption(options => options
                .setName("filename")
                .setDescription("A filename to lookup")    
            )
            .addIntegerOption(options => options
                .setName("id")
                .setDescription("A beatmap ID to lookup")    
            ) 
        ),
}