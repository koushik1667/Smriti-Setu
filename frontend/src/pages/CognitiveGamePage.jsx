import React, { useState } from 'react';
import { ReminiscenceMemoryMatch } from '../components/cognitive/ReminiscenceMemoryMatch';
import { CognitiveQAGame } from '../components/cognitive/CognitiveQAGame';
import { Brain, Sparkles, HeartHandshake, HelpCircle, ListOrdered, Shapes } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const CognitiveGamePage = () => {
  const { lang } = useLanguage();
  const [selectedGame, setSelectedGame] = useState('reminiscence_match');

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '16px' }}>
      {/* Game Selector Tabs (Touch targets >= 48dp) */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => setSelectedGame('reminiscence_match')}
          style={{
            minHeight: '52px',
            padding: '10px 22px',
            borderRadius: '22px',
            border: selectedGame === 'reminiscence_match' ? '3px solid #6750A4' : '2px solid #CAC4D0',
            backgroundColor: selectedGame === 'reminiscence_match' ? '#6750A4' : '#FFFFFF',
            color: selectedGame === 'reminiscence_match' ? '#FFFFFF' : '#1C1B1F',
            fontWeight: 800,
            fontSize: '1.02rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: selectedGame === 'reminiscence_match' ? '0 6px 16px rgba(103, 80, 164, 0.35)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <HeartHandshake size={22} />
          <span>
            {lang === 'te'
              ? 'జ్ఞాపకశక్తి మ్యాచింగ్ (10 లెవెల్స్)'
              : lang === 'hi'
              ? 'स्मरण शक्ति मिलान (10 स्तर)'
              : 'Memory Match (10 Levels)'}
          </span>
        </button>

        <button
          onClick={() => setSelectedGame('cognitive_qa')}
          style={{
            minHeight: '52px',
            padding: '10px 22px',
            borderRadius: '22px',
            border: selectedGame === 'cognitive_qa' ? '3px solid #6750A4' : '2px solid #CAC4D0',
            backgroundColor: selectedGame === 'cognitive_qa' ? '#6750A4' : '#FFFFFF',
            color: selectedGame === 'cognitive_qa' ? '#FFFFFF' : '#1C1B1F',
            fontWeight: 800,
            fontSize: '1.02rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: selectedGame === 'cognitive_qa' ? '0 6px 16px rgba(103, 80, 164, 0.35)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <HelpCircle size={22} />
          <span>
            {lang === 'te'
              ? 'అవగాహన & జ్ఞాపకశక్తి Q&A (10 లెవెల్స్)'
              : lang === 'hi'
              ? 'स्मरण शक्ति प्रश्नोत्तरी (10 स्तर)'
              : 'Cognitive Q&A Quiz (10 Levels)'}
          </span>
        </button>
      </div>

      {/* Render Active Mini-Game */}
      {selectedGame === 'reminiscence_match' && <ReminiscenceMemoryMatch />}
      {selectedGame === 'cognitive_qa' && <CognitiveQAGame />}
    </div>
  );
};
