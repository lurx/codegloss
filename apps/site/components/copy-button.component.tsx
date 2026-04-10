'use client';

import { useState, useCallback } from 'react';

type CopyButtonProps = {
  text: string;
};

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#5dcaa5' : 'var(--site-muted)', padding: '4px', fontSize: '0.875rem' }}
      aria-label="Copy to clipboard"
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}
