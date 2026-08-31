import React from 'react';
import { Droplet, Pill, Volume2, CheckCircle2, Clock, X } from 'lucide-react';
import { reminderScheduler } from '../../services/reminderScheduler';
import { syncManager } from '../../services/syncManager';
import { useLanguage } from '../../context/LanguageContext';
import { VOICE_PROMPTS } from '../../utils/speechUtils';

export const FullScreenReminderModal = ({ reminder, onClose }) => {
  const { lang, t } = useLanguage();

  if (!reminder) return null;

  const isHydration = reminder.reminderType === 'hydration';

  const handleConfirm = async () => {
    await syncManager.recordAdherence({
      reminderId: reminder.id,
      reminderType: reminder.reminderType,
      scheduledTime: Date.now(),
      actionTaken: 'confirmed',
      actionTimestamp: Date.now()
    });

    const thankMsg = VOICE_PROMPTS.thankYouConfirmation[lang] || VOICE_PROMPTS.thankYouConfirmation.en;
    reminderScheduler.speakText(thankMsg, lang);
    onClose();
  };

  const handleSnooze = async () => {
    await syncManager.recordAdherence({
      reminderId: reminder.id,
      reminderType: reminder.reminderType,
      scheduledTime: Date.now(),
      actionTaken: 'snoozed',
      actionTimestamp: Date.now()
    });

    const snoozeMsg = VOICE_PROMPTS.snoozeConfirmation[lang] || VOICE_PROMPTS.snoozeConfirmation.en;
    reminderScheduler.speakText(snoozeMsg, lang);
    onClose();
  };

  const spokenPrompt = reminder.localizedVoiceText || reminderScheduler.getLocalizedSpeechText(reminder, lang);

  const handleRepeatVoice = () => {
    reminderScheduler.speakText(spokenPrompt, lang);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 12, 29, 0.96)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '32px',
          padding: '36px 28px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          border: '4px solid #6750A4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Close Button for Caregivers */}
        <button
          onClick={onClose}
          aria-label="Dismiss Alert"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            border: '2px solid #CAC4D0',
            backgroundColor: '#F3EDF7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={24} color="#1C1B1F" />
        </button>

        {/* Large Visual Icon Badge */}
        <div
          style={{
            width: '108px',
            height: '108px',
            borderRadius: '54px',
            backgroundColor: isHydration ? '#E0F2FE' : '#EADDFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            border: `4px solid ${isHydration ? '#0284C7' : '#6750A4'}`,
            animation: 'pulse 2s infinite'
          }}
        >
          {isHydration ? (
            <Droplet size={56} color="#0284C7" strokeWidth={2.5} />
          ) : (
            <Pill size={56} color="#6750A4" strokeWidth={2.5} />
          )}
        </div>

        {/* High-Contrast Large Header */}
        <h2
          id="reminder-title"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#1C1B1F',
            lineHeight: 1.2,
            margin: '0 0 12px 0'
          }}
        >
          {isHydration
            ? (lang === 'te' ? 'మంచినీళ్లు తాగే సమయం' : lang === 'hi' ? 'ताज़ा पानी पिएं' : lang === 'ta' ? 'தண்ணீர் குடியுங்கள்' : lang === 'kn' ? 'ನೀರು ಕುಡಿಯುವ ಸಮಯ' : reminder.title)
            : (lang === 'te' ? 'మందుల సమయం' : lang === 'hi' ? 'दवाई का समय' : lang === 'ta' ? 'மருந்து நேரம்' : lang === 'kn' ? 'ಔಷಧಿ ಸಮಯ' : reminder.title)
          }
        </h2>

        {/* Non-dense, comforting instruction spoken in local language */}
        <p
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#49454F',
            lineHeight: 1.5,
            margin: '0 0 24px 0',
            maxWidth: '440px'
          }}
        >
          {spokenPrompt}
        </p>

        {/* Voice Repeat Affordance Button (min 48dp, high contrast) */}
        <button
          onClick={handleRepeatVoice}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            minHeight: '48px',
            borderRadius: '24px',
            border: '2px solid #6750A4',
            backgroundColor: '#F3EDF7',
            color: '#21005D',
            fontSize: '1.05rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '32px'
          }}
        >
          <Volume2 size={24} color="#6750A4" />
          <span>{t('listenAgain')}</span>
        </button>

        {/* Action Buttons (Strictly >= 64px height, high-contrast, forgiving) */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={handleConfirm}
            style={{
              width: '100%',
              minHeight: '68px',
              borderRadius: '20px',
              backgroundColor: '#1E7E34', // AAA high-contrast green
              color: '#FFFFFF',
              border: 'none',
              fontSize: '1.35rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(30, 126, 52, 0.4)'
            }}
          >
            <CheckCircle2 size={32} color="#FFFFFF" strokeWidth={2.5} />
            <span>{isHydration ? t('drinkWater') : t('takeMedicine')}</span>
          </button>

          <button
            onClick={handleSnooze}
            style={{
              width: '100%',
              minHeight: '56px',
              borderRadius: '18px',
              backgroundColor: '#E7E0EC',
              color: '#1C1B1F',
              border: '2px solid #79747E',
              fontSize: '1.1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <Clock size={22} color="#1C1B1F" />
            <span>{t('remind10Min')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
