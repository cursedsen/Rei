export const botMasters = [
    '374589381752913930', // 'more botmasters' user IDs'
];

export function isBotMaster(userId) {
    return botMasters.includes(userId);
}