import React, { useState } from 'react';
import { X, Heart, Home, Users, Sparkles, Plus, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { familyQuestionsStorage } from '../../services/familyQuestionsStorage.js';

const CATEGORIES = [
  { id: 'family_names', label: '👨‍👩‍👧‍👦 కుటుంబ సభ్యులు / Family Member', icon: '👨‍👩‍👧‍👦' },
  { id: 'home_location', label: '🏡 ఇల్లు & ఊరు / Home & Town', icon: '🏡' },
  { id: 'pet', label: '🐕 పెంపుడు జంతువు / Family Pet', icon: '🐕' },
  { id: 'memories', label: '❤️ ముఖ్యమైన జ్ఞాపకం / Cherished Memory', icon: '❤️' }
];

export const AddFamilyQuestionModal = ({ isOpen, onClose, onQuestionAdded }) => {
  const { lang } = useLanguage();
  const [category, setCategory] = useState('family_names');
  const [relationship, setRelationship] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [wrongOption1, setWrongOption1] = useState('');
  const [wrongOption2, setWrongOption2] = useState('');
  const [hint, setHint] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim() || !correctAnswer.trim() || !wrongOption1.trim()) {
      alert('Please fill out the question, the correct answer, and at least one other choice.');
      return;
    }

    const selectedCat = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

    const newQ = {
      category,
      icon: selectedCat.icon,
      relationship: relationship.trim() || 'Family',
      questionEn: questionText.trim(),
      questionTe: questionText.trim(),
      questionHi: questionText.trim(),
      correctAnswerEn: correctAnswer.trim(),
      correctAnswerTe: correctAnswer.trim(),
      correctAnswerHi: correctAnswer.trim(),
      wrongOption1En: wrongOption1.trim(),
      wrongOption1Te: wrongOption1.trim(),
      wrongOption1Hi: wrongOption1.trim(),
      wrongOption2En: wrongOption2.trim(),
      wrongOption2Te: wrongOption2.trim(),
      wrongOption2Hi: wrongOption2.trim(),
      hintEn: hint.trim(),
      hintTe: hint.trim(),
      hintHi: hint.trim()
    };

    familyQuestionsStorage.addQuestion(newQ);
    if (onQuestionAdded) onQuestionAdded();
    onClose();
  };

  const isTe = lang === 'te';

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 12, 29, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          padding: '28px 24px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          border: '3px solid #6750A4',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '22px',
                backgroundColor: '#F3EDF7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart size={24} color="#6750A4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1C1B1F', margin: 0 }}>
                {isTe ? 'కుటుంబ ప్రశ్నను జోడించండి' : 'Add Personalized Family Question'}
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#49454F', margin: '2px 0 0' }}>
                {isTe ? 'పేర్లు, ఇల్లు, బంధువులను గుర్తుచేయడానికి ప్రశ్నలను తయారుచేయండి' : 'Help your loved one remember names, home, and cherished moments'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              border: '1.5px solid #CAC4D0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} color="#1C1B1F" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category Select */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1C1B1F', display: 'block', marginBottom: '6px' }}>
              {isTe ? 'వర్గం / విభాగం:' : 'Category:'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '14px',
                    border: category === cat.id ? '2.5px solid #6750A4' : '1px solid #CAC4D0',
                    backgroundColor: category === cat.id ? '#F3EDF7' : '#FFFFFF',
                    color: '#1C1B1F',
                    fontSize: '0.85rem',
                    fontWeight: category === cat.id ? 800 : 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Relationship / Subject */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1C1B1F', display: 'block', marginBottom: '6px' }}>
              {isTe ? 'బంధుత్వం / విషయం (ఉదా: మనవడు, ఇల్లు):' : 'Relationship / Topic (e.g. Grandson, Home Village):'}
            </label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder={isTe ? 'ఉదా: మనవడు రమేష్ / మా ఇల్లు' : 'e.g. Eldest Grandson / Home Village'}
              style={{
                width: '100%',
                minHeight: '46px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1.5px solid #CAC4D0',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Question Text */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1C1B1F', display: 'block', marginBottom: '6px' }}>
              {isTe ? 'ప్రశ్న (Question): *' : 'Question to Ask the Patient: *'}
            </label>
            <input
              type="text"
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={isTe ? 'ఉదా: మీ పెద్ద మనవడి పేరు ఏమిటి?' : 'e.g. What is your grandson\'s name?'}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '2px solid #6750A4',
                fontSize: '1rem',
                outline: 'none',
                fontWeight: 600
              }}
            />
          </div>

          {/* Correct Answer */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E7E34', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Check size={18} color="#1E7E34" />
              <span>{isTe ? 'సరైన సమాధానం (Correct Answer): *' : 'Correct Answer: *'}</span>
            </label>
            <input
              type="text"
              required
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder={isTe ? 'ఉదా: రమేష్' : 'e.g. Ramesh'}
              style={{
                width: '100%',
                minHeight: '46px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '2px solid #1E7E34',
                backgroundColor: '#F0FDF4',
                fontSize: '0.95rem',
                outline: 'none',
                fontWeight: 700,
                color: '#15803D'
              }}
            />
          </div>

          {/* Incorrect Option 1 */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#49454F', display: 'block', marginBottom: '6px' }}>
              {isTe ? 'తప్పు ఎంపిక 1 (Wrong Option 1): *' : 'Incorrect Choice 1: *'}
            </label>
            <input
              type="text"
              required
              value={wrongOption1}
              onChange={(e) => setWrongOption1(e.target.value)}
              placeholder={isTe ? 'ఉదా: సురేష్' : 'e.g. Suresh'}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1.5px solid #CAC4D0',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Incorrect Option 2 (Optional) */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#49454F', display: 'block', marginBottom: '6px' }}>
              {isTe ? 'తప్పు ఎంపిక 2 (ఆప్షనల్):' : 'Incorrect Choice 2 (Optional):'}
            </label>
            <input
              type="text"
              value={wrongOption2}
              onChange={(e) => setWrongOption2(e.target.value)}
              placeholder={isTe ? 'ఉదా: వినోద్' : 'e.g. Vinod'}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1.5px solid #CAC4D0',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Family Clue / Hint */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#49454F', display: 'block', marginBottom: '6px' }}>
              {isTe ? 'గుర్తుచేసే చిన్న క్లూ (Family Memory Hint):' : 'Affectionate Memory Clue (Spoken to patient if stuck):'}
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder={isTe ? 'ఉదా: అతను ప్రతి ఆదివారం పండ్లు తెస్తాడు' : 'e.g. He visits on Sundays with fresh fruits'}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1.5px solid #CAC4D0',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              minHeight: '52px',
              marginTop: '10px',
              borderRadius: '18px',
              backgroundColor: '#6750A4',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(103,80,164,0.35)'
            }}
          >
            <Plus size={22} color="#FFFFFF" />
            <span>{isTe ? 'ప్రశ్నను సేవ్ చేయండి' : 'Save Family Question'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
