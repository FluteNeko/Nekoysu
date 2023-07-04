const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("scores")
		.setDescription("[UNDER DEVELOPMENT] Scores related command.")
		.setDMPermission(true)
        .addSubcommand((options) => options
            .setName("best")
            .setDescription('Top scores.')
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
            )
            .addIntegerOption((options) => options
                .setName("limit")
                .setDescription("Limit of scores (max 100)")
                .setMinValue(1)
                .setMaxValue(100)
            )
            .addIntegerOption((options) => options
                .setName("offset")
                .setDescription("Offset of the scores")
                .setMinValue(0)
            )
        )
        .addSubcommand(options => options
            .setName("recent")
            .setDescription("Recent scores.")
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
            )
            .addStringOption(options => options
                .setName("include_fails")
                .setDescription("Include failed scores.")
                .addChoices(
                    { name: "Yes", value: "1" },
                    { name: "No", value: "0" }
                )    
            )
            .addIntegerOption((options) => options
                .setName("limit")
                .setDescription("Limit of scores (max 100)")
                .setMinValue(1)
                .setMaxValue(100)
            )
            .addIntegerOption((options) => options
                .setName("offset")
                .setDescription("Offset of the scores")
                .setMinValue(0)
            )    
        )
        .addSubcommand((options) => options
            .setName("firsts")
            .setDescription('TOP1 plays.')
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
            )
            .addIntegerOption((options) => options
                .setName("limit")
                .setDescription("Limit of scores (max 100)")
                .setMinValue(1)
                .setMaxValue(100)
            )
            .addIntegerOption((options) => options
                .setName("offset")
                .setDescription("Offset of the scores")
                .setMinValue(0)
            )
        ),
}