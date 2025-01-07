import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';

export default {
    name: 'unlock',
    description: 'Unlock the channel for everyone',
    category: 'moderation',
    permissions: ['ManageChannels'],
    usage: '[reason]',
    async execute(message, args) {
        const reason = args.join(' ') || 'No reason provided';

        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null
            });

            await sendMessage(message, {
                title: '🔓 Channel Unlocked',
                description: `This channel has been unlocked.\nReason: ${reason}`,
                color: 0x00FF00,
                timestamp: true
            });

            await logModAction(message, 'unlock', null, `Channel: ${message.channel.name} | ${reason}`);
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'Failed to unlock the channel. Make sure I have the correct permissions.',
                color: 0xFF0000
            });
        }
    }
}; 