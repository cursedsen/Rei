import { isBotMaster } from '../config/botMasters.js';
import { sendMessage } from './reiMessageMaker.js';
import { readFileSync } from 'fs';

export async function checkPermissions(message, command) {
  const blacklist = JSON.parse(readFileSync('./things/blacklist.json', 'utf8'));
  if (blacklist.blacklisted.includes(message.author.id)) {
    await sendMessage(message, {
      title: 'Access Denied',
      description: 'You are not permitted to use commands.',
      color: 0xFF0000,
    });
    return false;
  }

  if (isBotMaster(message.author.id)) {
    return true;
  }

  if (!command.permissions) {
    return true;
  }

  const hasPermission = command.permissions.every(perm =>
    message.member.permissions.has(perm)
  );

  if (!hasPermission) {
    await sendMessage(message, {
      title: 'Access Denied',
      description: 'You do not have permission to use this command.',
      color: 0xFF0000,
    });
    return false;
  }

  return true;
}