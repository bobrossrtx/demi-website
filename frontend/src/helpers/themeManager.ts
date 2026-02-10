/**
 * Theme Manager
 * Handles theme switching and persistence using localStorage
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'userSettings';

/**
 * Get the current theme from userSettings or default to 'dark'
 */
export const getCurrentTheme = (): Theme => {
  const storedSettings = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedSettings) {
    try {
      const settings = JSON.parse(storedSettings);
      return settings.theme === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  }
  return 'dark';
};

/**
 * Set the theme and persist to localStorage
 */
export const setTheme = (theme: Theme): void => {
  const storedSettings = localStorage.getItem(THEME_STORAGE_KEY);
  let settings: any = {};
  
  if (storedSettings) {
    try {
      settings = JSON.parse(storedSettings);
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  settings.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
  applyTheme(theme);
};

/**
 * Apply theme to the DOM
 */
export const applyTheme = (theme: Theme): void => {
  document.body.setAttribute('data-theme', theme);
};

/**
 * Toggle between themes
 */
export const toggleTheme = (): Theme => {
  const currentTheme = getCurrentTheme();
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

/**
 * Initialize theme on app load
 */
export const initTheme = (): void => {
  const theme = getCurrentTheme();
  applyTheme(theme);
};
