import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';

export default {
    name: 'lock',
    description: 'Lock the channel for everyone',
    category: 'moderation',
    permissions: ['ManageChannels'],
    usage: '[reason]',
    async execute(message, args) {
        const reason = args.join(' ') || 'No reason provided';

        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            await sendMessage(message, {
                title: '🔒 Channel Locked',
                description: `This channel has been locked.\nReason: ${reason}`,
                color: 0xFF0000,
                timestamp: true
            });

            await logModAction(message, 'lock', null, `Channel: ${message.channel.name} | ${reason}`);
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'Failed to lock the channel. Make sure I have the correct permissions.',
                color: 0xFF0000
            });
        }
    }
};
