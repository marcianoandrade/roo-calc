import { useEffect, useState } from 'react';
import { copyText } from '../lib/share';

interface ShareButtonProps {
  /** Text placed on the clipboard. */
  text: string;
}

export function ShareButton({ text }: ShareButtonProps) {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const share = async () => {
    const ok = await copyText(text);
    setFeedback(ok ? 'Copied! Paste with Ctrl+V.' : 'Could not copy. Select the text below and copy it.');
  };

  return (
    <div className="ro-share">
      <div className="ro-share-row">
        <button type="button" className="ro-button ro-button-primary" onClick={share}>
          Share
        </button>
        <code className="ro-share-text" aria-label="Text that will be copied">
          {text}
        </code>
      </div>
      <p className="ro-feedback" aria-live="polite">
        {feedback || 'Copies the raw values to your clipboard.'}
      </p>
    </div>
  );
}
