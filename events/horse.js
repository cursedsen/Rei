export default {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    if (!message.content.toLowerCase().includes("horse")) return;

    const horseEmojis = ["🐴", "🐎"];
    const selectedEmojis = [...horseEmojis]
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    for (const emoji of selectedEmojis) {
      await message.react(emoji);
    }
  }
};
