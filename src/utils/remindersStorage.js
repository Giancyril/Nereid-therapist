// ─── remindersStorage.js ─────────────────────────────────────────────────────
// Stores user-configured reminders in localStorage and schedules browser
// Notification API alerts.
// NOTE: Notifications only fire while the app tab is open (no service worker).

const REMINDERS_KEY = 'nereid_reminders';

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const getReminders = () => {
  const saved = localStorage.getItem(REMINDERS_KEY);
  if (!saved) return [];
  try { return JSON.parse(saved); } catch { return []; }
};

export const saveReminders = (reminders) => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const addReminder = (reminder) => {
  const list = getReminders();
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    type: 'breathing', // 'breathing' | 'journal' | 'custom'
    label: '',
    time: '09:00',
    days: [0, 1, 2, 3, 4], // Mon=0 … Sun=6
    enabled: true,
    ...reminder,
  };
  saveReminders([...list, newItem]);
  return newItem;
};

export const updateReminder = (id, patch) => {
  const list = getReminders().map(r => r.id === id ? { ...r, ...patch } : r);
  saveReminders(list);
  return list;
};

export const deleteReminder = (id) => {
  const list = getReminders().filter(r => r.id !== id);
  saveReminders(list);
  return list;
};

// ── Scheduling ───────────────────────────────────────────────────────────────

/**
 * Returns ms until the next occurrence of `timeStr` on any of the given `days`.
 * days: array of 0–6 where 0=Monday, 6=Sunday.
 */
const msUntilNext = (timeStr, days) => {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  // JS getDay(): 0=Sun,1=Mon…6=Sat → convert to Mon=0…Sun=6
  const todayIdx = (now.getDay() + 6) % 7;

  let minMs = Infinity;
  for (const day of days) {
    let daysAhead = day - todayIdx;
    if (daysAhead < 0) daysAhead += 7;

    const candidate = new Date(now);
    candidate.setDate(now.getDate() + daysAhead);
    candidate.setHours(h, m, 0, 0);

    // If today but already past, push to next week
    if (daysAhead === 0 && candidate <= now) {
      candidate.setDate(candidate.getDate() + 7);
    }

    const ms = candidate - now;
    if (ms > 0 && ms < minMs) minMs = ms;
  }

  return minMs === Infinity ? null : minMs;
};

/** Schedules all enabled reminders using setTimeout chains. */
export const scheduleReminders = () => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const reminders = getReminders().filter(r => r.enabled && r.time && r.days?.length > 0);

  reminders.forEach(reminder => {
    const delay = msUntilNext(reminder.time, reminder.days);
    if (delay === null) return;

    const fire = () => {
      const bodyMap = {
        breathing: '🌬️ Time for your breathing exercise. Take a calm moment.',
        journal: '✍️ Your journal is waiting — how are you feeling today?',
      };
      const body = reminder.label || bodyMap[reminder.type] || '💙 Nereid is here whenever you need it.';

      try {
        new Notification('Nereid 🌊', { body, icon: '/favicon.ico', tag: reminder.id });
      } catch {}

      // Re-schedule for next occurrence
      const next = msUntilNext(reminder.time, reminder.days);
      if (next) setTimeout(fire, next);
    };

    setTimeout(fire, delay);
  });
};

// ── Notification permission ───────────────────────────────────────────────────

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
};

export const getNotificationStatus = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

export const fireTestNotification = () => {
  if (Notification.permission !== 'granted') return false;
  try {
    new Notification('Nereid 🌊', {
      body: "This is how your reminders will look. You're doing great! 💙",
      icon: '/favicon.ico',
      tag: 'nereid-test',
    });
    return true;
  } catch {
    return false;
  }
};
