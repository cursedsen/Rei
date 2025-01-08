import { sendMessage } from '../../functions/reiMessageMaker.js';
import sharp from 'sharp';

export default {
    name: 'caption',
    description: 'Add a caption to an image',
    category: 'media',
    usage: '<text> [attach image or use on last image]',

    async execute(message, args) {
        if (!args.length) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide text for the caption!',
                color: 0xFF0000
            });
        }

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
            
            const captionText = args.join(' ').toUpperCase();
            const imageMetadata = await sharp(imageBuffer).metadata();
            
            if (!imageMetadata.width || !imageMetadata.height) {
                throw new Error('Invalid image dimensions');
            }

            const maxWidth = Math.max(imageMetadata.width, 500);
            const fontSize = Math.floor(maxWidth * 0.15);
            const lineHeight = fontSize * 1;
            const padding = fontSize * 1;

            function wrapText(text, maxCharsPerLine) {
                const words = text.split(' ');
                const lines = [];
                let currentLine = '';
                
                words.forEach(word => {
                    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
                        currentLine += (currentLine ? ' ' : '') + word;
                    } else {
                        if (currentLine) lines.push(currentLine);
                        currentLine = word;
                    }
                });
                if (currentLine) lines.push(currentLine);
                
                return lines;
            }
            
            const charsPerLine = Math.floor(maxWidth / (fontSize * 0.5));
            const textLines = wrapText(captionText, charsPerLine);
            
            const totalTextHeight = textLines.length * lineHeight;
            const captionHeight = totalTextHeight + (padding * 1.5);

            const svgString = `<svg width="${maxWidth}" height="${captionHeight}" xmlns="http://www.w3.org/2000/svg">
                    <rect width="${maxWidth}" height="${captionHeight}" fill="white"/>
                    ${textLines.map((line, i) => `
                        <text
                            x="${maxWidth/2}"
                            y="${padding + (i * lineHeight) + (fontSize * 0.7)}"
                            text-anchor="middle"
                            font-family="Impact"
                            font-size="${fontSize}"
                            fill="black"
                            stroke="black"
                            stroke-width="2"
                        >${line}</text>
                    `).join('')}
                </svg>
            `;

            const svgBuffer = Buffer.from(svgString);

            const textBuffer = await sharp(svgBuffer)
                .png()
                .toBuffer();

            const scaledImage = await sharp(imageBuffer)
                .resize(maxWidth, null, { 
                    fit: 'contain',
                    withoutEnlargement: false
                })
                .toBuffer();
            
            const scaledMetadata = await sharp(scaledImage).metadata();

            console.log('Scaled image dimensions:', {
                width: maxWidth,
                height: scaledMetadata.height,
                captionHeight
            });

            if (!maxWidth || !scaledMetadata.height || !captionHeight) {
                throw new Error(`Invalid dimensions: width=${maxWidth}, height=${scaledMetadata.height}, captionHeight=${captionHeight}`);
            }

            const finalWidth = Math.round(maxWidth);
            const finalHeight = Math.round(scaledMetadata.height + captionHeight);

            const finalImage = await sharp({
                create: {
                    width: finalWidth,
                    height: finalHeight,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                }
            })
            .composite([
                { input: textBuffer, top: 0, left: 0 },
                { input: scaledImage, top: Math.round(captionHeight), left: 0 }
            ])
            .png()
            .toBuffer();

            await message.channel.send({
                files: [{
                    attachment: finalImage,
                    name: 'captioned.png'
                }]
            });

        } catch (error) {
            console.error('Error creating caption:', error);
            await sendMessage(message, {
                title: 'Error',
                description: 'Failed to create captioned image.',
                color: 0xFF0000
            });
        }
    }
}

