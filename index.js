const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Express server for Railway
const app = express();
app.get('/', (req, res) => res.send('CHAOS MC Bot is alive!'));
app.listen(3000, () => console.log('✅ Web server running on port 3000'));

// When bot is ready
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is ONLINE for CHAOS MC!`);
    console.log(`📊 Bot is in ${client.guilds.cache.size} servers`);
    client.user.setActivity('CHAOS MC | /help');
});

// Simple ping command
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === '!ping') {
        await message.reply('🏓 Pong!');
    }
});

// Login
client.login(process.env.TOKEN);
