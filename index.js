import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import * as math from 'mathjs';
import { sendMessage } from './functions/reiMessageMaker.js';
import { logModAction } from './functions/auditLogger.js';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}`);
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
            const command = (await import(importPath)).default;
            commands.set(command.name, command);
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
  
  const prefix = '.';
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
    
    if (command.category === 'moderation') {
      const targetUser = message.mentions.users.first();
      const reason = args.slice(1).join(' ');
      await logModAction(message, commandName, targetUser, reason);
    }
  } catch (error) {
    console.error(error);
    await sendMessage(message, {
      title: 'Error',
      description: 'That is not a valid command.',
      color: 0xff0000
    });
  }
});

client.login(process.env.TOKEN);
