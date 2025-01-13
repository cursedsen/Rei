import { readFileSync } from "fs";
import { sendMessage } from "../functions/reiMessageMaker.js";
import { AttachmentBuilder } from "discord.js";

export default {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;
    if (message.content.includes('@everyone') || message.content.includes('@here')) return;
    if (message.reference || message.type === 'REPLY') return;
    if (!message.mentions.has(message.client.user.id)) return;

    if (Math.random() < 0.1) {
      try {
        const errrrGif = new AttachmentBuilder('./assets/gifs/errrr.gif');
        await message.channel.send({ files: [errrrGif] });
      } catch (error) {
        console.error('Error sending errrr.gif:', error);
        const strings = JSON.parse(readFileSync("./things/strings.json", "utf8"));
        const responses = strings.ping_responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        await sendMessage(message, { content: randomResponse });
      }
      return;
    }

    const strings = JSON.parse(readFileSync("./things/strings.json", "utf8"));
    const responses = strings.ping_responses;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    await sendMessage(message, {
      content: randomResponse,
    });
  },
};
