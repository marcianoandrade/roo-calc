import { useEffect, useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { copyText } from '../lib/share';

interface ShareButtonProps {
  /** Text placed on the clipboard. */
  text: string;
}

export function ShareButton({ text }: ShareButtonProps) {
  const { t } = useLocale();
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const share = async () => {
    const ok = await copyText(text);
    setFeedback(ok ? t.share.copied : t.share.failed);
  };

  return (
    <div className="ro-share">
      <div className="ro-share-row">
        <button type="button" className="ro-button ro-button-primary" onClick={share}>
          {t.share.button}
        </button>
        <code className="ro-share-text" aria-label={t.share.textAria}>
          {text}
        </code>
      </div>
      <p className="ro-feedback" aria-live="polite">
        {feedback || t.share.hint}
      </p>
    </div>
  );
}
