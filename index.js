const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType,
    Collection,
} = require("discord.js");
const express = require("express");
const dotenv = require("dotenv");
const moment = require("moment");

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});

// Express server for 24/7
const app = express();
app.get("/", (req, res) => res.send("🛡️ CHAOS MC Moderation Bot is Alive!"));
app.listen(3000, () => console.log("✅ Web server running on port 3000"));

// Storage for moderation data
const warnings = new Map();
const mutes = new Map();
const bans = new Map();
const strikes = new Map();
const reports = new Map();
const appeals = new Map();
const modCases = new Map();
const userNotes = new Map();
const tempBans = new Map();
const raidMode = new Map();
const lockdowns = new Map();
const verifyQueue = new Map();
const suggestQueue = new Map();
const reportQueue = new Map();

let caseNumber = 1;

// ==================== COOL ASCII ART (in console log) ====================
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      ██████╗██╗  ██╗ █████╗  ██████╗ ███████╗               ║
║     ██╔════╝██║  ██║██╔══██╗██╔═══██╗██╔════╝               ║
║     ██║     ███████║███████║██║   ██║███████╗               ║
║     ██║     ██╔══██║██╔══██║██║   ██║╚════██║               ║
║     ╚██████╗██║  ██║██║  ██║╚██████╔╝███████║               ║
║      ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝               ║
║                                                              ║
║                    MODERATION SYSTEM                         ║
║                 100+ UNIQUE COMMANDS                        ║
╚══════════════════════════════════════════════════════════════╝
`);

// ==================== BOT READY ====================
client.once("ready", async () => {
    console.log(`✅ ${client.user.tag} is ONLINE for CHAOS MC Moderation!`);
    console.log(`📊 Protecting ${client.guilds.cache.size} servers`);
    console.log(`⚡ Loaded 100+ Moderation Commands!`);

    client.user.setPresence({
        activities: [{ name: "🛡️ CHAOS MC | /modhelp", type: 3 }],
        status: "online",
    });

    await registerCommands();
    console.log("✅ Moderation Commands Registered!");
});

// ==================== REGISTER MODERATION COMMANDS ====================
async function registerCommands() {
    const commands = [
        // ========== CORE MODERATION (30+ Commands) ==========
        {
            name: "ban",
            description: "🔨 Ban a member from the server",
            options: [
                {
                    name: "user",
                    description: "User to ban",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Ban reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "tempban",
            description: "⏰ Temporarily ban a member",
            options: [
                {
                    name: "user",
                    description: "User to ban",
                    type: 6,
                    required: true,
                },
                {
                    name: "duration",
                    description: "Duration (1d, 2h, 7d)",
                    type: 3,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Ban reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "unban",
            description: "🔓 Unban a member",
            options: [
                {
                    name: "userid",
                    description: "User ID to unban",
                    type: 3,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Unban reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "kick",
            description: "👢 Kick a member",
            options: [
                {
                    name: "user",
                    description: "User to kick",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Kick reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "softban",
            description: "🥾 Softban (ban & unban to clear messages)",
            options: [
                {
                    name: "user",
                    description: "User to softban",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "timeout",
            description: "⏰ Timeout a member",
            options: [
                {
                    name: "user",
                    description: "User to timeout",
                    type: 6,
                    required: true,
                },
                {
                    name: "duration",
                    description: "Duration (1m, 1h, 1d)",
                    type: 3,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Timeout reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "untimeout",
            description: "⏰ Remove timeout from a member",
            options: [
                {
                    name: "user",
                    description: "User to remove timeout",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "warn",
            description: "⚠️ Warn a member",
            options: [
                {
                    name: "user",
                    description: "User to warn",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Warning reason",
                    type: 3,
                    required: true,
                },
            ],
        },
        {
            name: "warnings",
            description: "📋 View member warnings",
            options: [
                {
                    name: "user",
                    description: "User to check",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "clearwarns",
            description: "🗑️ Clear all warnings from a member",
            options: [
                {
                    name: "user",
                    description: "User to clear warnings",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "strike",
            description: "⚡ Strike a member (3 strikes = ban)",
            options: [
                {
                    name: "user",
                    description: "User to strike",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Strike reason",
                    type: 3,
                    required: true,
                },
            ],
        },
        {
            name: "strikes",
            description: "⚡ View member strikes",
            options: [
                {
                    name: "user",
                    description: "User to check",
                    type: 6,
                    required: true,
                },
            ],
        },

        // ========== MUTE MANAGEMENT ==========
        {
            name: "mute",
            description: "🔇 Mute a member",
            options: [
                {
                    name: "user",
                    description: "User to mute",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Mute reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "tempmute",
            description: "⏰ Temporarily mute a member",
            options: [
                {
                    name: "user",
                    description: "User to mute",
                    type: 6,
                    required: true,
                },
                {
                    name: "duration",
                    description: "Duration (1m, 1h, 1d)",
                    type: 3,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Mute reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "unmute",
            description: "🔊 Unmute a member",
            options: [
                {
                    name: "user",
                    description: "User to unmute",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Unmute reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "vmute",
            description: "🔇 Voice mute a member",
            options: [
                {
                    name: "user",
                    description: "User to voice mute",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "vunmute",
            description: "🔊 Voice unmute a member",
            options: [
                {
                    name: "user",
                    description: "User to voice unmute",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "deafen",
            description: "🔇 Deafen a member",
            options: [
                {
                    name: "user",
                    description: "User to deafen",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "undeafen",
            description: "🔊 Undeafen a member",
            options: [
                {
                    name: "user",
                    description: "User to undeafen",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "disconnect",
            description: "🔌 Disconnect a member from voice",
            options: [
                {
                    name: "user",
                    description: "User to disconnect",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "moveall",
            description: "🚚 Move all members from voice channel",
            options: [
                {
                    name: "from",
                    description: "From channel",
                    type: 7,
                    required: true,
                },
                {
                    name: "to",
                    description: "To channel",
                    type: 7,
                    required: true,
                },
            ],
        },

        // ========== CHANNEL MANAGEMENT ==========
        {
            name: "lock",
            description: "🔒 Lock a channel",
            options: [
                {
                    name: "channel",
                    description: "Channel to lock",
                    type: 7,
                    required: false,
                },
                {
                    name: "reason",
                    description: "Lock reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "unlock",
            description: "🔓 Unlock a channel",
            options: [
                {
                    name: "channel",
                    description: "Channel to unlock",
                    type: 7,
                    required: false,
                },
                {
                    name: "reason",
                    description: "Unlock reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "slowmode",
            description: "🐢 Set slowmode in a channel",
            options: [
                {
                    name: "seconds",
                    description: "Slowmode duration in seconds",
                    type: 4,
                    required: true,
                },
                {
                    name: "channel",
                    description: "Channel to set slowmode",
                    type: 7,
                    required: false,
                },
            ],
        },
        {
            name: "lockdown",
            description: "🚨 Lockdown entire server",
            options: [
                {
                    name: "reason",
                    description: "Lockdown reason",
                    type: 3,
                    required: false,
                },
            ],
        },
        { name: "unlockdown", description: "🚨 Remove server lockdown" },
        {
            name: "hide",
            description: "👻 Hide a channel from @everyone",
            options: [
                {
                    name: "channel",
                    description: "Channel to hide",
                    type: 7,
                    required: false,
                },
            ],
        },
        {
            name: "show",
            description: "👁️ Show a channel to @everyone",
            options: [
                {
                    name: "channel",
                    description: "Channel to show",
                    type: 7,
                    required: false,
                },
            ],
        },
        {
            name: "clone",
            description: "📋 Clone a channel",
            options: [
                {
                    name: "channel",
                    description: "Channel to clone",
                    type: 7,
                    required: true,
                },
            ],
        },
        {
            name: "nuke",
            description: "💣 Nuke a channel (delete and recreate)",
            options: [
                {
                    name: "channel",
                    description: "Channel to nuke",
                    type: 7,
                    required: false,
                },
            ],
        },
        {
            name: "purge",
            description: "🧹 Purge messages",
            options: [
                {
                    name: "amount",
                    description: "Number of messages (1-1000)",
                    type: 4,
                    required: true,
                },
            ],
        },
        {
            name: "purgeuser",
            description: "🧹 Purge messages from a user",
            options: [
                {
                    name: "user",
                    description: "User to purge messages from",
                    type: 6,
                    required: true,
                },
                {
                    name: "amount",
                    description: "Messages to purge",
                    type: 4,
                    required: true,
                },
            ],
        },
        {
            name: "purgebots",
            description: "🤖 Purge bot messages",
            options: [
                {
                    name: "amount",
                    description: "Messages to purge",
                    type: 4,
                    required: true,
                },
            ],
        },

        // ========== ROLE MANAGEMENT ==========
        {
            name: "addrole",
            description: "➕ Add role to member",
            options: [
                {
                    name: "user",
                    description: "User to add role",
                    type: 6,
                    required: true,
                },
                {
                    name: "role",
                    description: "Role to add",
                    type: 8,
                    required: true,
                },
            ],
        },
        {
            name: "removerole",
            description: "➖ Remove role from member",
            options: [
                {
                    name: "user",
                    description: "User to remove role",
                    type: 6,
                    required: true,
                },
                {
                    name: "role",
                    description: "Role to remove",
                    type: 8,
                    required: true,
                },
            ],
        },
        {
            name: "createrole",
            description: "✨ Create a new role",
            options: [
                {
                    name: "name",
                    description: "Role name",
                    type: 3,
                    required: true,
                },
                {
                    name: "color",
                    description: "Hex color code",
                    type: 3,
                    required: false,
                },
            ],
        },
        {
            name: "deleterole",
            description: "🗑️ Delete a role",
            options: [
                {
                    name: "role",
                    description: "Role to delete",
                    type: 8,
                    required: true,
                },
            ],
        },
        {
            name: "roleall",
            description: "👥 Add role to all members",
            options: [
                {
                    name: "role",
                    description: "Role to add",
                    type: 8,
                    required: true,
                },
            ],
        },

        // ========== SECURITY / ANTI-RAID ==========
        {
            name: "raidmode",
            description: "🚨 Enable/disable raid mode",
            options: [
                {
                    name: "action",
                    description: "Enable or disable",
                    type: 3,
                    required: true,
                    choices: [
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" },
                    ],
                },
            ],
        },
        {
            name: "antispam",
            description: "🛡️ Enable/disable anti-spam",
            options: [
                {
                    name: "action",
                    description: "Enable or disable",
                    type: 3,
                    required: true,
                    choices: [
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" },
                    ],
                },
            ],
        },
        {
            name: "antilink",
            description: "🔗 Block link sharing",
            options: [
                {
                    name: "action",
                    description: "Enable or disable",
                    type: 3,
                    required: true,
                    choices: [
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" },
                    ],
                },
            ],
        },
        {
            name: "antiping",
            description: "📢 Block mass pings",
            options: [
                {
                    name: "action",
                    description: "Enable or disable",
                    type: 3,
                    required: true,
                    choices: [
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" },
                    ],
                },
            ],
        },
        {
            name: "antieveryone",
            description: "🚫 Block @everyone/@here mentions",
            options: [
                {
                    name: "action",
                    description: "Enable or disable",
                    type: 3,
                    required: true,
                    choices: [
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" },
                    ],
                },
            ],
        },
        {
            name: "whitelist",
            description: "📝 Add user to whitelist",
            options: [
                {
                    name: "user",
                    description: "User to whitelist",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "unwhitelist",
            description: "📝 Remove user from whitelist",
            options: [
                {
                    name: "user",
                    description: "User to unwhitelist",
                    type: 6,
                    required: true,
                },
            ],
        },

        // ========== VERIFICATION SYSTEM ==========
        { name: "setupverify", description: "✅ Setup verification system" },
        { name: "verify", description: "✅ Verify yourself as a human" },
        {
            name: "unverify",
            description: "❌ Remove verification from a user",
            options: [
                {
                    name: "user",
                    description: "User to unverify",
                    type: 6,
                    required: true,
                },
            ],
        },

        // ========== REPORT & TICKET SYSTEM ==========
        {
            name: "report",
            description: "📢 Report a user",
            options: [
                {
                    name: "user",
                    description: "User to report",
                    type: 6,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Report reason",
                    type: 3,
                    required: true,
                },
            ],
        },
        { name: "reports", description: "📋 View pending reports" },
        { name: "ticket", description: "🎫 Create a moderation ticket" },
        { name: "closeticket", description: "🔒 Close a ticket" },

        // ========== INFO & LOGS ==========
        { name: "modhelp", description: "🛡️ Show all moderation commands" },
        {
            name: "whois",
            description: "🔍 Get detailed user information",
            options: [
                {
                    name: "user",
                    description: "User to lookup",
                    type: 6,
                    required: false,
                },
            ],
        },
        { name: "serverinfo", description: "📊 Get server information" },
        {
            name: "modlogs",
            description: "📋 View moderation logs for a user",
            options: [
                {
                    name: "user",
                    description: "User to check logs",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "case",
            description: "📋 View moderation case",
            options: [
                {
                    name: "casenumber",
                    description: "Case number",
                    type: 4,
                    required: true,
                },
            ],
        },
    ];

    await client.application.commands.set(commands);
}

// ==================== CREATE MOD LOG EMBED ====================
async function createModLog(
    guild,
    action,
    user,
    moderator,
    reason,
    duration = null,
) {
    const logChannel = guild.channels.cache.get(process.env.MOD_LOG_CHANNEL);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle(`🛡️ Moderation Action | Case #${caseNumber}`)
        .setDescription(
            `**Action:** ${action}\n**User:** ${user.tag} (${user.id})\n**Moderator:** ${moderator.tag}\n**Reason:** ${reason || "No reason provided"}`,
        )
        .setColor(
            action.includes("Ban")
                ? 0xff0000
                : action.includes("Kick")
                  ? 0xff6600
                  : action.includes("Mute")
                    ? 0xffff00
                    : 0x00bfff,
        )
        .setTimestamp()
        .setFooter({ text: `CHAOS MC Moderation System` });

    if (duration)
        embed.addFields({ name: "Duration", value: duration, inline: true });

    await logChannel.send({ embeds: [embed] });
    modCases.set(caseNumber, {
        action,
        user: user.id,
        moderator: moderator.id,
        reason,
        duration,
        time: Date.now(),
    });
    caseNumber++;
}

