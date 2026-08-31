/**
 * High-Efficiency Offline Audio Reminder Scheduler for Hydration & Medication
 * Integrates multilingual Indian speech synthesis (Telugu, Hindi, Tamil, Kannada, Bengali, etc.)
 */

import { CognitiveStorage } from './cognitiveStorage.js';
import { speakText, playGentleTone, VOICE_PROMPTS, stopSpeaking } from '../utils/speechUtils.js';

class ReminderScheduler {
  constructor() {
    this.intervalId = null;
    this.listeners = new Set();
    this.lastCheckedMinute = null;
    this.lastHydrationTrigger = Date.now();
  }

  start() {
    if (this.intervalId) return;

    // Check every 15 seconds for schedule triggers
    this.intervalId = setInterval(() => {
      this.checkSchedules();
    }, 15000);

    // Initial check
    this.checkSchedules();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get active user language code
   */
  getActiveLanguage() {
    try {
      return localStorage.getItem('pharmavision_lang') || 'en';
    } catch (e) {
      return 'en';
    }
  }

  /**
   * Get localized speech prompt for reminder
   */
  getLocalizedSpeechText(reminder, lang = null) {
    const activeLang = lang || this.getActiveLanguage();
    if (reminder.reminderType === 'hydration') {
      return VOICE_PROMPTS.hydration[activeLang] || VOICE_PROMPTS.hydration.en;
    }
    if (reminder.reminderType === 'medication') {
      if (reminder.id?.includes('evening') || reminder.fixedTime >= '18:00') {
        return VOICE_PROMPTS.medicationEvening[activeLang] || VOICE_PROMPTS.medicationEvening.en;
      }
      return VOICE_PROMPTS.medicationMorning[activeLang] || VOICE_PROMPTS.medicationMorning.en;
    }
    return reminder.ttsSpeechText || reminder.description || reminder.title;
  }

  notify(reminder) {
    const lang = this.getActiveLanguage();
    this.playGentleChime();
    const spokenText = this.getLocalizedSpeechText(reminder, lang);
    this.speakText(spokenText, lang);

    for (const l of this.listeners) {
      try {
        l({
          ...reminder,
          localizedVoiceText: spokenText
        });
      } catch (e) {}
    }
  }

  /**
   * Generates a warm dual chime tone via cached AudioContext
   */
  playGentleChime() {
    playGentleTone(659.25, 987.77);
  }

  /**
   * Multilingual TTS speak wrapper
   */
  speakText(text, lang = null, rate = 0.82) {
    const targetLang = lang || this.getActiveLanguage();
    speakText(text, targetLang, null, rate);
  }

  stopSpeaking() {
    stopSpeaking();
  }

  async checkSchedules() {
    try {
      const reminders = await CognitiveStorage.getOrInitReminders();
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      // Prevent re-triggering during the same clock minute
      if (this.lastCheckedMinute === timeStr) return;
      this.lastCheckedMinute = timeStr;

      for (const r of reminders) {
        if (!r.isActive) continue;

        if (r.scheduleType === 'fixed') {
          if (r.fixedTime === timeStr) {
            this.notify(r);
          }
        } else if (r.scheduleType === 'interval') {
          const elapsedMins = (Date.now() - this.lastHydrationTrigger) / (60 * 1000);
          if (elapsedMins >= (r.intervalMinutes || 90)) {
            this.lastHydrationTrigger = Date.now();
            this.notify(r);
          }
        }
      }
    } catch (e) {
      console.error('[ReminderScheduler] Check error:', e);
    }
  }
}

export const reminderScheduler = new ReminderScheduler();
