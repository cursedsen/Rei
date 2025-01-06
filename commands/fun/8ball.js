import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: '8ball',
    description: 'Ask 8ball a question',
    category: 'fun',
    usage: '<question>',
    aliases: ['8b', '8'],
    execute: async (message, args) => {
        if (!args.length) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please ask a question!',
                color: 0xFF0000
            });
        }

        const initialMessage = await sendMessage(message, {
            content: "Thinking..."
        });

        const delay = Math.floor(Math.random() * 3000) + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        const responses = [
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
            
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        ];

        const question = args.join(' ');
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        await initialMessage.edit({
            content: `${response}`
        });
    }
};
