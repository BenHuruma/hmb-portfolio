export type Language = 'ar' | 'bn' | 'zh-CN' | 'en' | 'fr' | 'hi' | 'pt' | 'ru' | 'es' | 'sw'

export const SUPPORTED_LANGUAGES: Array<{ code: Language; nativeName: string; flag: string }> = [
  { code: 'ar', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'bn', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'zh-CN', nativeName: '中文', flag: '🇨🇳' },
  { code: 'en', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'hi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'sw', nativeName: 'Kiswahili', flag: '🇨🇩' },
]

export function isSupportedLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.some((language) => language.code === value)
}
