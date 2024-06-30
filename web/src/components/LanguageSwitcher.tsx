import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'ru';

  return (
    <SegmentedControl
      size="xs"
      radius="md"
      value={currentLanguage}
      onChange={(value) => {
        void i18n.changeLanguage(value);
      }}
      data={LANGUAGES}
      aria-label={t('language.label')}
    />
  );
}
