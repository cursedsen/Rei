import { sendMessage } from '../functions/reiMessageMaker.js';

export default {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    const hexRegex = /(?:#|0x)([A-Fa-f0-9]{6})\b/gi;
    const matches = message.content.match(hexRegex);

    if (!matches) return;

    for (const match of matches) {
      const hexCode = match.startsWith('0x') ? '#' + match.substring(2) : match;
      const hexColor = parseInt(hexCode.substring(1), 16);
      const colorPreview = `https://singlecolorimage.com/get/${hexCode.substring(1)}/100x100`;

      try {
        await sendMessage(message, {
          embeds: [{
            title: `${hexCode.toUpperCase()}`,
            description: `RGB: ${hexToRgb(hexCode)}`,
            color: hexColor,
            thumbnail: {
              url: colorPreview
            }
          }]
        });
      } catch (error) {
        console.error('Error sending color preview:', error);
      }
    }
  }
};

function hexToRgb(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}