// ─── themeStorage.js ─────────────────────────────────────────────────────────
// Manages the 4 built-in Nereid themes via a data-theme attribute on <html>.
// All other component CSS stays unchanged — themes only override CSS variables.

const THEME_KEY = 'nereid_theme';

export const THEMES = [
  {
    id: 'dark-tide',
    name: 'Dark Tide',
    emoji: '🌊',
    desc: 'Default — sea-mist surfaces, deep teal ink',
    preview: { bg: '#F1F5F3', accent: '#3F7268', surface: '#FFFFFF' },
  },
  {
    id: 'light-calm',
    name: 'Light Warm',
    emoji: '☀️',
    desc: 'Warm sand and earthy amber — cosy and grounding',
    preview: { bg: '#FBF8F4', accent: '#8B7355', surface: '#FFFFFF' },
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    emoji: '🔵',
    desc: 'Full dark mode — deep navy with bright cyan',
    preview: { bg: '#0D1B2A', accent: '#4FC3E8', surface: '#152234' },
  },
  {
    id: 'lavender-dusk',
    name: 'Lavender Dusk',
    emoji: '🌸',
    desc: 'Deep purple-grey with warm lilac accents',
    preview: { bg: '#1A1625', accent: '#9B7FD4', surface: '#231E32' },
  },
];

/** Returns the stored theme id, defaulting to 'dark-tide'. */
export const getTheme = () =>
  localStorage.getItem(THEME_KEY) || 'dark-tide';

/** Stores and immediately applies a theme. */
export const setTheme = (id) => {
  localStorage.setItem(THEME_KEY, id);
  applyTheme(id);
};

/** Applies a theme by setting data-theme on <html>. Call on app mount. */
export const applyTheme = (id) => {
  document.documentElement.setAttribute('data-theme', id || 'dark-tide');
};
