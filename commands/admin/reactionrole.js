import { sendMessage } from '../../functions/reiMessageMaker.js';
import { createReactionRole, createReactionMessage } from '../../functions/reactionRoles.js';

export default {
    name: 'reactionrole',
    description: 'Create a reaction role message',
    category: 'admin',
    permissions: ['ManageRoles'],
    usage: '<description>',
    async execute(message, args) {
        if (!args.length) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a description for the reaction role message.',
                color: 0xFF0000
            });
        }

        const description = args.join(' ');
        
        const reactionMessage = await sendMessage(message.channel, {
            title: '🎭 Role Selection',
            description: description,
            color: 0x2B2D31,
            footer: { text: 'React to get roles!' }
        });

        await createReactionMessage(
            reactionMessage.id,
            message.guild.id,
            message.channel.id,
            description
        );

        await sendMessage(message, {
            title: 'Setup Instructions',
            description: [
                'Reaction role message created!',
                '',
                'To add roles, use the command:',
                '`.addreaction <messageId> <emoji> <@role>`',
                '',
                `Message ID: ${reactionMessage.id}`
            ].join('\n'),
            color: 0x00FF00
        });
    }
}; 