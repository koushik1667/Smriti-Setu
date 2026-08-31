/**
 * Storage and Management for Personalized Family Orientation Questions
 * Helps elderly dementia patients remember family members, home addresses,
 * grandchildren, pets, and cherished family memories.
 */

const STORAGE_KEY = 'pharmavision_family_questions';

export const DEFAULT_FAMILY_QUESTIONS = [
  {
    id: 'fam_1',
    category: 'family_names',
    icon: '👨‍👩‍👧‍👦',
    relationship: 'Grandson / మనవడు',
    text: {
      te: 'మీ పెద్ద మనవడి పేరు ఏమిటి?',
      hi: 'आपके बड़े पोते का नाम क्या है?',
      en: 'What is the name of your eldest grandson?'
    },
    correctAnswer: {
      te: 'రమేష్',
      hi: 'रमेश',
      en: 'Ramesh'
    },
    options: [
      { text: { te: 'రమేష్', hi: 'रमेश', en: 'Ramesh' }, icon: '👦', isCorrect: true },
      { text: { te: 'సురేష్', hi: 'सुरेश', en: 'Suresh' }, icon: '🧑', isCorrect: false },
      { text: { te: 'వినోద్', hi: 'विनोद', en: 'Vinod' }, icon: '👨', isCorrect: false }
    ],
    familyHint: {
      te: 'అతను ప్రతి ఆదివారం మీ వద్దకు వచ్చి పండ్లు తెస్తాడు.',
      hi: 'वह हर रविवार आपके लिए ताज़ा फल लेकर आता है।',
      en: 'He visits you every Sunday and brings your favorite fruits.'
    }
  },
  {
    id: 'fam_2',
    category: 'home_location',
    icon: '🏡',
    relationship: 'Home / ఇల్లు',
    text: {
      te: 'మనం నివసించే మన సొంత ఊరు ఏది?',
      hi: 'हमारा अपना शहर या गाँव कौन सा है जहाँ हम रहते हैं?',
      en: 'Which home town or village do we live in?'
    },
    correctAnswer: {
      te: 'రాజమండ్రి (గోదావరి గట్టు)',
      hi: 'राजमुंदरी',
      en: 'Rajahmundry'
    },
    options: [
      { text: { te: 'రాజమండ్రి', hi: 'राजमुंदरी', en: 'Rajahmundry' }, icon: '🏡', isCorrect: true },
      { text: { te: 'చెన్నై', hi: 'चेन्नई', en: 'Chennai' }, icon: '🏢', isCorrect: false },
      { text: { te: 'ముంబై', hi: 'मुंबई', en: 'Mumbai' }, icon: '🏙️', isCorrect: false }
    ],
    familyHint: {
      te: 'మన ఇల్లు గోదావరి నది తీరానికి దగ్గరగా ఉంటుంది.',
      hi: 'हमारा घर गोदावरी नदी के तट के पास है।',
      en: 'Our home is nestled close to the holy river.'
    }
  },
  {
    id: 'fam_3',
    category: 'daughter_name',
    icon: '👧',
    relationship: 'Daughter / కూతురు',
    text: {
      te: 'రోజూ సాయంత్రం మీకు ఫోన్ చేసి మాట్లాడే మీ ముద్దుల కూతురు ఎవరు?',
      hi: 'रोज़ शाम को आपको फोन करके हालचाल पूछने वाली आपकी प्यारी बेटी कौन है?',
      en: 'Who is your caring daughter who calls you every evening?'
    },
    correctAnswer: {
      te: 'లక్ష్మి',
      hi: 'लक्ष्मी',
      en: 'Lakshmi'
    },
    options: [
      { text: { te: 'లక్ష్మి', hi: 'लक्ष्मी', en: 'Lakshmi' }, icon: '👩', isCorrect: true },
      { text: { te: 'రాధ', hi: 'राधा', en: 'Radha' }, icon: '👵', isCorrect: false },
      { text: { te: 'గీత', hi: 'गीता', en: 'Geeta' }, icon: '👱‍♀️', isCorrect: false }
    ],
    familyHint: {
      te: 'ఆమె మీకు ఇష్టమైన పాయసం చాలా రుచిగా చేస్తుంది.',
      hi: 'वह आपके लिए स्वादिष्ट खीर बनाती है।',
      en: 'She cooks your favorite sweet pudding with love.'
    }
  }
];

export const familyQuestionsStorage = {
  getQuestions() {
    if (typeof window === 'undefined') return DEFAULT_FAMILY_QUESTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAMILY_QUESTIONS));
        return DEFAULT_FAMILY_QUESTIONS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.warn('[familyQuestionsStorage] Failed to read:', e);
      return DEFAULT_FAMILY_QUESTIONS;
    }
  },

  addQuestion(questionData) {
    try {
      const existing = this.getQuestions();
      const newEntry = {
        id: `fam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: questionData.category || 'family_names',
        icon: questionData.icon || '👨‍👩‍👧‍👦',
        relationship: questionData.relationship || 'Family',
        text: {
          te: questionData.questionTe || questionData.questionEn,
          hi: questionData.questionHi || questionData.questionEn,
          en: questionData.questionEn
        },
        options: [
          {
            text: {
              te: questionData.correctAnswerTe || questionData.correctAnswerEn,
              hi: questionData.correctAnswerHi || questionData.correctAnswerEn,
              en: questionData.correctAnswerEn
            },
            icon: '✅',
            isCorrect: true
          },
          {
            text: {
              te: questionData.wrongOption1Te || questionData.wrongOption1En,
              hi: questionData.wrongOption1Hi || questionData.wrongOption1En,
              en: questionData.wrongOption1En
            },
            icon: '⚪',
            isCorrect: false
          },
          ...(questionData.wrongOption2En ? [{
            text: {
              te: questionData.wrongOption2Te || questionData.wrongOption2En,
              hi: questionData.wrongOption2Hi || questionData.wrongOption2En,
              en: questionData.wrongOption2En
            },
            icon: '⚪',
            isCorrect: false
          }] : [])
        ],
        familyHint: {
          te: questionData.hintTe || questionData.hintEn || '',
          hi: questionData.hintHi || questionData.hintEn || '',
          en: questionData.hintEn || ''
        }
      };

      const updated = [newEntry, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('[familyQuestionsStorage] Failed to save:', e);
      return [];
    }
  },

  deleteQuestion(id) {
    try {
      const existing = this.getQuestions();
      const filtered = existing.filter(q => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      return [];
    }
  },

  resetDefaults() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAMILY_QUESTIONS));
    return DEFAULT_FAMILY_QUESTIONS;
  }
};
