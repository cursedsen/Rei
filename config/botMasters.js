export const botMasters = [
    'youruserid', // change to your own, or add more if you have multiple bot masters
];

export function isBotMaster(userId) {
    return botMasters.includes(userId);
}