import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  RefreshCw,
  Sparkles,
  Award,
  ChevronRight,
  HelpCircle,
  Settings2,
  Check,
  Heart,
  Timer,
  Zap,
  Target,
  Flame
} from 'lucide-react';
import { DDAEngine, DIFFICULTY_TIERS } from '../../services/ddaEngine.js';
import { syncManager } from '../../services/syncManager.js';
import { reminderScheduler } from '../../services/reminderScheduler.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { playGentleTone, VOICE_PROMPTS } from '../../utils/speechUtils.js';

// Expanded Culturally Contextual Reminiscence Catalog (16 Indian heritage items)
const REMINISCENCE_CATALOG = [
  {
    id: 'chai_cup',
    icon: '☕',
    color: '#B45309',
    bg: '#FEF3C7',
    labels: {
      en: 'Morning Tea Cup',
      te: 'ఉదయపు టీ కప్పు',
      hi: 'सुबह की चाय',
      ta: 'காலை தேநீர்',
      kn: 'ಬೆಳಗಿನ ಚಹಾ',
      bn: 'সকালের চা',
      as: 'ৰাতিপুৱাৰ চাহ',
      mr: 'सकाळचा चहा'
    }
  },
  {
    id: 'vintage_radio',
    icon: '📻',
    color: '#92400E',
    bg: '#FDE68A',
    labels: {
      en: 'Classic Radio',
      te: 'పాత రేడియో',
      hi: 'रेडियो संगीत',
      ta: 'பழைய வானொலி',
      kn: 'ಹಳೆಯ ರೇಡಿಯೋ',
      bn: 'পুরোনো রেডিও',
      as: 'পুৰণি ৰেডিঅ’',
      mr: 'रेडिओ'
    }
  },
  {
    id: 'reading_glasses',
    icon: '👓',
    color: '#1D4ED8',
    bg: '#DBEAFE',
    labels: {
      en: 'Reading Glasses',
      te: 'కళ్ళద్దాలు',
      hi: 'पढ़ने का चश्मा',
      ta: 'வாசிப்பு கண்ணாடி',
      kn: 'ಓದುವ ಕನ್ನಡಕ',
      bn: 'পড়ার চশমা',
      as: 'পঢ়া চশমা',
      mr: 'वाचनाचा चष्मा'
    }
  },
  {
    id: 'family_photo',
    icon: '🖼️',
    color: '#BE185D',
    bg: '#FCE7F3',
    labels: {
      en: 'Family Photo',
      te: 'కుటుంబ ఫోటో',
      hi: 'पारिवारिक फोटो',
      ta: 'குடும்ப புகைப்படம்',
      kn: 'ಕುಟುಂಬದ ಫೋಟೋ',
      bn: 'পারিবারিক ছবি',
      as: 'পৰিয়ালৰ ফটো',
      mr: 'कुटुंबाचा फोटो'
    }
  },
  {
    id: 'brass_bell',
    icon: '🔔',
    color: '#B45309',
    bg: '#FEF9C3',
    labels: {
      en: 'Morning Bell',
      te: 'పూజా గంట',
      hi: 'पूजा की घंटी',
      ta: 'பூஜை மணி',
      kn: 'ಪೂಜಾ ಗಂಟೆ',
      bn: 'পূজার ঘণ্টা',
      as: 'পূজাৰ ঘণ্টা',
      mr: 'पूजा घंटी'
    }
  },
  {
    id: 'oil_lamp',
    icon: '🪔',
    color: '#C2410C',
    bg: '#FFEDD5',
    labels: {
      en: 'Warm Oil Lamp',
      te: 'మట్టి ప్రమిద',
      hi: 'मिट्टी का दीया',
      ta: 'அகல் விளக்கு',
      kn: 'ಮಣ್ಣಿನ ದೀಪ',
      bn: 'মাটির প্রদীপ',
      as: 'মাটিৰ চাকি',
      mr: 'दिवा'
    }
  },
  {
    id: 'garden_flower',
    icon: '🌸',
    color: '#DB2777',
    bg: '#FDF2F8',
    labels: {
      en: 'Garden Jasmine',
      te: 'తోట మల్లెపూలు',
      hi: 'चमेली का फूल',
      ta: 'மல்லிகைப் பூ',
      kn: 'ತೋಟದ ಮಲ್ಲಿಗೆ',
      bn: 'বাগানের ফুল',
      as: 'ফুলনিৰ ফুল',
      mr: 'जाईचे फूल'
    }
  },
  {
    id: 'pocket_watch',
    icon: '⏱️',
    color: '#047857',
    bg: '#D1FAE5',
    labels: {
      en: 'Pocket Watch',
      te: 'జేబు గడియారం',
      hi: 'जेब घड़ी',
      ta: 'கைக்கடிகாரம்',
      kn: 'ಕೈಗಡಿಯಾರ',
      bn: 'পকেট ঘড়ি',
      as: 'পকেট ঘড়ী',
      mr: 'खिशातील घड्याळ'
    }
  },
  {
    id: 'peacock_feather',
    icon: '🪶',
    color: '#0D9488',
    bg: '#CCFBF1',
    labels: {
      en: 'Peacock Feather',
      te: 'నెమలి ఈక',
      hi: 'मोर पंख',
      ta: 'மயில் இறகு',
      kn: 'ನವಿಲು ಗರಿ',
      bn: 'ময়ূরের পালক',
      as: 'ময়ূৰৰ পাখি',
      mr: 'मोराचे पीस'
    }
  },
  {
    id: 'clay_pot',
    icon: '🏺',
    color: '#9A3412',
    bg: '#FFEDD5',
    labels: {
      en: 'Cool Clay Pot',
      te: 'మట్టి కుండ',
      hi: 'मिट्टी का मटका',
      ta: 'மண் பானை',
      kn: 'ಮಣ್ಣಿನ ಮಡಕೆ',
      bn: 'মাটির কলসি',
      as: 'মাটিৰ কলহ',
      mr: 'मातीचे मडके'
    }
  },
  {
    id: 'tulsi_plant',
    icon: '🌿',
    color: '#15803D',
    bg: '#DCFCE7',
    labels: {
      en: 'Holy Tulsi',
      te: 'తులసి మొక్క',
      hi: 'तुलसी पौधा',
      ta: 'துளசி செடி',
      kn: 'ತುಳಸಿ ಗಿಡ',
      bn: 'তুলসী গাছ',
      as: 'তুলসী গছ',
      mr: 'तुळशीचे रोप'
    }
  },
  {
    id: 'sitar',
    icon: '🪕',
    color: '#B45309',
    bg: '#FEF3C7',
    labels: {
      en: 'Classical Sitar',
      te: 'సితార్ వాద్యం',
      hi: 'शास्त्रीय सितार',
      ta: 'சித்தார்',
      kn: 'ಸಿತಾರ್',
      bn: 'সেতার',
      as: 'চেতাৰ',
      mr: 'सतार'
    }
  },
  {
    id: 'mango',
    icon: '🥭',
    color: '#D97706',
    bg: '#FEF3C7',
    labels: {
      en: 'Sweet Mango',
      te: 'తీపి మామిడి',
      hi: 'मीठा आम',
      ta: 'மாம்பழம்',
      kn: 'ಮಾವಿನ ಹಣ್ಣು',
      bn: 'পাকা আম',
      as: 'মিঠা আম',
      mr: 'गोड आंबा'
    }
  },
  {
    id: 'elephant',
    icon: '🐘',
    color: '#4B5563',
    bg: '#F3F4F6',
    labels: {
      en: 'Temple Elephant',
      te: 'గుడి ఏనుగు',
      hi: 'मंदिर का हाथी',
      ta: 'கோவில் யானை',
      kn: 'ಆನೆ',
      bn: 'মন্দিরের হাতি',
      as: 'হাতী',
      mr: 'हत्ती'
    }
  },
  {
    id: 'kite',
    icon: '🪁',
    color: '#7C3AED',
    bg: '#EDE9FE',
    labels: {
      en: 'Festival Kite',
      te: 'రంగుల గాలిపటం',
      hi: 'रंगीन पतंग',
      ta: 'பட்டம்',
      kn: 'ಗಾಳಿಪಟ',
      bn: 'রঙিন ঘুড়ি',
      as: 'ৰঙীন ঘুৰি',
      mr: 'रंगीबेरंगी पतंग'
    }
  },
  {
    id: 'umbrella',
    icon: '☂️',
    color: '#2563EB',
    bg: '#EFF6FF',
    labels: {
      en: 'Monsoon Umbrella',
      te: 'వర్షపు గొడుగు',
      hi: 'बारिश की छतरी',
      ta: 'மழை குடை',
      kn: 'ಮಳೆಯ ಕೊಡೆ',
      bn: 'বৃষ্টির ছাতা',
      as: 'বৰষুণৰ ছাতি',
      mr: 'पावसाची छत्री'
    }
  },
  {
    id: 'bansuri',
    icon: '🪈',
    color: '#D97706',
    bg: '#FEF3C7',
    labels: {
      en: 'Melodic Flute',
      te: 'వేణువు / మురళి',
      hi: 'मधुर बांसुरी',
      ta: 'புல்லாங்குழல்',
      kn: 'ಮಧುರ ಕೊಳಲು',
      bn: 'সুরভরা বাঁশি',
      as: 'মধুৰ বাঁহী',
      mr: 'मधुर बासरी'
    }
  },
  {
    id: 'coconut',
    icon: '🥥',
    color: '#78350F',
    bg: '#FEF9C3',
    labels: {
      en: 'Fresh Coconut',
      te: 'పచ్చి కొబ్బరికాయ',
      hi: 'ताज़ा नारियल',
      ta: 'இளநீர் தேங்காய்',
      kn: 'ತಾಜಾ ತೆಂಗಿನಕಾಯಿ',
      bn: 'তাজা নারকেল',
      as: 'নাৰিকল',
      mr: 'ताजा नारळ'
    }
  }
];

