import { sendMessage } from "../functions/reiMessageMaker.js";

export default {
  name: "ThisIsNoLongerActive", //change this to "messageCreate" to activate the event
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
      } catch (error) {
        if (error.code === 10008) {
          return;
        }
        console.error('Error in fixLinks:', error);
      }
      await sendMessage(message.channel, {
        content: `<@${message.author.id}> shared:\n\n${content}`
      });
    }
  }
};
