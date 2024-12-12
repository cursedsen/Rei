import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'avatar',
    async execute(message) {
        const user = message.mentions.users.first() || message.author;
        const avatarUrl = user.displayAvatarURL({ size: 4096 });

        await sendMessage(message, {
            embeds: [{
                title: `${user.displayName}'s Avatar`,
                image: {
                    url: avatarUrl
                },
                color: 0x2B2D31
            }]
        });
    }
};
