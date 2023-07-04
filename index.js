const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
require("dotenv").config();
const { BOT_TOKEN, DATABASE } = process.env;

const { Guilds, GuildMembers, GuildMessages, GuildEmojisAndStickers } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({ 
	intents: [Guilds, GuildMembers, GuildMessages, GuildEmojisAndStickers],
    partials: [User, Message, GuildMember, ThreadMember] 
});



client.events      = new Collection();
client.commands    = new Collection();
client.subCommands = new Collection();



const { loadEvents } = require("./Handlers/eventHandler");
loadEvents(client);

const { connect } = require("mongoose");
connect(DATABASE)
.then(() => console.log("The client is now connected to the database."))
.catch((err) => console.log(err));



client.login(BOT_TOKEN)
.catch((error) => {
    if(error.code === "TokenInvalid") {
        return console.error("An invalid token was provided:", BOT_TOKEN)
    } else {
        throw console.error("Something went wrong on log in:", error);
    };
});