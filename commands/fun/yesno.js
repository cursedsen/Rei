import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
  name: 'yesno',
  description: 'Yes or no?',
  category: 'fun',
  execute: async (message) => {
    const result = Math.random() < 0.5 ? 'Yes' : 'No';

    await sendMessage(message, {
      content: result
    });
  }
};

