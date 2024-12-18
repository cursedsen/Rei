import { isBotMaster } from '../config/botMasters.js';
import { sendMessage } from './reiMessageMaker.js';

export async function checkPermissions(message, command) {
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