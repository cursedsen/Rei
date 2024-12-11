export default {
    name: 'band',
    async execute(message) {
        if (message.author.bot) return;
        
        if (!message.content.toLowerCase().includes('band')) return;

        const instruments = ['🎸', '🎹', '🥁', '🎺', '🎻', '🎷', '🪘', '🎵'];
        const selectedEmojis = [...instruments]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        for (const emoji of selectedEmojis) {
            await message.react(emoji);
        }
    }
};
