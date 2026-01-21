/**
 * Theme Manager
 * Handles theme switching and persistence using localStorage
 */

export type Theme = 'original' | 'rust';

const THEME_STORAGE_KEY = 'theme';

/**
 * Get the current theme from localStorage or default to 'rust'
 */
export const getCurrentTheme = (): Theme => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return (storedTheme === 'rust' || storedTheme === 'original') ? storedTheme : 'rust';
};

/**
 * Set the theme and persist to localStorage
 */
export const setTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
};

/**
 * Apply theme to the DOM
 */
export const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Optional: Add theme class to body as well for additional styling hooks
  document.body.classList.remove('theme-original', 'theme-rust');
  document.body.classList.add(`theme-${theme}`);
};

/**
 * Toggle between themes
 */
export const toggleTheme = (): Theme => {
  const currentTheme = getCurrentTheme();
  const newTheme: Theme = currentTheme === 'original' ? 'rust' : 'original';
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
