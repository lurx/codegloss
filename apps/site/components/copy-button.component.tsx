'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CopyButtonProps } from './copy-button.types';

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#5dcaa5' : 'var(--site-muted)', padding: '4px', display: 'flex', alignItems: 'center' }}
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
    </button>
  );
}
