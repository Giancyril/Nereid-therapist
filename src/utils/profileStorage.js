const PROFILE_KEY = 'nereid_user_profile';

const DEFAULT_PROFILE = {
  updatedAt: null,
  recurringStressors: [],
  copingStrategiesThatWorked: [],
  copingStrategiesThatDidntWork: [],
  notableContext: [],
  preferredStyle: 'reflective',
};

// Return the stored profile, or a fresh empty one
export const getUserProfile = () => {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error parsing user profile:', e);
    }
  }
  return { ...DEFAULT_PROFILE };
};

export const saveUserProfile = (profile) => {
  try {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
};

export const clearUserProfile = () => {
  localStorage.removeItem(PROFILE_KEY);
};

// Build a compact context block to inject into LLM system prompt
export const buildProfileContext = (profile) => {
  if (!profile) return '';
  const lines = [];

  const top = (items, n = 5) =>
    [...items]
      .sort((a, b) => (b.mentionCount || 1) - (a.mentionCount || 1))
      .slice(0, n)
      .map(i => i.text);

  const stressors = top(profile.recurringStressors || []);
  const copingWorked = top(profile.copingStrategiesThatWorked || []);
  const copingFailed = top(profile.copingStrategiesThatDidntWork || []);
  const context = top(profile.notableContext || []);

  if (stressors.length) lines.push(`- Recurring stressors: ${stressors.join(', ')}`);
  if (copingWorked.length) lines.push(`- Coping strategies that have helped: ${copingWorked.join(', ')}`);
  if (copingFailed.length) lines.push(`- Coping strategies that haven't helped: ${copingFailed.join(', ')}`);
  if (context.length) lines.push(`- Ongoing context: ${context.join(', ')}`);

  if (!lines.length) return '';
  return `\n[Known context from past sessions]\n${lines.join('\n')}\n`;
};

// Merge a ProfileDiff from the backend into the stored profile
export const mergeProfileDiff = (diff) => {
  const profile = getUserProfile();

  const makeid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
  const now = new Date().toISOString();

  const addOrReinforce = (list, texts, sessionId) => {
    const updated = [...list];
    texts.forEach(text => {
      const text_lower = text.toLowerCase().trim();
      // Simple fuzzy match: check if any existing item's text contains this phrase or vice versa
      const existing = updated.find(i =>
        i.text.toLowerCase().includes(text_lower) || text_lower.includes(i.text.toLowerCase())
      );
      if (existing) {
        existing.mentionCount = (existing.mentionCount || 1) + 1;
        existing.lastReinforcedAt = now;
        if (sessionId && !existing.sourceSessionIds?.includes(sessionId)) {
          existing.sourceSessionIds = [...(existing.sourceSessionIds || []), sessionId];
        }
      } else {
        updated.push({
          id: makeid(),
          text: text.trim(),
          firstNotedAt: now,
          lastReinforcedAt: now,
          mentionCount: 1,
          sourceSessionIds: sessionId ? [sessionId] : [],
        });
      }
    });
    return updated;
  };

  const sessionId = diff.sessionId || null;

  const updated = {
    ...profile,
    recurringStressors: addOrReinforce(profile.recurringStressors || [], diff.new_stressors || [], sessionId),
    copingStrategiesThatWorked: addOrReinforce(profile.copingStrategiesThatWorked || [], diff.new_coping_worked || [], sessionId),
    copingStrategiesThatDidntWork: addOrReinforce(profile.copingStrategiesThatDidntWork || [], diff.new_coping_didnt_work || [], sessionId),
    notableContext: addOrReinforce(profile.notableContext || [], diff.new_context || [], sessionId),
  };

  // Reinforce items referenced by id
  if (diff.reinforced_existing_ids?.length) {
    const reinforce = (list) =>
      list.map(i =>
        diff.reinforced_existing_ids.includes(i.id)
          ? { ...i, mentionCount: (i.mentionCount || 1) + 1, lastReinforcedAt: now }
          : i
      );
    updated.recurringStressors = reinforce(updated.recurringStressors);
    updated.copingStrategiesThatWorked = reinforce(updated.copingStrategiesThatWorked);
    updated.copingStrategiesThatDidntWork = reinforce(updated.copingStrategiesThatDidntWork);
    updated.notableContext = reinforce(updated.notableContext);
  }

  return saveUserProfile(updated);
};

export const deleteProfileItem = (category, id) => {
  const profile = getUserProfile();
  const updated = { ...profile, [category]: (profile[category] || []).filter(i => i.id !== id) };
  return saveUserProfile(updated);
};
