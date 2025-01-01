import { sendMessage } from "../functions/reiMessageMaker.js";

export default {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot) return;

        const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(twitter\.com|x\.com)\/[^\s]+/g;
        const redditRegex = /(?:https?:\/\/)?(?:www\.)?reddit\.com\/[^\s]+/g;

        let content = message.content;
        let hasMatch = false;

        content = content.replace(twitterRegex, (match) => {
            hasMatch = true;
            if (match.includes('twitter.com')) {
                return match.replace('twitter.com', 'fxtwitter.com');
            } else {
                return match.replace('x.com', 'fixupx.com');
            }
        });

        content = content.replace(redditRegex, (match) => {
            hasMatch = true;
            return match.replace('reddit.com', 'rxddit.com');
        });

        if (hasMatch) {
            try {
                await message.delete();
                await sendMessage(message.channel, {
                    content: `<@${message.author.id}> shared:\n\n${content}`
                });
            } catch (error) {
                console.error('Error in fixLinks:', error);
            }
        }
    }
};
