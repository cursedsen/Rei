import { Client, GatewayIntentBits, Partials } from "discord.js";
import { readFileSync } from "fs";
import { readdirSync } from "fs";
import { config } from "dotenv";


import { checkPermissions } from "./functions/permissionHandler.js";
import { getServerPrefix } from "./functions/serverConfig.js";
import { logModAction } from "./functions/auditLogger.js";
import { handleError } from "./functions/errorHandler.js";

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

const commands = new Map();
const commandFolders = readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = await import(`./commands/${folder}/${file}`);
    commands.set(command.default.name, command.default);
  }
}

const eventFiles = readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  if (event.default.once) {
    client.once(event.default.name, (...args) => event.default.execute(...args));
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args));
  }
}

client.on("ready", async () => {
  console.log("ready");
  console.log(`Logged in as ${client.user.username}`);

  const startupEvent = (await import("./events/startup.js")).default;
  await startupEvent.execute(client);

  const strings = JSON.parse(readFileSync("./things/strings.json", "utf8"));
  const statusMessages = strings.status;

  client.user.setStatus("idle");
  client.user.setActivity(
    statusMessages[Math.floor(Math.random() * statusMessages.length)],
    { type: 4 }
  );

  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * statusMessages.length);
    client.user.setActivity(statusMessages[randomIndex], { type: 4 });
  }, 30 * 1000);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = await getServerPrefix(message.guild.id);
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = commands.get(commandName);
  if (!command) return;

  try {
    if (await checkPermissions(message, command)) {
      await command.execute(message, args, commands);

      if (command.category === "moderation") {
        const targetUser = message.mentions.users.first();
        const reason = args.slice(1).join(" ");
        await logModAction(message, commandName, targetUser, reason);
      }
    }
  } catch (error) {
    await handleError(error, message);
  }
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

client.login(process.env.TOKEN);
