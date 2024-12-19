import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import * as math from 'mathjs';
import { sendMessage } from './functions/reiMessageMaker.js';
import { logModAction } from './functions/auditLogger.js';
import { getServerPrefix } from './functions/serverConfig.js';
import { handleError } from './functions/errorHandler.js';
import { readFileSync } from 'fs';
import { checkPermissions } from './functions/permissionHandler.js';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.username}`);
  
  const startupEvent = (await import('./events/startup.js')).default;
  await startupEvent.execute(client);
  
  const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
  const statusMessages = strings.status;
  
  client.user.setStatus('idle');
  client.user.setActivity(statusMessages[Math.floor(Math.random() * statusMessages.length)], { type: 4 });
  
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * statusMessages.length);
    client.user.setActivity(statusMessages[randomIndex], { type: 4 });
  }, 30 * 1000);
});

const commands = new Map();

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadCommands(dir) {
    const files = readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const path = join(dir, file.name);
        
        if (file.isDirectory()) {
            await loadCommands(path);
        } else if (file.name.endsWith('.js')) {
            const importPath = path.replace(__dirname, '.').replace(/\\/g, '/');
            try {
                const command = (await import(importPath)).default;
                if (!command || !command.name) {
                    console.warn(`Warning: Command file ${file.name} does not export a valid command object`);
                    continue;
                }
                commands.set(command.name, command);
            } catch (error) {
                console.error(`Error loading command from ${file.name}:`, error);
            }
        }
    }
}

await loadCommands(join(__dirname, 'commands'));

async function loadEvents(dir) {
  const files = readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const path = join(dir, file.name);
    
    if (file.isDirectory()) {
      await loadEvents(path);
    } else if (file.name.endsWith('.js')) {
      const importPath = path.replace(__dirname, '.').replace(/\\/g, '/');
      const event = (await import(importPath)).default;
      
      if (Array.isArray(event)) {
        event.forEach(e => {
          if (e.once) {
            client.once(e.name, (...args) => e.execute(...args));
          } else {
            client.on(e.name, (...args) => e.execute(...args));
          }
        });
      } else {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }
      }
    }
  }
}

await loadEvents(join(__dirname, 'events'));

client.on('messageCreate', async message => {
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
        
        if (command.category === 'moderation') {
            const targetUser = message.mentions.users.first();
            const reason = args.slice(1).join(' ');
            await logModAction(message, commandName, targetUser, reason);
        }
    }
  } catch (error) {
    await handleError(error, message);
  }
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.TOKEN);
