import { readFileSync } from 'fs';
import { sendMessage } from "../../functions/reiMessageMaker.js";

export default {
  name: 'bean',
  description: 'Bean a user.',
  category: 'fun',
  permissions: ['BanMembers'],
  usage: '<user> [reason]',
  aliases: ['punish', 'troll', 'bange', 'jail'],
  execute: async (message, args) => {
    if (!args[0]) {
      return await sendMessage(message, {
        content: 'Please provide a valid user tag or ID to ban.'
      });
    }

    let target = message.mentions.members.first();

    if (!target) {
      target = await message.guild.members.fetch(args[0]).catch(() => null);
    }

    if (!target) {
      return await sendMessage(message, {
        content: 'Could not find that user.'
      });
    }

    if (target.id === message.author.id) {
      return await sendMessage(message, {
        content: 'Nice try.',
      });
    }

    const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
    const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

    await sendMessage(message, {
      content: `<@${target.id}> was ${funnyRandomAction}`,
    });
  }
};
