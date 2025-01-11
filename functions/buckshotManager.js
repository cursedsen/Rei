import { Collection } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { useItem, addMoney, getActiveBets } from './economyManager.js';
import { updateGameStats, updateBettingStats } from './statsManager.js';

const activeGames = new Collection();

class BuckshotGame {
  constructor(channelId, players) {
    this.id = uuidv4();
    this.channelId = channelId;
    this.guildId = channelId.split('/')[0];
    this.players = players;
    this.currentPlayerIndex = 0;
    this.shells = [];
    this.hp = new Map(players.map(p => [p.id, 3]));
    this.usedItems = new Map();
    this.handcuffed = null;
    this.reflected = false;
    this.extraTurn = false;
    this.blindfolded = null;
    this.vests = new Set();
    this.defibrillators = new Set();

    this.loadShells();
  }

  loadShells() {
    this.shells = ['live', 'live', 'live', 'blank', 'blank', 'blank'];
    for (let i = this.shells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shells[i], this.shells[j]] = [this.shells[j], this.shells[i]];
    }
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getNextPlayer() {
    return this.players[(this.currentPlayerIndex + 1) % this.players.length];
  }

  rotatePlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    while (this.hp.get(this.getCurrentPlayer().id) <= 0) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
  }

  shoot(targetId) {
    if (!this.hp.has(targetId)) {
      throw new Error('Invalid target');
    }

    const isLive = this.shells.shift() === 'live';

    let message = '';
    let remainingHp = this.hp.get(targetId);
    let wasBlocked = false;
    let wasRevived = false;

    if (isLive) {
      if (this.vests.has(targetId)) {
        wasBlocked = true;
        this.vests.delete(targetId);
        message = '💥 **BANG!** But the bulletproof vest absorbed the shot!';
      } else {
        remainingHp = this.hp.get(targetId) - 1;
        this.hp.set(targetId, remainingHp);

        if (remainingHp <= 0) {
          if (this.defibrillators.has(targetId)) {
            wasRevived = true;
            this.hp.set(targetId, 1);
            this.defibrillators.delete(targetId);
            message = '💥 **BANG!** But the defibrillator brought them back with 1 HP!';
          } else {
            message = `💥 **BANG!** <@${targetId}> is dead!`;
          }
        } else {
          message = `💥 **BANG!** <@${targetId}> has ${remainingHp} HP remaining!`;
        }
      }
    } else {
      message = '😮‍💨 *click* - It was a blank!';
    }

    if (!this.handcuffed && !this.extraTurn) {
      this.rotatePlayer();
    }

    this.extraTurn = false;

    if (this.shells.length === 0) {
      this.loadShells();
    }

    return {
      wasLive: isLive,
      wasBlocked,
      wasRevived,
      remainingHp,
      message
    };
  }

  async useItem(userId, guildId, itemId) {
    const result = await useItem(userId, guildId, itemId);
    if (!result.success) return result;

    if (!this.usedItems.has(userId)) {
      this.usedItems.set(userId, new Set());
    }
    this.usedItems.get(userId).add(itemId);

    return { success: true };
  }

  removeLiveShell() {
    const liveIndex = this.shells.findIndex(shell => shell);
    if (liveIndex !== -1) {
      this.shells.splice(liveIndex, 1);
      return true;
    }
    return false;
  }

  peekNextShell() {
    return this.shells[0];
  }

  setHandcuffed(playerId) {
    this.handcuffed = playerId;
  }

  setReflected() {
    this.reflected = true;
  }

  setBlindfold(playerId) {
    this.blindfolded = playerId;
  }

  setExtraTurn() {
    this.extraTurn = true;
  }

  addVest(playerId) {
    this.vests.add(playerId);
  }

  addDefibrillator(playerId) {
    this.defibrillators.add(playerId);
  }

  heal(playerId) {
    const currentHp = this.hp.get(playerId);
    if (currentHp < 3) {
      this.hp.set(playerId, currentHp + 1);
    }
    return this.hp.get(playerId);
  }

  isGameOver() {
    return Array.from(this.hp.values()).filter(hp => hp > 0).length <= 1;
  }

  getWinner() {
    if (!this.isGameOver()) return null;
    return Array.from(this.hp.entries())
      .find(([_, hp]) => hp > 0)?.[0];
  }

  async endGame() {
    const winner = this.getWinner();
    if (winner) {
      for (const player of this.players) {
        await updateGameStats(player.id, 'buckshot', player.id === winner);
      }

      const bets = await getActiveBets(this.id);
      for (const bet of bets) {
        const won = bet.bet_on_user === winner;
        await updateBettingStats(bet.user_id, 'buckshot', bet.bet_amount, won);
        if (won) {
          await addMoney(bet.user_id, bet.guild_id, bet.bet_amount * 2);
        }
      }

      await db.run('DELETE FROM active_bets WHERE game_id = ?', this.id);
    }
    return winner;
  }

  getGameState() {
    return {
      players: this.players.map(p => ({
        id: p.id,
        username: p.username,
        hp: this.hp.get(p.id)
      })),
      currentPlayer: this.getCurrentPlayer(),
      shellsRemaining: this.shells.length,
      handcuffed: this.handcuffed,
      reflected: this.reflected,
      extraTurn: this.extraTurn,
      blindfolded: this.blindfolded,
      vests: Array.from(this.vests),
      defibrillators: Array.from(this.defibrillators)
    };
  }

  formatGameState() {
    const state = this.getGameState();
    const lines = [
      '**Players:**',
      ...state.players.map(p => {
        const status = [];
        if (p.id === state.currentPlayer.id) status.push('👉');
        if (state.vests.includes(p.id)) status.push('🦺');
        if (state.defibrillators.includes(p.id)) status.push('⚡');
        if (state.blindfolded === p.id) status.push('🕶️');

        return `${status.join('')} ${p.username}: ${'❤️'.repeat(p.hp)}`;
      }),
      '',
      `**Shells in Chamber:** ${state.shellsRemaining}`,
      state.handcuffed ? `⛓️ <@${state.handcuffed}> is handcuffed!` : '',
      state.reflected ? '🪞 Next shot will be reflected!' : '',
      state.extraTurn ? '💉 Current player gets another turn!' : ''
    ];

    return lines.filter(Boolean).join('\n');
  }
}

function createGame(channelId, players) {
  const game = new BuckshotGame(channelId, players);
  activeGames.set(channelId, game);
  return game;
}

function getGame(channelId) {
  return activeGames.get(channelId);
}

function endGame(channelId) {
  const game = activeGames.get(channelId);
  if (game) {
    game.endGame();
  }
  return activeGames.delete(channelId);
}

export {
  createGame,
  getGame,
  endGame
}; 