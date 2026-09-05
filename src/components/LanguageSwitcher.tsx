import { LOCALES } from '../i18n';
import { useLocale } from '../i18n/LocaleContext';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="ro-lang" role="group" aria-label={t.language}>
      <span className="ro-lang-label">{t.language}:</span>
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          lang={item.intl}
          className={`ro-button ro-lang-button ${item.id === locale ? 'ro-button-active' : ''}`}
          aria-pressed={item.id === locale}
          onClick={() => setLocale(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
