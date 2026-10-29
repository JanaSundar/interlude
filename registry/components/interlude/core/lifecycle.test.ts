import { describe, expect, it } from 'vite-plus/test';
import {
  effectiveGame,
  gameReducer,
  resolveTask,
  taskMessage,
  viewFor,
  type GameStatus,
} from './lifecycle';

describe('gameReducer', () => {
  it('only discovers from hidden', () => {
    expect(gameReducer('hidden', { type: 'discover' })).toBe('playing');
    expect(gameReducer('over', { type: 'discover' })).toBe('over');
  });

  it('pauses and resumes only from the matching state', () => {
    expect(gameReducer('playing', { type: 'pause' })).toBe('paused');
    expect(gameReducer('paused', { type: 'resume' })).toBe('playing');
    expect(gameReducer('over', { type: 'pause' })).toBe('over');
    expect(gameReducer('hidden', { type: 'resume' })).toBe('hidden');
  });

  it('never resurrects a hidden game through over/restart', () => {
    expect(gameReducer('hidden', { type: 'over' })).toBe('hidden');
    expect(gameReducer('hidden', { type: 'restart' })).toBe('hidden');
    expect(gameReducer('over', { type: 'restart' })).toBe('playing');
  });

  it('dismiss and reset always hide', () => {
    for (const s of ['playing', 'paused', 'over'] as GameStatus[]) {
      expect(gameReducer(s, { type: 'dismiss' })).toBe('hidden');
      expect(gameReducer(s, { type: 'reset' })).toBe('hidden');
    }
  });
});

describe('task authority', () => {
  it('hides the game for every non-loading task', () => {
    for (const task of ['idle', 'success', 'error', 'cancelled'] as const) {
      expect(effectiveGame(task, 'playing')).toBe('hidden');
    }
    expect(effectiveGame('loading', 'paused')).toBe('paused');
  });

  it('maps task and game to a single view', () => {
    expect(viewFor('idle', 'hidden')).toBe('none');
    expect(viewFor('loading', 'hidden')).toBe('loader');
    expect(viewFor('loading', 'over')).toBe('game');
    expect(viewFor('success', 'playing')).toBe('result');
    expect(viewFor('error', 'hidden')).toBe('result');
    expect(viewFor('cancelled', 'paused')).toBe('result');
  });

  it('accepts a boolean or a status, status first', () => {
    expect(resolveTask(undefined, true)).toBe('loading');
    expect(resolveTask(undefined, false)).toBe('idle');
    expect(resolveTask(undefined, undefined)).toBe('idle');
    expect(resolveTask('error', true)).toBe('error');
  });

  it('describes the task without fake progress', () => {
    expect(taskMessage('loading', 'Generating')).toBe('Generating');
    expect(taskMessage('success')).toBe('Done');
    expect(taskMessage('loading')).not.toMatch(/%/);
  });
});