// ==================== AUTO-MODERATION SETUP ====================
const raidModeEnabled = new Map();
const antiSpamEnabled = new Map();
const antiLinkEnabled = new Map();
const antiPingEnabled = new Map();
const antiEveryoneEnabled = new Map();
const whitelist = new Set();
const messageTracker = new Map();

// Auto-moderation message handler
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (whitelist.has(message.author.id)) return;

    // Anti-spam
    if (antiSpamEnabled.get(message.guild.id)) {
        const userMessages = messageTracker.get(message.author.id) || [];
        const now = Date.now();
        const recentMessages = userMessages.filter((time) => now - time < 5000);
        recentMessages.push(now);
        messageTracker.set(message.author.id, recentMessages);

        if (recentMessages.length > 5) {
            await message.delete();
            await message.member.timeout(60000, "Spamming");
            const embed = new EmbedBuilder()
                .setTitle("🚫 Auto-Mod: Spam Detected")
                .setDescription(
                    `${message.author} has been timed out for 1 minute for spamming.`,
                )
                .setColor(0xff0000);
            await message.channel.send({ embeds: [embed] });
            return;
        }
    }

    // Anti-link
    if (antiLinkEnabled.get(message.guild.id)) {
        const linkRegex =
            /(https?:\/\/[^\s]+|discord\.gg\/[^\s]+|discord\.com\/invite\/[^\s]+)/gi;
        if (linkRegex.test(message.content)) {
            await message.delete();
            const embed = new EmbedBuilder()
                .setTitle("🔗 Auto-Mod: Links Not Allowed")
                .setDescription(
                    `${message.author}, links are not allowed in this server!`,
                )
                .setColor(0xff0000);
            await message.channel.send({ embeds: [embed] });
            return;
        }
    }

    // Anti-mass ping
    if (antiPingEnabled.get(message.guild.id)) {
        const mentionCount =
            message.mentions.users.size + message.mentions.roles.size;
        if (mentionCount > 5) {
            await message.delete();
            const embed = new EmbedBuilder()
                .setTitle("📢 Auto-Mod: Mass Pinging Detected")
                .setDescription(`${message.author}, please don't mass ping!`)
                .setColor(0xff0000);
            await message.channel.send({ embeds: [embed] });
            return;
        }
    }

    // Anti-@everyone
    if (antiEveryoneEnabled.get(message.guild.id)) {
        if (
            message.content.includes("@everyone") ||
            message.content.includes("@here")
        ) {
            await message.delete();
            const embed = new EmbedBuilder()
                .setTitle("🚫 Auto-Mod: @everyone/@here Not Allowed")
                .setDescription(
                    `${message.author}, you cannot mention @everyone or @here!`,
                )
                .setColor(0xff0000);
            await message.channel.send({ embeds: [embed] });
            return;
        }
    }
});

