const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear/prune messages.")
		.setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption((options) => options
            .setName("amount")
            .setDescription("Amount of messages to be deleted.")
            .setMaxValue(100)
            .setMinValue(1)
            .setRequired(true)
        )
        .addUserOption((options) => options
            .setName("target")
            .setDescription("Delete messages from a user.")
        )
        .addStringOption((options) => options
            .setName("reason")
            .setDescription("Reason to delete the messages.")
        ),

	/**
	 * 
	 * @param { ChatInputCommandInteraction } interaction 
	 */
	async execute(interaction) {
        const amount = Math.round(interaction.options.getInteger("amount"));
		const target = interaction.options.getUser("target");
		const reason = interaction.options.getString("reason") || "No reason provided";

        if(target) {
            const targetMessages = await interaction.channel.messages.fetch({
                limit: 100,
                cache: false
            }).then(channelMessages => {
                const messagesSentByTarget = channelMessages.filter(message => message.author.id === target.id);
                const messagesToBeDeleted = [];
                let i = 0;

                for(message of messagesSentByTarget) {
                    messagesToBeDeleted.push(message[1]);
                    if(messagesToBeDeleted.length === amount) break;
                };

                return messagesToBeDeleted;
            }).catch((error) => {
                throw error;
            });
            
            if(!targetMessages[0]) return interaction.reply({
                content: `No messages found from ${target} to be deleted.`,
                ephemeral: true
            });

            
            
            return await interaction.channel.bulkDelete(targetMessages, true)
            .then(() => {
                interaction.reply({
                    content: `🧹 Deleted \`${targetMessages.length}\` messages from ${target}.\nReason: ${reason}`
                });
            }).catch((error) => {
                console.log("\n\n> clear.js => error when deleted target messages:");

                const errorEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("🛑 Error in clear.js")
                    .setTimestamp();

                if(error.status === 403 && error.code === 50013 && error.rawError.message === 'Missing Permissions') {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`${error}`)]
                    })
                } else {
                    throw error;
                };
            });
        };



        return await interaction.channel.bulkDelete(amount, true)
            .then((messages) => {
                interaction.reply({
                    content: `🧹 Deleted \`${messages.size}\` messages.\nReason: ${reason}`
                });

                setTimeout(async () => {
                    await interaction.deleteReply().catch(() => {
                        return;
                    });
                }, 3000);
            })
            .catch((error) => {
                console.log("\n\n> clear.js => error when deleted target messages:");

                const errorEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("🛑 Error in clear.js")
                    .setTimestamp();

                if(error.status === 403 && error.code === 50013 && error.rawError.message === 'Missing Permissions') {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`${error}`)]
                    });
                } else {
                    throw error;
                }
            });
	}
};