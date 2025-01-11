import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
  name: 'encryption',
  description: 'Generate random strings of characters',
  category: 'fun',
  aliases: ['password', 'pass', 'passgen'],
  execute: async (message, args) => {
    const lines = parseInt(args[0]);

    if (!lines || isNaN(lines) || lines < 1) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Please provide a valid number of lines to generate.',
        color: 0xFF0000
      });
    }
    if (lines > 100) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Maximum number of lines is 100.',
        color: 0xFF0000
      });
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    let output = '';

    for (let i = 0; i < lines; i++) {
      let line = '';
      for (let j = 0; j < 50; j++) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        line += Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase();
      }
      output += line + '\n';
    }

    await sendMessage(message, {
      content: '```' + output + '```'
    });
  }
};
