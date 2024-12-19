export default {
    name: 'update',
    description: 'Pulls the latest changes from the git repository',
    async execute(message) {
        if (!isBotMaster(message.author.id)) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'Only bot owners can pull the latest changes.',
                color: 0xFF0000
            });
        }

        try {
            const { promisify } = require('util');
            const { exec } = require('child_process');
            const execAsync = promisify(exec);
            
            console.log('Attempting git pull...');
            const { stdout, stderr } = await execAsync('git pull', { 
                cwd: process.cwd(),
                timeout: 10000
            });
            
            console.log('Git pull completed. stdout:', stdout, 'stderr:', stderr);
            
            if (stderr && !stderr.includes('Already up to date')) {
                console.warn('Git pull warning:', stderr);
                await message.reply(`Warning: ${stderr}`).catch(err => 
                    console.error('Failed to send warning message:', err)
                );
                return;
            }
            
            await message.reply(`Successfully pulled changes:\n\`\`\`${stdout}\`\`\``).catch(err => 
                console.error('Failed to send success message:', err)
            );
        } catch (error) {
            console.error('Git pull error:', error);
            try {
                await message.reply(`Failed to execute git pull command: ${error.message}`);
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    }
};
