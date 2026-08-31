import React, { useState, useEffect } from 'react';
import {
  Bell,
  Droplet,
  Pill,
  Volume2,
  Clock,
  Play,
  Sparkles
} from 'lucide-react';
import { CognitiveStorage } from '../services/cognitiveStorage.js';
import { reminderScheduler } from '../services/reminderScheduler.js';
import { FullScreenReminderModal } from '../components/cognitive/FullScreenReminderModal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { VOICE_PROMPTS } from '../utils/speechUtils.js';

export const MemoryAssistancePage = () => {
  const { lang, t } = useLanguage();
  const [reminders, setReminders] = useState([]);
  const [activeModalReminder, setActiveModalReminder] = useState(null);

  const loadReminders = async () => {
    const list = await CognitiveStorage.getOrInitReminders();
    setReminders(list);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const triggerTestAlert = (reminder) => {
    reminderScheduler.notify(reminder);
    setActiveModalReminder(reminder);
  };

  const getReminderTitle = (rem) => {
    if (rem.reminderType === 'hydration') {
      if (lang === 'te') return 'మంచినీళ్లు తాగే సమయం';
      if (lang === 'hi') return 'ताज़ा पानी पिएं';
      if (lang === 'ta') return 'தண்ணீர் குடியுங்கள்';
      if (lang === 'kn') return 'ಸ್ವಚ್ಛ ನೀರು ಕುಡಿಯಿರಿ';
      if (lang === 'bn') return 'জল খাওয়ার সময়';
      if (lang === 'as') return 'পানী খোৱাৰ সময়';
      return rem.title;
    }
    if (rem.id?.includes('morning')) {
      if (lang === 'te') return 'ఉదయపు మందులు';
      if (lang === 'hi') return 'सुबह की दवाइयाँ';
      if (lang === 'ta') return 'காலை மருந்துகள்';
      if (lang === 'kn') return 'ಮುಂಜಾನೆಯ ಮಾತ್ರೆಗಳು';
      if (lang === 'bn') return 'সকালের ওষুধ';
      if (lang === 'as') return 'ৰাতিপুৱাৰ ঔষধ';
      return rem.title;
    }
    if (rem.id?.includes('evening')) {
      if (lang === 'te') return 'సాయంత్రపు మందులు';
      if (lang === 'hi') return 'शाम की दवाइयाँ';
      if (lang === 'ta') return 'மாலை மருந்துகள்';
      if (lang === 'kn') return 'ಸಂಜೆಯ ಮಾತ್ರೆಗಳು';
      if (lang === 'bn') return 'সন্ধ্যার ওষুধ';
      if (lang === 'as') return 'গধূলিৰ ঔষধ';
      return rem.title;
    }
    return rem.title;
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Full screen modal test overlay */}
      {activeModalReminder && (
        <FullScreenReminderModal
          reminder={activeModalReminder}
          onClose={() => setActiveModalReminder(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '2px solid #E7E0EC',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: '#EADDFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={24} color="#6750A4" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#1C1B1F' }}>
              {lang === 'te'
                ? 'రోజువారీ జ్ఞాపక మరియు వాయిస్ రిమైండర్లు'
                : lang === 'hi'
                ? 'दैनिक स्मरण एवं ध्वनि अनुस्मारक'
                : lang === 'ta'
                ? 'தினசரி நினைவூட்டல் மற்றும் குரல் எச்சரிக்கைகள்'
                : lang === 'kn'
                ? 'ದೈನಂದಿನ ಸ್ಮರಣೆ ಮತ್ತು ಧ್ವನಿ ಜ್ಞಾಪನೆಗಳು'
                : 'Daily Memory & Audio Reminders'}
            </h1>
            <p style={{ margin: 0, color: '#49454F', fontSize: '0.95rem' }}>
              {lang === 'te'
                ? 'నీరు, మందులు మరియు రోజువారీ పనుల కోసం ఆఫ్‌లైన్ వాయిస్ అలర్ట్‌లు.'
                : lang === 'hi'
                ? 'पानी, दवाओं और दिनचर्या के लिए ऑफ़लाइन ध्वनि अलर्ट।'
                : 'Offline-scheduled voice alerts for hydration, medications, and routine support.'}
            </p>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {reminders.map((rem) => {
          const isHydration = rem.reminderType === 'hydration';
          const title = getReminderTitle(rem);
          const voicePrompt = reminderScheduler.getLocalizedSpeechText(rem, lang);

          return (
            <div
              key={rem.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '2px solid #E7E0EC',
                padding: '20px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px', flex: 1 }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    backgroundColor: isHydration ? '#E0F2FE' : '#EADDFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isHydration ? (
                    <Droplet size={28} color="#0284C7" />
                  ) : (
                    <Pill size={28} color="#6750A4" />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1B1F', margin: '0 0 4px' }}>
                    {title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#49454F', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <Clock size={16} />
                    <span>
                      {rem.scheduleType === 'interval'
                        ? (lang === 'te' ? `ప్రతి ${rem.intervalMinutes} నిమిషాలకు` : lang === 'hi' ? `हर ${rem.intervalMinutes} मिनट में` : `Every ${rem.intervalMinutes} minutes`)
                        : (lang === 'te' ? `రోజూ ${rem.fixedTime} గంటలకు` : lang === 'hi' ? `रोजाना ${rem.fixedTime} बजे` : `Daily at ${rem.fixedTime}`)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#6750A4', fontStyle: 'italic' }}>
                    "{voicePrompt}"
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => triggerTestAlert(rem)}
                  style={{
                    minHeight: '48px',
                    padding: '10px 20px',
                    borderRadius: '16px',
                    border: '2px solid #6750A4',
                    backgroundColor: '#F3EDF7',
                    color: '#21005D',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Play size={18} color="#6750A4" />
                  <span>{lang === 'te' ? 'వాయిస్ అలర్ట్ టెస్ట్' : lang === 'hi' ? 'आवाज़ अलर्ट टेस्ट' : lang === 'ta' ? 'குரல் சோதனை' : lang === 'kn' ? 'ಧ್ವನಿ ಪರೀಕ್ಷೆ' : 'Preview Alert'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine Instructions Notice */}
      <div
        style={{
          backgroundColor: '#F3EDF7',
          borderRadius: '20px',
          border: '1px solid #CAC4D0',
          padding: '20px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles size={20} color="#6750A4" />
          <strong style={{ color: '#21005D', fontSize: '1rem' }}>
            {lang === 'te'
              ? 'ఆఫ్‌లైన్ భారతీయ భాషల వాయిస్ సింథసిస్'
              : lang === 'hi'
              ? 'ऑफ़लाइन भारतीय भाषा ध्वनि प्रणाली'
              : 'Offline Indian Languages Voice Engine'}
          </strong>
        </div>
        <p style={{ margin: 0, color: '#49454F', fontSize: '0.92rem', lineHeight: 1.5 }}>
          {lang === 'te'
            ? 'ఈ యాప్ తెలుగు, హిందీ, తమిళం, కన్నడ మరియు ఇతర భారతీయ భాషలలో స్పష్టంగా మాట్లాడి వృద్ధులకు సహాయపడుతుంది. ఇంటర్నెట్ లేకపోయినా ఇది పూర్తిగా ఆఫ్‌లైన్‌లో పనిచేస్తుంది.'
            : lang === 'hi'
            ? 'यह ऐप हिंदी, तेलुगु, तमिल, कन्नड़ और अन्य भारतीय भाषाओं में स्पष्ट आवाज़ में बोलकर बुजुर्गों की मदद करता है। बिना इंटरनेट के भी यह पूरी तरह काम करता है।'
            : 'Reminders run entirely offline using high-efficiency Web Audio chimes and Web Speech API in Telugu, Hindi, Tamil, Kannada, Bengali, and Indian English at a measured cadence for elderly comprehension.'}
        </p>
      </div>
    </div>
  );
};
