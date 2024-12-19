import { sendMessage } from '../../functions/reiMessageMaker.js';
import { createReactionRole } from '../../functions/reactionRoles.js';

export default {
    name: 'addreaction',
    description: 'Add a reaction role to a message',
    category: 'admin',
    permissions: ['ManageRoles'],
    usage: '<messageId> <emoji> <@role>',
    async execute(message, args) {
        if (args.length < 3) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a message ID, emoji, and role.',
                color: 0xFF0000
            });
        }

        const [messageId, emoji] = args;
        const role = message.mentions.roles.first();

        if (!role) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please mention a valid role.',
                color: 0xFF0000
            });
        }

        try {
            const targetMessage = await message.channel.messages.fetch(messageId);
            await targetMessage.react(emoji);
            
            await createReactionRole(
                message.guild.id,
                message.channel.id,
                messageId,
                emoji,
                role.id
            );

            await sendMessage(message, {
                title: 'Success',
                description: `Added reaction role:\nEmoji: ${emoji}\nRole: ${role.name}`,
                color: 0x00FF00
            });
        } catch (error) {
            await sendMessage(message, {
                title: 'Error',
                description: 'Failed to add reaction role. Make sure the message ID and emoji are valid.',
                color: 0xFF0000
            });
        }
    }
}; 