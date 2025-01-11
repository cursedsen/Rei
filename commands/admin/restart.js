import { sendMessage } from "../../functions/reiMessageMaker.js";
import { isBotMaster } from "../../config/botMasters.js";

export default {
  name: "restart",
  description: "Restart Rei",
  category: "admin",
  async execute(message) {
    if (!isBotMaster(message.author.id)) {
      return await sendMessage(message, {
        title: "Access Denied",
        description: "Only bot owners can restart Rei.",
        color: 0xff0000,
      });
    }

    await sendMessage(message, {
      title: "Restarting...",
      description: "The bot will restart momentarily.",
      color: 0xffa500,
    });

    message.client.destroy();
    process.exit(0);
  }
};