export const ReminiscenceMemoryMatch = () => {
  const { lang } = useLanguage();
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [peekCountdown, setPeekCountdown] = useState(0);

  // Live game metrics
  const [movesCount, setMovesCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [lastDDAEvaluation, setLastDDAEvaluation] = useState(null);
  const [caregiverDrawerOpen, setCaregiverDrawerOpen] = useState(false);

  // Telemetry references
  const telemetryRef = useRef({
    startTime: 0,
    firstTapTime: 0,
    lastTapTime: 0,
    interTapLatencies: [],
    wrongAttempts: 0,
    totalAttempts: 0,
    retryCount: 0
  });

  const idleTimerRef = useRef(null);
  const gameTimerRef = useRef(null);

  const currentTier = useMemo(() => DIFFICULTY_TIERS[level] || DIFFICULTY_TIERS[1], [level]);

  // Sound effects
  const playFlipTone = () => playGentleTone(523.25, 523.25);
  const playMatchTone = (combo = 1) => {
    const baseFreq = 523.25 + (combo * 60);
    playGentleTone(baseFreq, baseFreq * 1.5);
  };
  const playLevelUpTone = () => playGentleTone(659.25, 1046.5);

  // Spoken voice instructions
  const speakInstructions = () => {
    const speech = VOICE_PROMPTS.gameIntro[lang] || VOICE_PROMPTS.gameIntro.en;
    reminderScheduler.speakText(speech, lang, currentTier.audioSpeed);
  };

  // Reset idle guidance timer
  const resetIdleTimer = () => {
    setShowHint(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setShowHint(true);
    }, currentTier.hintLatencyMs);
  };

  // Game timer tracking
  useEffect(() => {
    if (!isCompleted && !isPeeking) {
      gameTimerRef.current = setInterval(() => {
        setSecondsElapsed(s => s + 1);
      }, 1000);
    } else {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    }
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [isCompleted, isPeeking]);

  // Initialize game board
  const initializeGame = (targetLevel = level) => {
    const tier = DIFFICULTY_TIERS[targetLevel] || DIFFICULTY_TIERS[1];
    const selectedCatalog = REMINISCENCE_CATALOG.slice(0, tier.pairsCount);

    // Create duplicate pairs
    const deck = [];
    selectedCatalog.forEach((item, index) => {
      const cardLabel = item.labels[lang] || item.labels.en;
      deck.push({ ...item, label: cardLabel, cardInstanceId: `${item.id}_a_${index}` });
      deck.push({ ...item, label: cardLabel, cardInstanceId: `${item.id}_b_${index}` });
    });

    // Shuffle deck
    const shuffled = deck.sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedIds(new Set());
    setIsCompleted(false);
    setShowHint(false);
    setMovesCount(0);
    setStreak(0);
    setSecondsElapsed(0);

    // Reset telemetry
    telemetryRef.current = {
      startTime: Date.now(),
      firstTapTime: 0,
      lastTapTime: 0,
      interTapLatencies: [],
      wrongAttempts: 0,
      totalAttempts: 0,
      retryCount: 0
    };

    // Initial Flash Peek for tougher levels (Level >= 4)
    if (tier.peekDurationMs > 0) {
      setIsPeeking(true);
      const totalSecs = Math.ceil(tier.peekDurationMs / 1000);
      setPeekCountdown(totalSecs);

      const countdownInterval = setInterval(() => {
        setPeekCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsPeeking(false);
            resetIdleTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsPeeking(false);
      resetIdleTimer();
    }
  };

  useEffect(() => {
    initializeGame(level);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [level, lang]);

  // Card click handler
  const handleCardClick = (index) => {
    if (isCompleted || isPeeking) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIds.has(cards[index].id)) return;
    if (flippedIndices.length >= 2) return;

    const now = Date.now();
    const tel = telemetryRef.current;

    if (tel.firstTapTime === 0) tel.firstTapTime = now;
    if (tel.lastTapTime > 0) tel.interTapLatencies.push(now - tel.lastTapTime);
    tel.lastTapTime = now;
    resetIdleTimer();
    playFlipTone();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Two cards flipped: check match
    if (newFlipped.length === 2) {
      setMovesCount(m => m + 1);
      tel.totalAttempts++;
      const [idx1, idx2] = newFlipped;
      const card1 = cards[idx1];
      const card2 = cards[idx2];

      if (card1.id === card2.id) {
        // MATCH FOUND!
        const newStreak = streak + 1;
        setStreak(newStreak);
        playMatchTone(newStreak);

        // Calculate score with combo multiplier
        const pointsAdded = Math.round(150 * currentTier.scoreMultiplier * (1 + newStreak * 0.2));
        setScore(s => s + pointsAdded);

        const nextMatched = new Set(matchedIds);
        nextMatched.add(card1.id);
        setMatchedIds(nextMatched);
        setFlippedIndices([]);

        // Localized verbal praise
        const matchVoice = VOICE_PROMPTS.gameMatchSuccess[lang] || VOICE_PROMPTS.gameMatchSuccess.en;
        reminderScheduler.speakText(matchVoice, lang, currentTier.audioSpeed);

        // Check if all pairs are solved
        if (nextMatched.size === currentTier.pairsCount) {
          handlePuzzleCompletion(nextMatched);
        }
      } else {
        // Mismatch: reset streak and flip back with level-dependent delay
        setStreak(0);
        tel.wrongAttempts++;
        setTimeout(() => {
          setFlippedIndices([]);
        }, currentTier.flipBackDelayMs);
      }
    }
  };

  // Completion & DDA evaluation
  const handlePuzzleCompletion = async (finalMatched) => {
    setIsCompleted(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    playLevelUpTone();

    const tel = telemetryRef.current;
    const now = Date.now();
    const completionTimeMs = now - tel.startTime;
    const reactionTimeMs = tel.firstTapTime > 0 ? tel.firstTapTime - tel.startTime : 1500;

    const hesitationScore = tel.interTapLatencies.length > 0
      ? tel.interTapLatencies.reduce((a, b) => a + b, 0) / tel.interTapLatencies.length
      : 1800;

    const errorRate = tel.totalAttempts > 0
      ? tel.wrongAttempts / tel.totalAttempts
      : 0;

    const sessionMetrics = {
      reactionTimeMs: Math.round(reactionTimeMs),
      hesitationScore: Math.round(hesitationScore),
      errorRate: Math.round(errorRate * 100) / 100,
      retryCount: tel.retryCount
    };

    const ddaResult = DDAEngine.evaluateNextDifficulty(level, sessionMetrics);
    setLastDDAEvaluation(ddaResult);

    const sessionId = `ses_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionRecord = {
      sessionId,
      userId: 'patient_default',
      gameType: 'reminiscence_match',
      difficultyLevel: level,
      gridSize: `${currentTier.gridRows}x${currentTier.gridCols}`,
      distractorCount: currentTier.distractorCount,
      completionTimeMs,
      reactionTimeMs: sessionMetrics.reactionTimeMs,
      hesitationScore: sessionMetrics.hesitationScore,
      errorRate: sessionMetrics.errorRate,
      retryCount: sessionMetrics.retryCount,
      cognitiveLoadIndex: ddaResult.cli,
      clientTimestamp: now
    };

    await syncManager.recordSession(sessionRecord);

    const allFinishedMsg = VOICE_PROMPTS.gameAllCompleted[lang] || VOICE_PROMPTS.gameAllCompleted.en;
    reminderScheduler.speakText(allFinishedMsg, lang, currentTier.audioSpeed);
  };

  // Compute hint for gentle assistance
  const hintPairIndices = useMemo(() => {
    if (!showHint || isCompleted || isPeeking) return [];
    const unmatched = cards
      .map((c, i) => ({ ...c, originalIndex: i }))
      .filter(c => !matchedIds.has(c.id));

    if (unmatched.length === 0) return [];
    const firstUnmatchedId = unmatched[0].id;
    return cards
      .map((c, i) => (c.id === firstUnmatchedId ? i : -1))
      .filter(i => i !== -1);
  }, [showHint, cards, matchedIds, isCompleted, isPeeking]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="reminiscence-game-container"
      style={{
        maxWidth: level >= 6 ? '1040px' : '840px',
        margin: '0 auto',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        transition: 'max-width 0.3s ease'
      }}
    >
      {/* Game Header Bar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#1C1B1F',
              margin: '0 0 4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{lang === 'te' ? 'జ్ఞాపకశక్తి మ్యాచింగ్ ఆట' : lang === 'hi' ? 'स्मरण शक्ति मिलान खेल' : lang === 'ta' ? 'நினைவாற்றல் விளையாட்டு' : 'Memory Match Therapy'}</span>
            <span
              style={{
                fontSize: '0.85rem',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: level >= 5 ? '#B3261E' : level >= 3 ? '#B45309' : '#1E7E34',
                color: '#FFFFFF',
                fontWeight: 800
              }}
            >
              {currentTier.badge}
            </span>
          </h1>
          <p style={{ margin: 0, color: '#49454F', fontSize: '0.92rem', fontWeight: 600 }}>
            {currentTier.description}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={speakInstructions}
            aria-label="Listen to Audio Instructions"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: '2px solid #6750A4',
              backgroundColor: '#F3EDF7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Volume2 size={24} color="#6750A4" />
          </button>

          <button
            onClick={() => initializeGame(level)}
            aria-label="Reset Game"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: '2px solid #79747E',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={22} color="#49454F" />
          </button>

          <button
            onClick={() => setCaregiverDrawerOpen(!caregiverDrawerOpen)}
            aria-label="Level Select & Settings"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: '2px solid #6750A4',
              backgroundColor: caregiverDrawerOpen ? '#6750A4' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Settings2 size={22} color={caregiverDrawerOpen ? '#FFFFFF' : '#6750A4'} />
          </button>
        </div>
      </div>

      {/* Live Game HUD: Timer, Moves, Streaks, Points */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '12px 18px',
          marginBottom: '16px',
          border: '2px solid #E7E0EC',
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={20} color="#6750A4" />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#79747E', fontWeight: 700, display: 'block' }}>
              {lang === 'te' ? 'సమయం' : 'TIME'}
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1B1F', fontFamily: 'monospace' }}>
              {formatTime(secondsElapsed)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} color="#0D9488" />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#79747E', fontWeight: 700, display: 'block' }}>
              {lang === 'te' ? 'ప్రయత్నాలు' : 'MOVES'}
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C1B1F' }}>
              {movesCount}
            </span>
          </div>
        </div>

        {streak > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', animation: 'bounce 0.3s ease' }}>
            <Flame size={22} color="#EA580C" />
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#EA580C' }}>
              {streak}x {lang === 'te' ? 'వరుస జతలు!' : 'Streak!'}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="#EAB308" />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#79747E', fontWeight: 700, display: 'block' }}>
              {lang === 'te' ? 'స్కోర్' : 'SCORE'}
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B45309' }}>
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Level Selector Bar (1 to 10 Graduate Progression) */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '14px',
          display: 'flex',
          gap: '6px'
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
          const tier = DIFFICULTY_TIERS[lvl];
          const isCurrent = level === lvl;
          return (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                initializeGame(lvl);
              }}
              style={{
                flex: '1 0 auto',
                minWidth: '85px',
                padding: '8px 12px',
                borderRadius: '16px',
                border: isCurrent ? '2.5px solid #6750A4' : '1.5px solid #CAC4D0',
                backgroundColor: isCurrent ? '#6750A4' : '#FFFFFF',
                color: isCurrent ? '#FFFFFF' : '#1C1B1F',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isCurrent ? '0 4px 12px rgba(103,80,164,0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div>Lvl {lvl}</div>
              <div style={{ fontSize: '0.72rem', opacity: isCurrent ? 0.95 : 0.75 }}>
                {tier.pairsCount * 2} Cards
              </div>
            </button>
          );
        })}
      </div>

      {/* Initial Flash Peek Overlay (Memorize Mode for Tougher Levels) */}
      {isPeeking && (
        <div
          style={{
            width: '100%',
            backgroundColor: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#B45309" className="pulse" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400E' }}>
              {lang === 'te'
                ? 'కార్డుల స్థానాలను గమనించండి! త్వరలో మూసుకుంటాయి:'
                : 'Memorize the card positions! Flipping face down in:'}
            </span>
          </div>
          <span
            style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#B45309',
              backgroundColor: '#FFFFFF',
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #F59E0B'
            }}
          >
            {peekCountdown}s
          </span>
        </div>
      )}

      {/* Gentle Guidance Hint when Idle */}
      {showHint && !isCompleted && !isPeeking && (
        <div
          style={{
            width: '100%',
            backgroundColor: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: '16px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.4s ease-out'
          }}
        >
          <Sparkles size={24} color="#B45309" />
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#92400E' }}>
            {lang === 'te'
              ? 'ఆరాముగా చేయండి! మెరుస్తున్న కార్డులు ఒకే జతకు చెందినవి.'
              : lang === 'hi'
              ? 'आराम से करें! चमकते हुए कार्ड एक ही जोड़ी के हैं।'
              : 'Take your time! The highlighted glowing cards share a pair.'
            }
          </span>
        </div>
      )}

      {/* Dynamic Card Grid Layout */}
      <div
        role="grid"
        aria-label="Reminiscence Memory Cards"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${currentTier.gridCols}, minmax(80px, 1fr))`,
          gap: level >= 5 ? '10px' : '14px',
          width: '100%',
          marginBottom: '28px'
        }}
      >
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || isPeeking;
          const isMatched = matchedIds.has(card.id);
          const isHinted = hintPairIndices.includes(index);

          return (
            <button
              key={card.cardInstanceId}
              onClick={() => handleCardClick(index)}
              disabled={isMatched || isPeeking}
              aria-label={isFlipped || isMatched ? card.label : 'Hidden Card'}
              style={{
                minHeight: level >= 6 ? '100px' : level >= 4 ? '115px' : '130px',
                borderRadius: level >= 5 ? '18px' : '24px',
                border: isMatched
                  ? '4px solid #1E7E34'
                  : isFlipped
                  ? '4px solid #6750A4'
                  : isHinted
                  ? '4px dashed #F59E0B'
                  : '3px solid #79747E',
                backgroundColor: isMatched
                  ? '#D1E7DD'
                  : isFlipped
                  ? card.bg
                  : '#FFFFFF',
                boxShadow: isMatched
                  ? '0 4px 12px rgba(30, 126, 52, 0.25)'
                  : isFlipped
                  ? '0 8px 24px rgba(103, 80, 164, 0.25)'
                  : isHinted
                  ? '0 0 16px rgba(245, 158, 11, 0.6)'
                  : '0 4px 12px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                cursor: isMatched || isPeeking ? 'default' : 'pointer',
                transform: isFlipped ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {isMatched ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '18px',
                      backgroundColor: '#1E7E34',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={22} color="#FFFFFF" strokeWidth={3} />
                  </div>
                  <span
                    style={{
                      fontSize: level >= 6 ? '0.75rem' : '0.85rem',
                      fontWeight: 800,
                      color: '#0F5132',
                      textAlign: 'center'
                    }}
                  >
                    {card.label}
                  </span>
                </div>
              ) : isFlipped ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: level >= 6 ? '2rem' : level >= 4 ? '2.4rem' : '2.8rem' }}>
                    {card.icon}
                  </span>
                  <span
                    style={{
                      fontSize: level >= 6 ? '0.75rem' : '0.85rem',
                      fontWeight: 800,
                      color: card.color,
                      textAlign: 'center',
                      lineHeight: 1.1
                    }}
                  >
                    {card.label}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={level >= 6 ? 28 : 34} color="#6750A4" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#49454F' }}>
                    {lang === 'te' ? 'తిప్పండి' : lang === 'hi' ? 'पलटें' : 'Tap'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Modal / Celebration Area */}
      {isCompleted && (
        <div
          role="status"
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '4px solid #1E7E34',
            borderRadius: '28px',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(30, 126, 52, 0.25)',
            animation: 'fadeIn 0.4s ease-out'
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '42px',
              backgroundColor: '#D1E7DD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Award size={48} color="#1E7E34" />
          </div>

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#0F5132',
              margin: '0 0 8px 0'
            }}
          >
            {lang === 'te' ? 'అద్భుతమైన జ్ఞాపకశక్తి విజయం!' : 'Level Cleared! Fantastic Memory!'}
          </h2>

          {/* Performance Summary Pill */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              margin: '14px 0 20px',
              padding: '12px 24px',
              borderRadius: '16px',
              backgroundColor: '#F3EDF7'
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6750A4', fontWeight: 700, display: 'block' }}>TIME</span>
              <strong style={{ fontSize: '1.2rem', color: '#1C1B1F' }}>{formatTime(secondsElapsed)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6750A4', fontWeight: 700, display: 'block' }}>MOVES</span>
              <strong style={{ fontSize: '1.2rem', color: '#1C1B1F' }}>{movesCount}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6750A4', fontWeight: 700, display: 'block' }}>SCORE</span>
              <strong style={{ fontSize: '1.2rem', color: '#B45309' }}>{score} pts</strong>
            </div>
          </div>

          {/* DDA Intelligence update */}
          {lastDDAEvaluation && (
            <div
              style={{
                backgroundColor: '#F3EDF7',
                borderRadius: '16px',
                padding: '12px 18px',
                marginBottom: '24px',
                border: '1px solid #CAC4D0',
                maxWidth: '520px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <Sparkles size={18} color="#6750A4" />
                <strong style={{ color: '#21005D', fontSize: '0.95rem' }}>
                  {lastDDAEvaluation.action === 'INCREASE' ? '🚀 Level Up Reached!' : 'Neuroplastic Health Status'}
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#49454F' }}>
                {lastDDAEvaluation.reason}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {level < 10 && (
              <button
                onClick={() => {
                  const nextLvl = level + 1;
                  setLevel(nextLvl);
                  initializeGame(nextLvl);
                }}
                style={{
                  minHeight: '58px',
                  padding: '12px 32px',
                  borderRadius: '20px',
                  backgroundColor: '#1E7E34',
                  color: '#FFFFFF',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(30, 126, 52, 0.4)'
                }}
              >
                <span>
                  {lang === 'te'
                    ? `తదుపరి కష్టమైన లెవెల్ ${level + 1} కి వెళ్ళు`
                    : `Advance to Tougher Level ${level + 1} (${DIFFICULTY_TIERS[level + 1].pairsCount * 2} Cards)`}
                </span>
                <ChevronRight size={26} color="#FFFFFF" />
              </button>
            )}

            <button
              onClick={() => initializeGame(level)}
              style={{
                minHeight: '58px',
                padding: '12px 24px',
                borderRadius: '20px',
                backgroundColor: '#F3EDF7',
                color: '#21005D',
                fontSize: '1.1rem',
                fontWeight: 700,
                border: '2px solid #6750A4',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={22} color="#6750A4" />
              <span>{lang === 'te' ? 'ఈ లెవెల్ మళ్లీ ఆడండి' : 'Replay Level'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