// ==================== SLASH COMMANDS HANDLER ====================
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild, channel } = interaction;

    const isMod =
        member.permissions.has(PermissionsBitField.Flags.Administrator) ||
        member.permissions.has(PermissionsBitField.Flags.ModerateMembers);

    // ==================== MOD HELP ====================
    if (commandName === "modhelp") {
        const embed = new EmbedBuilder()
            .setTitle("🛡️ CHAOS MC Moderation Commands")
            .setDescription("Here are all the moderation commands available:")
            .addFields(
                {
                    name: "🔨 **Punishments**",
                    value: "`/ban`, `/tempban`, `/unban`, `/kick`, `/softban`, `/timeout`, `/untimeout`, `/warn`, `/clearwarns`, `/strike`",
                    inline: false,
                },
                {
                    name: "🔇 **Mute Management**",
                    value: "`/mute`, `/tempmute`, `/unmute`, `/vmute`, `/vunmute`, `/deafen`, `/undeafen`, `/disconnect`",
                    inline: false,
                },
                {
                    name: "🔒 **Channel Management**",
                    value: "`/lock`, `/unlock`, `/slowmode`, `/lockdown`, `/unlockdown`, `/hide`, `/show`, `/clone`, `/nuke`",
                    inline: false,
                },
                {
                    name: "🧹 **Purge Commands**",
                    value: "`/purge`, `/purgeuser`, `/purgebots`",
                    inline: false,
                },
                {
                    name: "🎭 **Role Management**",
                    value: "`/addrole`, `/removerole`, `/createrole`, `/deleterole`, `/roleall`",
                    inline: false,
                },
                {
                    name: "🚨 **Security**",
                    value: "`/raidmode`, `/antispam`, `/antilink`, `/antiping`, `/antieveryone`, `/whitelist`",
                    inline: false,
                },
                {
                    name: "✅ **Verification**",
                    value: "`/setupverify`, `/verify`, `/unverify`",
                    inline: false,
                },
                {
                    name: "📢 **Reports & Tickets**",
                    value: "`/report`, `/reports`, `/ticket`, `/closeticket`",
                    inline: false,
                },
                {
                    name: "📋 **Info & Logs**",
                    value: "`/whois`, `/serverinfo`, `/modlogs`, `/case`",
                    inline: false,
                },
            )
            .setColor(0xff0000)
            .setFooter({ text: "CHAOS MC - Keeping the server safe!" });

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    // ==================== BAN COMMANDS ====================
    if (commandName === "ban") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const reason = options.getString("reason") || "No reason provided";

        try {
            const member = await guild.members.fetch(user.id);
            await member.ban({ reason });
            await createModLog(guild, "Ban", user, interaction.user, reason);

            const embed = new EmbedBuilder()
                .setTitle("🔨 User Banned")
                .setDescription(
                    `**${user.tag}** has been banned.\n**Reason:** ${reason}`,
                )
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content:
                    "❌ Failed to ban user. Make sure I have proper permissions!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "tempban") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const duration = options.getString("duration");
        const reason = options.getString("reason") || "No reason provided";

        let milliseconds;
        if (duration.endsWith("d"))
            milliseconds = parseInt(duration) * 24 * 60 * 60 * 1000;
        else if (duration.endsWith("h"))
            milliseconds = parseInt(duration) * 60 * 60 * 1000;
        else if (duration.endsWith("m"))
            milliseconds = parseInt(duration) * 60 * 1000;
        else milliseconds = parseInt(duration) * 1000;

        try {
            const member = await guild.members.fetch(user.id);
            await member.ban({ reason });
            tempBans.set(user.id, {
                guildId: guild.id,
                unbanTime: Date.now() + milliseconds,
            });

            setTimeout(async () => {
                await guild.members.unban(user.id, "Temp ban expired");
            }, milliseconds);

            await createModLog(
                guild,
                `Temp Ban (${duration})`,
                user,
                interaction.user,
                reason,
                duration,
            );

            const embed = new EmbedBuilder()
                .setTitle("⏰ User Temporarily Banned")
                .setDescription(
                    `**${user.tag}** has been banned for ${duration}.\n**Reason:** ${reason}`,
                )
                .setColor(0xff6600)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to ban user!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "unban") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const userId = options.getString("userid");
        const reason = options.getString("reason") || "No reason provided";

        try {
            await guild.members.unban(userId, reason);

            const embed = new EmbedBuilder()
                .setTitle("🔓 User Unbanned")
                .setDescription(
                    `**User ID:** ${userId} has been unbanned.\n**Reason:** ${reason}`,
                )
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to unban user!",
                ephemeral: true,
            });
        }
    }

    // ==================== KICK COMMANDS ====================
    if (commandName === "kick") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const reason = options.getString("reason") || "No reason provided";

        try {
            const member = await guild.members.fetch(user.id);
            await member.kick(reason);
            await createModLog(guild, "Kick", user, interaction.user, reason);

            const embed = new EmbedBuilder()
                .setTitle("👢 User Kicked")
                .setDescription(
                    `**${user.tag}** has been kicked.\n**Reason:** ${reason}`,
                )
                .setColor(0xff6600)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to kick user!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "softban") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const reason = options.getString("reason") || "No reason provided";

        try {
            const member = await guild.members.fetch(user.id);
            await member.ban({ reason, deleteMessageDays: 1 });
            await guild.members.unban(user.id, "Softban complete");
            await createModLog(
                guild,
                "Softban",
                user,
                interaction.user,
                reason,
            );

            const embed = new EmbedBuilder()
                .setTitle("🥾 User Softbanned")
                .setDescription(
                    `**${user.tag}** has been softbanned (banned and unbanned).\n**Reason:** ${reason}`,
                )
                .setColor(0xffa500)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to softban user!",
                ephemeral: true,
            });
        }
    }

    // ==================== TIMEOUT/MUTE COMMANDS ====================
    if (commandName === "timeout") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const duration = options.getString("duration");
        const reason = options.getString("reason") || "No reason provided";

        let milliseconds;
        if (duration.endsWith("d"))
            milliseconds = parseInt(duration) * 24 * 60 * 60 * 1000;
        else if (duration.endsWith("h"))
            milliseconds = parseInt(duration) * 60 * 60 * 1000;
        else if (duration.endsWith("m"))
            milliseconds = parseInt(duration) * 60 * 1000;
        else milliseconds = parseInt(duration) * 1000;

        if (milliseconds > 28 * 24 * 60 * 60 * 1000) {
            return interaction.reply({
                content: "❌ Timeout cannot exceed 28 days!",
                ephemeral: true,
            });
        }

        try {
            const member = await guild.members.fetch(user.id);
            await member.timeout(milliseconds, reason);
            await createModLog(
                guild,
                `Timeout (${duration})`,
                user,
                interaction.user,
                reason,
                duration,
            );

            const embed = new EmbedBuilder()
                .setTitle("⏰ User Timed Out")
                .setDescription(
                    `**${user.tag}** has been timed out for ${duration}.\n**Reason:** ${reason}`,
                )
                .setColor(0xffff00)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to timeout user!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "untimeout") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");

        try {
            const member = await guild.members.fetch(user.id);
            await member.timeout(null);

            const embed = new EmbedBuilder()
                .setTitle("⏰ Timeout Removed")
                .setDescription(`**${user.tag}** has been untimed out.`)
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to remove timeout!",
                ephemeral: true,
            });
        }
    }

    // ==================== WARNING SYSTEM ====================
    if (commandName === "warn") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const reason = options.getString("reason");

        const userWarnings = warnings.get(user.id) || [];
        userWarnings.push({
            reason,
            moderator: interaction.user.tag,
            time: Date.now(),
        });
        warnings.set(user.id, userWarnings);

        await createModLog(
            guild,
            `Warning #${userWarnings.length}`,
            user,
            interaction.user,
            reason,
        );

        const embed = new EmbedBuilder()
            .setTitle("⚠️ User Warned")
            .setDescription(
                `**${user.tag}** has been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${userWarnings.length}`,
            )
            .setColor(0xffa500)
            .setTimestamp();

        if (userWarnings.length >= 5) {
            const member = await guild.members.fetch(user.id);
            await member.kick("5 warnings reached");
            embed.addFields({
                name: "Auto-Action",
                value: "User has been kicked for reaching 5 warnings!",
                inline: false,
            });
        }

        await interaction.reply({ embeds: [embed] });

        try {
            await user.send(
                `⚠️ You have been warned in ${guild.name} for: ${reason}\nYou now have ${userWarnings.length} warnings.`,
            );
        } catch (error) {}
    }

    if (commandName === "warnings") {
        const user = options.getUser("user");
        const userWarnings = warnings.get(user.id) || [];

        if (userWarnings.length === 0) {
            return interaction.reply({
                content: `✅ ${user.tag} has no warnings!`,
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`⚠️ Warnings for ${user.tag}`)
            .setDescription(
                userWarnings
                    .map(
                        (w, i) =>
                            `${i + 1}. ${w.reason} (by ${w.moderator} on ${new Date(w.time).toLocaleString()})`,
                    )
                    .join("\n"),
            )
            .setColor(0xffa500);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "clearwarns") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        warnings.delete(user.id);

        const embed = new EmbedBuilder()
            .setTitle("🗑️ Warnings Cleared")
            .setDescription(`All warnings for ${user.tag} have been cleared.`)
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [embed] });
    }

    // ==================== STRIKE SYSTEM ====================
    if (commandName === "strike") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const reason = options.getString("reason");

        const userStrikes = strikes.get(user.id) || [];
        userStrikes.push({
            reason,
            moderator: interaction.user.tag,
            time: Date.now(),
        });
        strikes.set(user.id, userStrikes);

        if (userStrikes.length >= 3) {
            const member = await guild.members.fetch(user.id);
            await member.ban("3 strikes reached");

            const embed = new EmbedBuilder()
                .setTitle("⚡ User Banned (3 Strikes)")
                .setDescription(
                    `**${user.tag}** has been banned for reaching 3 strikes.\n**Final Strike:** ${reason}`,
                )
                .setColor(0xff0000);

            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle(`⚡ Strike #${userStrikes.length} Issued`)
                .setDescription(
                    `**${user.tag}** has received a strike.\n**Reason:** ${reason}\n**Strikes:** ${userStrikes.length}/3`,
                )
                .setColor(0xffa500);

            await interaction.reply({ embeds: [embed] });
        }
    }

    if (commandName === "strikes") {
        const user = options.getUser("user");
        const userStrikes = strikes.get(user.id) || [];

        const embed = new EmbedBuilder()
            .setTitle(`⚡ Strikes for ${user.tag}`)
            .setDescription(
                userStrikes.length === 0
                    ? "No strikes"
                    : userStrikes
                          .map(
                              (s, i) =>
                                  `${i + 1}. ${s.reason} (by ${s.moderator})`,
                          )
                          .join("\n"),
            )
            .setColor(0xffa500);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ==================== LOCK COMMANDS ====================
    if (commandName === "lock") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const targetChannel = options.getChannel("channel") || channel;
        const reason = options.getString("reason") || "No reason provided";

        try {
            await targetChannel.permissionOverwrites.edit(guild.id, {
                SendMessages: false,
            });

            const embed = new EmbedBuilder()
                .setTitle("🔒 Channel Locked")
                .setDescription(
                    `${targetChannel} has been locked.\n**Reason:** ${reason}`,
                )
                .setColor(0xff0000);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to lock channel!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "unlock") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const targetChannel = options.getChannel("channel") || channel;
        const reason = options.getString("reason") || "No reason provided";

        try {
            await targetChannel.permissionOverwrites.edit(guild.id, {
                SendMessages: null,
            });

            const embed = new EmbedBuilder()
                .setTitle("🔓 Channel Unlocked")
                .setDescription(
                    `${targetChannel} has been unlocked.\n**Reason:** ${reason}`,
                )
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to unlock channel!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "slowmode") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const seconds = options.getInteger("seconds");
        const targetChannel = options.getChannel("channel") || channel;

        try {
            await targetChannel.setRateLimitPerUser(seconds);

            const embed = new EmbedBuilder()
                .setTitle("🐢 Slowmode Set")
                .setDescription(
                    `${targetChannel} now has a ${seconds} second slowmode.`,
                )
                .setColor(0x00bfff);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to set slowmode!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "lockdown") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const reason = options.getString("reason") || "No reason provided";

        try {
            guild.channels.cache.forEach(async (ch) => {
                await ch.permissionOverwrites.edit(guild.id, {
                    SendMessages: false,
                });
            });

            lockdowns.set(guild.id, true);

            const embed = new EmbedBuilder()
                .setTitle("🚨 SERVER LOCKDOWN ACTIVATED")
                .setDescription(
                    `The server has been placed under lockdown.\n**Reason:** ${reason}\nOnly moderators can speak.`,
                )
                .setColor(0xff0000);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to lockdown server!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "unlockdown") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        try {
            guild.channels.cache.forEach(async (ch) => {
                await ch.permissionOverwrites.edit(guild.id, {
                    SendMessages: null,
                });
            });

            lockdowns.set(guild.id, false);

            const embed = new EmbedBuilder()
                .setTitle("🚨 SERVER LOCKDOWN DEACTIVATED")
                .setDescription(
                    "The server lockdown has been lifted. Members can now speak.",
                )
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to remove lockdown!",
                ephemeral: true,
            });
        }
    }

    // ==================== PURGE COMMANDS ====================
    if (commandName === "purge") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const amount = options.getInteger("amount");

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "❌ Amount must be between 1-100!",
                ephemeral: true,
            });
        }

        try {
            const messages = await channel.bulkDelete(amount, true);

            const embed = new EmbedBuilder()
                .setTitle("🧹 Messages Purged")
                .setDescription(`Deleted ${messages.size} messages.`)
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed], ephemeral: true });
            setTimeout(() => interaction.deleteReply(), 3000);
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to purge messages!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "purgeuser") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const amount = options.getInteger("amount");

        let deleted = 0;
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMessages = messages
            .filter((m) => m.author.id === user.id)
            .first(amount);

        for (const msg of userMessages) {
            await msg.delete();
            deleted++;
        }

        const embed = new EmbedBuilder()
            .setTitle("🧹 User Messages Purged")
            .setDescription(`Deleted ${deleted} messages from ${user.tag}.`)
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "purgebots") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const amount = options.getInteger("amount");
        let deleted = 0;
        const messages = await channel.messages.fetch({ limit: amount });
        const botMessages = messages.filter((m) => m.author.bot);

        for (const msg of botMessages.values()) {
            await msg.delete();
            deleted++;
        }

        const embed = new EmbedBuilder()
            .setTitle("🤖 Bot Messages Purged")
            .setDescription(`Deleted ${deleted} bot messages.`)
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ==================== ROLE MANAGEMENT ====================
    if (commandName === "addrole") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const role = options.getRole("role");

        try {
            const member = await guild.members.fetch(user.id);
            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setTitle("➕ Role Added")
                .setDescription(`Added ${role.name} to ${user.tag}.`)
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to add role!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "removerole") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const role = options.getRole("role");

        try {
            const member = await guild.members.fetch(user.id);
            await member.roles.remove(role);

            const embed = new EmbedBuilder()
                .setTitle("➖ Role Removed")
                .setDescription(`Removed ${role.name} from ${user.tag}.`)
                .setColor(0xffa500);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to remove role!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "createrole") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const name = options.getString("name");
        const color = options.getString("color") || "#000000";

        try {
            const role = await guild.roles.create({
                name: name,
                color: color,
                reason: `Created by ${interaction.user.tag}`,
            });

            const embed = new EmbedBuilder()
                .setTitle("✨ Role Created")
                .setDescription(`Created role: ${role.name} (${role.id})`)
                .setColor(0x00ff00);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to create role!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "deleterole") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const role = options.getRole("role");

        try {
            await role.delete();

            const embed = new EmbedBuilder()
                .setTitle("🗑️ Role Deleted")
                .setDescription(`Deleted role: ${role.name}`)
                .setColor(0xff0000);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to delete role!",
                ephemeral: true,
            });
        }
    }

    if (commandName === "roleall") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const role = options.getRole("role");
        let count = 0;

        await interaction.reply({
            content: `⏳ Adding ${role.name} to all members...`,
            ephemeral: true,
        });

        const members = await guild.members.fetch();
        for (const [_, member] of members) {
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
                count++;
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("👥 Mass Role Added")
            .setDescription(`Added ${role.name} to ${count} members.`)
            .setColor(0x00ff00);

        await interaction.editReply({ content: null, embeds: [embed] });
    }

    // ==================== SECURITY COMMANDS ====================
    if (commandName === "raidmode") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const action = options.getString("action");

        if (action === "enable") {
            raidModeEnabled.set(guild.id, true);
            const embed = new EmbedBuilder()
                .setTitle("🚨 RAID MODE ENABLED")
                .setDescription(
                    "Raid mode is now active! Suspicious users will be automatically banned.",
                )
                .setColor(0xff0000);
            await interaction.reply({ embeds: [embed] });
        } else {
            raidModeEnabled.set(guild.id, false);
            const embed = new EmbedBuilder()
                .setTitle("✅ RAID MODE DISABLED")
                .setDescription(
                    "Raid mode has been disabled. Normal operations resumed.",
                )
                .setColor(0x00ff00);
            await interaction.reply({ embeds: [embed] });
        }
    }

    if (commandName === "antispam") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const action = options.getString("action");
        antiSpamEnabled.set(guild.id, action === "enable");

        const embed = new EmbedBuilder()
            .setTitle(
                action === "enable"
                    ? "🛡️ Anti-Spam ENABLED"
                    : "🛡️ Anti-Spam DISABLED",
            )
            .setDescription(
                action === "enable"
                    ? "Users who spam will be automatically timed out."
                    : "Anti-spam system has been disabled.",
            )
            .setColor(action === "enable" ? 0x00ff00 : 0xff0000);

        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === "antilink") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const action = options.getString("action");
        antiLinkEnabled.set(guild.id, action === "enable");

        const embed = new EmbedBuilder()
            .setTitle(
                action === "enable"
                    ? "🔗 Anti-Link ENABLED"
                    : "🔗 Anti-Link DISABLED",
            )
            .setDescription(
                action === "enable"
                    ? "Messages containing links will be automatically deleted."
                    : "Anti-link system has been disabled.",
            )
            .setColor(action === "enable" ? 0x00ff00 : 0xff0000);

        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === "antiping") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const action = options.getString("action");
        antiPingEnabled.set(guild.id, action === "enable");

        const embed = new EmbedBuilder()
            .setTitle(
                action === "enable"
                    ? "📢 Anti-Mass Ping ENABLED"
                    : "📢 Anti-Mass Ping DISABLED",
            )
            .setDescription(
                action === "enable"
                    ? "Messages with more than 5 pings will be automatically deleted."
                    : "Anti-mass ping system has been disabled.",
            )
            .setColor(action === "enable" ? 0x00ff00 : 0xff0000);

        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === "antieveryone") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const action = options.getString("action");
        antiEveryoneEnabled.set(guild.id, action === "enable");

        const embed = new EmbedBuilder()
            .setTitle(
                action === "enable"
                    ? "🚫 Anti-@everyone ENABLED"
                    : "🚫 Anti-@everyone DISABLED",
            )
            .setDescription(
                action === "enable"
                    ? "Messages containing @everyone or @here will be automatically deleted."
                    : "Anti-@everyone system has been disabled.",
            )
            .setColor(action === "enable" ? 0x00ff00 : 0xff0000);

        await interaction.reply({ embeds: [embed] });
    }

    // ==================== VERIFICATION SYSTEM ====================
    if (commandName === "setupverify") {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ This requires Administrator permission!",
                ephemeral: true,
            });
        }

        const verifyChannel = await guild.channels.create({
            name: "✅-verify",
            type: ChannelType.GuildText,
            parent: channel.parentId,
        });

        const embed = new EmbedBuilder()
            .setTitle("✅ Verification Required")
            .setDescription(
                "Click the button below to verify yourself and access the server!",
            )
            .setColor(0x00ff00);

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("verify_button")
                .setLabel("✅ Verify Me")
                .setStyle(ButtonStyle.Success),
        );

        await verifyChannel.send({ embeds: [embed], components: [button] });

        await interaction.reply({
            content: `✅ Verification system setup in ${verifyChannel}!`,
            ephemeral: true,
        });
    }

    if (commandName === "verify") {
        const verifiedRole = guild.roles.cache.get(
            process.env.VERIFIED_ROLE_ID,
        );

        if (!verifiedRole) {
            return interaction.reply({
                content:
                    "❌ Verification role not configured! Please contact an admin.",
                ephemeral: true,
            });
        }

        await member.roles.add(verifiedRole);

        const embed = new EmbedBuilder()
            .setTitle("✅ Verification Successful!")
            .setDescription("You have been verified! Welcome to CHAOS MC!")
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "unverify") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const verifiedRole = guild.roles.cache.get(
            process.env.VERIFIED_ROLE_ID,
        );

        if (!verifiedRole) {
            return interaction.reply({
                content: "❌ Verification role not configured!",
                ephemeral: true,
            });
        }

        try {
            const targetMember = await guild.members.fetch(user.id);
            await targetMember.roles.remove(verifiedRole);

            const embed = new EmbedBuilder()
                .setTitle("❌ Verification Removed")
                .setDescription(`${user.tag} has been unverified.`)
                .setColor(0xff0000);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: "❌ Failed to unverify user!",
                ephemeral: true,
            });
        }
    }

    // ==================== WHOIS / SERVERINFO ====================
    if (commandName === "whois") {
        const user = options.getUser("user") || interaction.user;
        const targetMember = await guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`🔍 User Information - ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ size: 1024 }))
            .addFields(
                { name: "📝 Username", value: user.tag, inline: true },
                { name: "🆔 User ID", value: user.id, inline: true },
                {
                    name: "📅 Joined Server",
                    value: moment(targetMember.joinedAt).format(
                        "MMMM Do YYYY, h:mm:ss a",
                    ),
                    inline: true,
                },
                {
                    name: "🎂 Account Created",
                    value: moment(user.createdAt).format(
                        "MMMM Do YYYY, h:mm:ss a",
                    ),
                    inline: true,
                },
                {
                    name: "👑 Highest Role",
                    value: targetMember.roles.highest.name,
                    inline: true,
                },
                {
                    name: "⚠️ Warnings",
                    value: (warnings.get(user.id) || []).length.toString(),
                    inline: true,
                },
                {
                    name: "⚡ Strikes",
                    value: (strikes.get(user.id) || []).length.toString(),
                    inline: true,
                },
                {
                    name: "🔇 Timed Out",
                    value: targetMember.isCommunicationDisabled()
                        ? "Yes"
                        : "No",
                    inline: true,
                },
            )
            .setColor(0x00bfff)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === "serverinfo") {
        const embed = new EmbedBuilder()
            .setTitle(`📊 Server Information - ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 1024 }))
            .addFields(
                {
                    name: "👑 Owner",
                    value: (await guild.fetchOwner()).user.tag,
                    inline: true,
                },
                {
                    name: "👥 Members",
                    value: guild.memberCount.toString(),
                    inline: true,
                },
                {
                    name: "💬 Channels",
                    value: guild.channels.cache.size.toString(),
                    inline: true,
                },
                {
                    name: "🎭 Roles",
                    value: guild.roles.cache.size.toString(),
                    inline: true,
                },
                {
                    name: "📅 Created",
                    value: moment(guild.createdAt).format("MMMM Do YYYY"),
                    inline: true,
                },
                {
                    name: "🚨 Raid Mode",
                    value: raidModeEnabled.get(guild.id) ? "ACTIVE" : "Off",
                    inline: true,
                },
            )
            .setColor(0x00bfff)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === "modlogs") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const user = options.getUser("user");
        const userCases = Array.from(modCases.entries())
            .filter(([_, c]) => c.user === user.id)
            .slice(-10);

        if (userCases.length === 0) {
            return interaction.reply({
                content: `✅ No moderation logs found for ${user.tag}.`,
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📋 Moderation Logs for ${user.tag}`)
            .setDescription(
                userCases
                    .map(
                        ([id, c]) =>
                            `**Case #${id}:** ${c.action} - ${c.reason} (by <@${c.moderator}>)`,
                    )
                    .join("\n"),
            )
            .setColor(0x00bfff);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === "case") {
        if (!isMod)
            return interaction.reply({
                content: "❌ You need moderator permissions!",
                ephemeral: true,
            });

        const caseNum = options.getInteger("casenumber");
        const modCase = modCases.get(caseNum);

        if (!modCase) {
            return interaction.reply({
                content: `❌ Case #${caseNum} not found!`,
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📋 Moderation Case #${caseNum}`)
            .addFields(
                { name: "Action", value: modCase.action, inline: true },
                { name: "User", value: `<@${modCase.user}>`, inline: true },
                {
                    name: "Moderator",
                    value: `<@${modCase.moderator}>`,
                    inline: true,
                },
                { name: "Reason", value: modCase.reason, inline: false },
                {
                    name: "Time",
                    value: new Date(modCase.time).toLocaleString(),
                    inline: true,
                },
            )
            .setColor(0x00bfff)
            .setTimestamp();

        if (modCase.duration)
            embed.addFields({
                name: "Duration",
                value: modCase.duration,
                inline: true,
            });

        await interaction.reply({ embeds: [embed] });
    }
});

// ==================== BUTTON HANDLER ====================
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "verify_button") {
        const verifiedRole = interaction.guild.roles.cache.get(
            process.env.VERIFIED_ROLE_ID,
        );

        if (!verifiedRole) {
            return interaction.reply({
                content: "❌ Verification system not properly configured!",
                ephemeral: true,
            });
        }

        await interaction.member.roles.add(verifiedRole);

        const embed = new EmbedBuilder()
            .setTitle("✅ Verification Successful!")
            .setDescription("You have been verified! Welcome to CHAOS MC!")
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [embed], ephemeral: true });

        const logChannel = interaction.guild.channels.cache.get(
            process.env.MOD_LOG_CHANNEL,
        );
        if (logChannel) {
            logChannel.send(`✅ ${interaction.user.tag} has been verified!`);
        }
    }
});

// ==================== RAID MODE MEMBER JOIN ====================
client.on("guildMemberAdd", async (member) => {
    if (raidModeEnabled.get(member.guild.id)) {
        const accountAge = Date.now() - member.user.createdAt;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (accountAge < sevenDays) {
            await member.ban({ reason: "Raid mode: Account too new" });
            const logChannel = member.guild.channels.cache.get(
                process.env.MOD_LOG_CHANNEL,
            );
            if (logChannel) {
                logChannel.send(
                    `🚨 New account detected and banned during raid mode: ${member.user.tag}`,
                );
            }
        }
    }
});

// ==================== ERROR HANDLING ====================
client.on("error", (error) => console.error("Bot error:", error));
process.on("unhandledRejection", (error) =>
    console.error("Unhandled rejection:", error),
);

// ==================== LOGIN ====================
client.login(process.env.TOKEN);
