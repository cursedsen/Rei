import { sendMessage } from '../../functions/reiMessageMaker.js';
import sharp from 'sharp';

export default {
  name: 'gif',
  description: 'Convert an image to GIF format',
  category: 'media',
  usage: '<attach image or use on last image>',

  async execute(message, args) {
    let attachment = message.attachments.first();

    if (!attachment) {
      const messages = await message.channel.messages.fetch({ limit: 20 });
      const lastImageMessage = messages.find(msg => msg.attachments.size > 0 &&
        msg.attachments.first().contentType?.startsWith('image/'));

      if (!lastImageMessage) {
        return await sendMessage(message, {
          title: 'Error',
          description: 'No recent images found! Please attach an image or use the command after an image is sent.',
          color: 0xFF0000
        });
      }

      attachment = lastImageMessage.attachments.first();
    }

    if (!attachment.contentType?.startsWith('image/')) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Please provide a valid image file!',
        color: 0xFF0000
      });
    }

    try {
      const response = await fetch(attachment.url);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      const gifBuffer = await sharp(imageBuffer)
        .toFormat('gif')
        .toBuffer();

      await message.channel.send({
        files: [{
          attachment: gifBuffer,
          name: 'converted.gif'
        }]
      });

    } catch (error) {
      console.error('Error converting to GIF:', error);
      await sendMessage(message, {
        title: 'Error',
        description: 'Failed to convert image to GIF.',
        color: 0xFF0000
      });
    }
  }
};
