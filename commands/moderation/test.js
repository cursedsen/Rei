import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
  name: 'test',
  description: 'a test command to verify the bot is working',
  category: 'moderation',
  permissions: ['Administrator'],
  async execute(message, args) {
    await sendMessage(message, {
      title: 'ReiMessageMaker Test Command',
      description: 'Test description',
      color: 0x7289da,
      fields: [
        { name: 'Title Field', value: 'Test title' },
        { name: 'Description Field', value: 'Test description' },
        { name: 'Color Field', value: 'Test color' },
        { name: 'Fields Array', value: 'Test fields' },
        { name: 'Timestamp', value: 'Test timestamp' },
        { name: 'Author Field', value: message.author.tag },
        { name: 'Footer Text', value: 'Test footer' },
        { name: 'Footer Icon', value: 'Test footer icon' },
        { name: 'Thumbnail', value: 'Test thumbnail' },
        { name: 'Image', value: 'Test image' },
        { name: 'URL', value: 'Test url' }
      ],
      footer: { text: 'Test footer' },
      footerIcon: message.author.displayAvatarURL(),
      thumbnail: message.guild.iconURL(),
      image: 'https://sen.wtf/favicon.gif',
      url: 'https://sen.wtf/',
      timestamp: true
    });
  }
};