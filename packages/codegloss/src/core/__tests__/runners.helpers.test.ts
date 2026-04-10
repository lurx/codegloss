import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { run } from '../runners.helpers';

describe('run', () => {
  const originalLog = console.log;

  beforeEach(() => {
    console.log = originalLog;
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it('returns an error result for an unknown language', () => {
    expect(run('python', 'print(1)')).toEqual({
      lines: [],
      error: 'No runner for "python"',
    });
  });

  describe('js runner', () => {
    it('captures a single console.log call', () => {
      expect(run('js', 'console.log("hi")')).toEqual({ lines: ['hi'] });
    });

    it('joins multiple log arguments with spaces and stringifies them', () => {
      expect(run('js', 'console.log("a", 1, true)')).toEqual({
        lines: ['a 1 true'],
      });
    });

    it('captures multiple log calls in order', () => {
      const code = 'console.log("first"); console.log("second");';
      expect(run('js', code)).toEqual({
        lines: ['first', 'second'],
      });
    });

    it('captures the error message when the code throws', () => {
      const code = 'throw new Error("boom")';
      expect(run('js', code)).toEqual({ lines: ['Error: boom'] });
    });

    it('stringifies non-Error throws', () => {
      const code = 'throw "raw-string"';
      expect(run('js', code)).toEqual({ lines: ['Error: raw-string'] });
    });

    it('restores console.log after a successful run', () => {
      const spy = vi.fn();
      console.log = spy;
      run('js', 'console.log("captured")');
      console.log('after');
      expect(spy).toHaveBeenCalledWith('after');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('restores console.log after a thrown error', () => {
      const spy = vi.fn();
      console.log = spy;
      run('js', 'throw new Error("boom")');
      console.log('after');
      expect(spy).toHaveBeenCalledWith('after');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('returns an empty lines array when the code logs nothing', () => {
      expect(run('js', '1 + 1')).toEqual({ lines: [] });
    });
  });
});
