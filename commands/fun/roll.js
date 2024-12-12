import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'roll',
    description: 'Roll the dice, because it is so very nice~',
    usage: '<dice notation>',
    execute: async (message, args) => {
        if (!args.length) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide dice notation (e.g. 2d20 or 2d20 + 1d6 + 5)',
                color: 0xFF0000
            });
        }

        const validDice = [4, 6, 8, 10, 12, 20];
        const diceNotation = args.join('').toLowerCase().replace(/\s/g, '');
        const parts = diceNotation.split('+');
        let totalSum = 0;
        let rollDetails = [];

        try {
            for (const part of parts) {
                if (part.includes('d')) {
                    const [count, sides] = part.split('d').map(Number);
                    
                    if (!count || !sides || count < 1 || count > 100 || !validDice.includes(sides)) {
                        return await sendMessage(message, {
                            title: 'Error',
                            description: 'Invalid dice notation. Only d4, d6, d8, d10, d12 and d20 are allowed',
                            color: 0xFF0000
                        });
                    }

                    let rolls = [];
                    for (let i = 0; i < count; i++) {
                        const roll = Math.floor(Math.random() * sides) + 1;
                        rolls.push(roll);
                        totalSum += roll;
                    }
                    
                    rollDetails.push(`${count}d${sides}: [${rolls.join(', ')}]`);
                } else {
                    const modifier = parseInt(part);
                    if (isNaN(modifier)) {
                        return await sendMessage(message, {
                            title: 'Error',
                            description: 'Invalid modifier. Please use numbers only for modifiers.',
                            color: 0xFF0000
                        });
                    }
                    totalSum += modifier;
                    rollDetails.push(`Modifier: +${modifier}`);
                }
            }

            await sendMessage(message, {
                title: '🎲 Results:',
                description: [
                    '**Rolls:**',
                    rollDetails.join('\n'),
                    '',
                    `**Final Result:** ${totalSum}`
                ].join('\n'),
                color: 0x2B2D31,
            });

        } catch (error) {
            await sendMessage(message, {
                title: 'Error',
                description: 'Invalid dice notation. Use format like 2d20 or 2d20+1d6+5',
                color: 0xFF0000
            });
        }
    }
};
