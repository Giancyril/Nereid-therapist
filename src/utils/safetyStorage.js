const PLAN_KEY = 'nereid_safety_plan';
const EVENTS_KEY = 'nereid_escalation_events';

const DEFAULT_PLAN = {
  warningSigns: [],
  copingSteps: [],
  distractions: [],
  trustedContacts: [],
  safeEnvironmentSteps: [],
  professionalContacts: [],
  checkInSettings: {
    enabled: true,
    quietThresholdMinutes: 5,
    message: "Still there? No pressure to respond."
  }
};

export const getSafetyPlan = () => {
  const saved = localStorage.getItem(PLAN_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Fallback/merge default checkInSettings if missing
      return {
        ...DEFAULT_PLAN,
        ...parsed,
        checkInSettings: {
          ...DEFAULT_PLAN.checkInSettings,
          ...(parsed.checkInSettings || {})
        }
      };
    } catch (e) {
      console.error('Error parsing safety plan:', e);
    }
  }
  return { ...DEFAULT_PLAN };
};

export const saveSafetyPlan = (plan) => {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving safety plan:', e);
  }
};

export const getEscalationEvents = () => {
  const saved = localStorage.getItem(EVENTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing escalation events:', e);
    }
  }
  return [];
};

export const saveEscalationEvents = (events) => {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving escalation events:', e);
  }
};

export const logEscalationEvent = (sessionId, urgencyLevel, messageId) => {
  const events = getEscalationEvents();
  const newEvent = {
    id: Date.now().toString(),
    sessionId,
    triggeredAt: Date.now(),
    urgencyLevel,
    messageId,
    userDismissed: false,
    checkInSent: false
  };
  events.push(newEvent);
  saveEscalationEvents(events);
  return newEvent;
};

export const dismissLastEscalationEvent = (sessionId) => {
  const events = getEscalationEvents();
  const index = events.slice().reverse().findIndex(e => e.sessionId === sessionId);
  if (index !== -1) {
    const realIndex = events.length - 1 - index;
    events[realIndex].userDismissed = true;
    saveEscalationEvents(events);
  }
};
