import { readFileSync, writeFileSync } from 'fs';
import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';
import { isBotMaster } from "../../config/botMasters.js";

export default {
  name: 'blacklist',
  description: 'Add a user to the bot\'s blacklist',
  category: 'moderation',
  usage: '<user>',
  execute: async (message, args) => {
    if (!isBotMaster(message.author.id)) {
      return await sendMessage(message, {
        title: "Access Denied",
        description: "Only bot owners can restart Rei.",
        color: 0xff0000,
      });
    }

    if (!args[0]) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Please provide a valid user tag or ID to blacklist.',
        color: 0xFF0000
      });
    }

    let target = message.mentions.users.first();

    if (!target) {
      try {
        target = await message.client.users.fetch(args[0]);
      } catch (err) {
        return await sendMessage(message, {
          title: 'Error',
          description: 'Could not find that user.',
          color: 0xFF0000
        });
      }
    }

    try {
      const blacklistData = JSON.parse(readFileSync('./things/blacklist.json', 'utf8'));

      if (blacklistData.blacklisted.includes(target.id)) {
        return await sendMessage(message, {
          title: 'Error',
          description: 'This user is already blacklisted.',
          color: 0xFF0000
        });
      }

      blacklistData.blacklisted.push(target.id);
      writeFileSync('./things/blacklist.json', JSON.stringify(blacklistData, null, 4));

      await logModAction(message, 'blacklist', target, 'Added to bot blacklist');

      await sendMessage(message, {
        title: 'Success',
        description: `Added ${target.tag} to the blacklist.`,
        color: 0x57F287
      });
    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        title: 'Error',
        description: 'An error occurred while updating the blacklist.',
        color: 0xFF0000
      });
    }
  }
};