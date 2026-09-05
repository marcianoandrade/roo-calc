import { LOCALES } from '../i18n';
import { useLocale } from '../i18n/LocaleContext';
import { FlagIcon } from './Flags';

/** Three small flag buttons at the top-right corner. */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="ro-lang" role="group" aria-label={t.language}>
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          lang={item.intl}
          title={item.label}
          aria-label={item.label}
          aria-pressed={item.id === locale}
          className={`ro-button ro-flag-button ${item.id === locale ? 'ro-button-active' : ''}`}
          onClick={() => setLocale(item.id)}
        >
          <FlagIcon locale={item.id} />
        </button>
      ))}
    </div>
  );
}
