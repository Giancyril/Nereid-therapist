const JOURNAL_KEY = 'nereid_journal';

export const getJournalEntries = () => {
  const saved = localStorage.getItem(JOURNAL_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing journal entries:', e);
    }
  }
  return [];
};

export const saveJournalEntries = (entries) => {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving journal entries:', e);
  }
};

export const saveJournalEntry = (entry) => {
  const entries = getJournalEntries();
  const index = entries.findIndex(e => e.id === entry.id);
  
  const updatedEntry = {
    ...entry,
    wordCount: entry.text ? entry.text.trim().split(/\s+/).filter(Boolean).length : 0,
    updatedAt: new Date().toISOString()
  };

  if (index !== -1) {
    entries[index] = updatedEntry;
  } else {
    entries.push(updatedEntry);
  }
  
  saveJournalEntries(entries);
  return updatedEntry;
};

export const deleteJournalEntry = (id) => {
  const entries = getJournalEntries();
  const filtered = entries.filter(e => e.id !== id);
  saveJournalEntries(filtered);
  return filtered;
};
