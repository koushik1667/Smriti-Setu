import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  Award,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Timer,
  Target,
  Flame,
  Zap,
  RotateCcw,
  Heart,
  Plus,
  Trash2,
  Users,
  Home
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { playGentleTone, speakText } from '../../utils/speechUtils.js';
import { syncManager } from '../../services/syncManager.js';
import { familyQuestionsStorage } from '../../services/familyQuestionsStorage.js';
import { AddFamilyQuestionModal } from './AddFamilyQuestionModal.jsx';

// 10 Progressive Clinical Cognitive Q&A Levels with 8 regional languages
const QA_LEVELS = [
  {
    level: 1,
    title: 'Daily Orientation & Morning Habits',
    badge: 'Level 1: Daily Orientation',
    questions: [
      {
        id: 'q1_1',
        icon: '☀️',
        text: {
          te: 'రోజూ ఉదయం నిద్రలేవగానే సాధారణంగా త్రాగే వేడి పానీయం ఏది?',
          hi: 'सुबह उठकर आम तौर पर पिया जाने वाला गरम पेय कौन सा है?',
          ta: 'காலையில் எழுந்தவுடன் பொதுவாகக் குடிக்கும் சூடான பானம் எது?',
          kn: 'ಬೆಳಿಗ್ಗೆ ಎದ್ದ ತಕ್ಷಣ ಸಾಮಾನ್ಯವಾಗಿ ಕುಡಿಯುವ ಬಿಸಿ ಪಾನೀಯ ಯಾವುದು?',
          bn: 'সকালে ঘুম থেকে উঠে সাধারণত কোন গরম পানীয় পান করা হয়?',
          as: 'ৰাতিপুৱা শোৱাৰ পৰা উঠি সাধাৰণতে কি গৰম পানীয় খোৱা হয়?',
          mr: 'सकाळी उठल्यावर सामान्यतः कोणते गरम पेय प्यायले जाते?',
          en: 'What hot beverage is traditionally enjoyed first thing in the morning?'
        },
        options: [
          {
            text: {
              te: 'తాజా టీ లేదా కాఫీ',
              hi: 'ताज़ा चाय या कॉफ़ी',
              ta: 'சூடான தேநீர் அல்லது காபி',
              kn: 'ಬಿಸಿ ಚಹಾ ಅಥವಾ ಕಾಫಿ',
              bn: 'গরম চা বা কফি',
              as: 'গৰম চাহ বা কফি',
              mr: 'गरम चहा किंवा कॉफी',
              en: 'Fresh Tea or Coffee'
            },
            icon: '☕',
            isCorrect: true
          },
          {
            text: {
              te: 'చల్లని ఐస్ క్రీం',
              hi: 'ठंडी आइसक्रीम',
              ta: 'குளிர்ந்த ஐஸ்கிரீம்',
              kn: 'ತಣ್ಣನೆಯ ಐಸ್ ಕ್ರೀಮ್',
              bn: 'ঠান্ডা আইসক্রিম',
              as: 'আইচক্ৰীম',
              mr: 'आईस्क्रीम',
              en: 'Cold Ice Cream'
            },
            icon: '🍨',
            isCorrect: false
          },
          {
            text: {
              te: 'కారపు సూప్',
              hi: 'मसालेदार सूप',
              ta: 'காரமான சூப்',
              kn: 'ಖಾರದ ಸೂಪ್',
              bn: 'ঝাল স্যুপ',
              as: 'মচলাযুক্ত চুপ',
              mr: 'तिखट सूप',
              en: 'Spicy Soup'
            },
            icon: '🥣',
            isCorrect: false
          }
        ]
      },
      {
        id: 'q1_2',
        icon: '💧',
        text: {
          te: 'దాహం వేసినప్పుడు లేదా మందులు వేసుకునేటప్పుడు ఏమి త్రాగాలి?',
          hi: 'प्यास लगने पर या दवा लेते समय क्या पीना चाहिए?',
          ta: 'தாகம் எடுக்கும் போது அல்லது மருந்து உட்கொள்ளும் போது என்ன குடிக்க வேண்டும்?',
          kn: 'ಬಾಯಾರಿಕೆಯಾದಾಗ ಅಥವಾ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳುವಾಗ ಏನು ಕುಡಿಯಬೇಕು?',
          bn: 'তৃষ্ণা পেলে বা ওষুধ খাওয়ার সময় কী পান করা উচিত?',
          as: 'পিয়াহ লাগিলে বা ঔষধ খাওঁতে কি খাব লাগে?',
          mr: 'तहान लागल्यावर किंवा औषध घेताना काय प्यावे?',
          en: 'What should you drink when feeling thirsty or swallowing your medicine?'
        },
        options: [
          {
            text: {
              te: 'స్వచ్ఛమైన తాజా మంచినీరు',
              hi: 'साफ ताज़ा पानी',
              ta: 'சுத்தமான குடிநீர்',
              kn: 'ಶುದ್ಧ ಕುಡಿಯುವ ನೀರು',
              bn: 'বিশুদ্ধ পানীয় জল',
              as: 'বিশুদ্ধ খোৱা পানী',
              mr: 'स्वच्छ पिण्याचे पाणी',
              en: 'Pure Fresh Water'
            },
            icon: '🥛',
            isCorrect: true
          },
          {
            text: {
              te: 'చక్కెర సోడా',
              hi: 'मीठा सोडा',
              ta: 'சோடா பானம்',
              kn: 'ಸೋಡಾ ಪಾನೀಯ',
              bn: 'মিষ্টি সোডা',
              as: 'সোডা',
              mr: 'गोड सोडा',
              en: 'Fizzy Soda'
            },
            icon: '🥤',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 2,
    title: 'Heritage & Sensory Reminiscence',
    badge: 'Level 2: Cultural Senses',
    questions: [
      {
        id: 'q2_1',
        icon: '🪶',
        text: {
          te: 'భారతదేశ జాతీయ పక్షిగా గుర్తింపు పొందిన అందమైన పక్షి ఏది?',
          hi: 'भारत का राष्ट्रीय पक्षी कौन सा है जिसके सुंदर पंख होते हैं?',
          ta: 'அழகான தோகைகளைக் கொண்ட இந்தியாவின் தேசியப் பறவை எது?',
          kn: 'ಸುಂದರ ಗರಿಗಳನ್ನು ಹೊಂದಿರುವ ಭಾರತದ ರಾಷ್ಟ್ರೀಯ ಪಕ್ಷಿ ಯಾವುದು?',
          bn: 'সুন্দর পালকযুক্ত ভারতের জাতীয় পাখি কোনটি?',
          as: 'ভাৰতৰ জাতীয় পক্ষী কোনটো?',
          mr: 'सुंदर पिसे असलेला भारताचा राष्ट्रीय पक्षी कोणता?',
          en: 'Which majestic bird with vibrant feathers is the National Bird of India?'
        },
        options: [
          {
            text: {
              te: 'నెమలి (పీకాక్)',
              hi: 'मोर (Peacock)',
              ta: 'மயில் (Peacock)',
              kn: 'ನವಿಲು (Peacock)',
              bn: 'ময়ূর (Peacock)',
              as: 'ময়ূৰ (Peacock)',
              mr: 'मोर (Peacock)',
              en: 'Peacock'
            },
            icon: '🪶',
            isCorrect: true
          },
          {
            text: {
              te: 'కాకి',
              hi: 'कौआ',
              ta: 'காகம்',
              kn: 'ಕಾಗೆ',
              bn: 'কাক',
              as: 'কাউৰী',
              mr: 'कावळा',
              en: 'Crow'
            },
            icon: '🐦',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 3,
    title: 'Visual Clarity & Daily Tools',
    badge: 'Level 3: Everyday Objects',
    questions: [
      {
        id: 'q3_1',
        icon: '👓',
        text: {
          te: 'వార్తాపత్రిక లేదా పుస్తకంలోని చిన్న అక్షరాలను స్పష్టంగా చదవడానికి ఏమి ఉపయోగిస్తారు?',
          hi: 'अखबार या किताब के छोटे अक्षरों को साफ पढ़ने के लिए क्या पहनते हैं?',
          ta: 'செய்தித்தாள் அல்லது புத்தகத்தை தெளிவாகப் படிக்க எதைப் பயன்படுத்துகிறோம்?',
          kn: 'ಪುಸ್ತಕ ಅಥವಾ ಪತ್ರಿಕೆಯ ಸಣ್ಣ ಅಕ್ಷರಗಳನ್ನು ಓದಲು ಏನನ್ನು ಧರಿಸುತ್ತಾರೆ?',
          bn: 'সংবাদপত্র বা বইয়ের ছোট লেখা স্পষ্ট পড়তে কী ব্যবহার করা হয়?',
          as: 'বাতৰিকাকত পঢ়িবলৈ কি ব্যৱহাৰ কৰা হয়?',
          mr: 'वर्तमानपत्रातील लहान अक्षरे वाचण्यासाठी काय वापरतात?',
          en: 'What optical tool helps elderly eyes read small newspaper print clearly?'
        },
        options: [
          {
            text: {
              te: 'కళ్ళద్దాలు (రీడింగ్ గ్లాసెస్)',
              hi: 'पढ़ने का चश्मा (Spectacles)',
              ta: 'வாசிப்பு கண்ணாடி (Spectacles)',
              kn: 'ಓದುವ ಕನ್ನಡಕ (Spectacles)',
              bn: 'পড়ার চশমা (Glasses)',
              as: 'পঢ়া চশমা (Glasses)',
              mr: 'वाचनाचा चष्मा (Glasses)',
              en: 'Reading Spectacles'
            },
            icon: '👓',
            isCorrect: true
          },
          {
            text: {
              te: 'చేతి గడియారం',
              hi: 'घड़ी',
              ta: 'கைக்கடிகாரம்',
              kn: 'ಕೈಗಡಿಯಾರ',
              bn: 'হাতঘড়ি',
              as: 'হাতঘড়ী',
              mr: 'मनगटी घड्याळ',
              en: 'Wrist Watch'
            },
            icon: '⌚',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 4,
    title: 'Nature & Seasonal Senses',
    badge: 'Level 4: Seasonal Awareness',
    questions: [
      {
        id: 'q4_1',
        icon: '☂️',
        text: {
          te: 'ఆకాశం నుంచి భారీ వర్షం కురుస్తున్నప్పుడు తడవకుండా ఉండటానికి ఏమి పట్టుకుంటారు?',
          hi: 'आसमान से तेज बारिश होने पर भीगने से बचने के लिए क्या लेते हैं?',
          ta: 'மழை பெய்யும் போது நனையாமல் இருக்க எதை எடுத்துச் செல்கிறோம்?',
          kn: 'ಜೋರಾಗಿ ಮಳೆ ಸುರಿಯುವಾಗ ನೆನೆಯದಂತೆ ರಕ್ಷಿಸಿಕೊಳ್ಳಲು ಏನನ್ನು ಹಿಡಿಯುತ್ತೇವೆ?',
          bn: 'বৃষ্টির সময় ভিজে না যাওয়ার জন্য আমরা কী ব্যবহার করি?',
          as: 'বৰষুণৰ পৰা বাচিবলৈ কি ব্যৱহাৰ কৰা হয়?',
          mr: 'पावसात भिजण्यापासून वाचण्यासाठी काय वापरतात?',
          en: 'What protects us from getting wet when monsoon rains fall?'
        },
        options: [
          {
            text: {
              te: 'గొడుగు',
              hi: 'छतरी (Umbrella)',
              ta: 'குடை (Umbrella)',
              kn: 'ಕೊಡೆ (Umbrella)',
              bn: 'ছাতা (Umbrella)',
              as: 'ছাতি (Umbrella)',
              mr: 'छत्री (Umbrella)',
              en: 'Monsoon Umbrella'
            },
            icon: '☂️',
            isCorrect: true
          },
          {
            text: {
              te: 'వార్తాపత్రిక',
              hi: 'अखबार',
              ta: 'செய்தித்தாள்',
              kn: 'ಖಬರ್ ಕಾಗದ',
              bn: 'খবরের কাগজ',
              as: 'বাতৰিকাকত',
              mr: 'वर्तमानपत्र',
              en: 'Newspaper'
            },
            icon: '📰',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 5,
    title: 'Nutrition & Heritage Fruits',
    badge: 'Level 5: Senses & Health',
    questions: [
      {
        id: 'q5_1',
        icon: '🥭',
        text: {
          te: 'భారతదేశంలో వేసవి కాలంలో లభించే "ఫలాల రాజు" అని పిలువబడే తియ్యటి పండు ఏది?',
          hi: 'गर्मियों में मिलने वाला मीठा फल जिसे "फलों का राजा" कहा जाता है, कौन सा है?',
          ta: 'கோடை காலத்தில் கிடைக்கும் "பழங்களின் ராஜா" எது?',
          kn: 'ಬೇಸಿಗೆಯಲ್ಲಿ ಸಿಗುವ "ಹಣ್ಣುಗಳ ರಾಜ" ಎಂದು ಕರೆಯಲ್ಪಡುವ ಹಣ್ಣು ಯಾವುದು?',
          bn: 'গ্রীষ্মকালে পাওয়া মিষ্টি ফল যাকে "ফলের রাজা" বলা হয়, সেটি কোনটি?',
          as: 'গ্রীষ্মকালৰ মিঠা ফল যাক "ফলৰ ৰজা" বোলা হয়, সেইটো কি?',
          mr: 'उन्हाळ्यात मिळणारे "फळांचा राजा" मानले जाणारे फळ कोणते?',
          en: 'Which sweet golden fruit harvested in summer is celebrated as the "King of Fruits"?'
        },
        options: [
          {
            text: {
              te: 'రసాల మామిడి పండు',
              hi: 'मीठा आम (Mango)',
              ta: 'சுவையான மாம்பழம் (Mango)',
              kn: 'ಸಿಹಿ ಮಾವಿನ ಹಣ್ಣು (Mango)',
              bn: 'পাকা আম (Mango)',
              as: 'মিঠা আম (Mango)',
              mr: 'गोड आंबा (Mango)',
              en: 'Sweet Mango'
            },
            icon: '🥭',
            isCorrect: true
          },
          {
            text: {
              te: 'చేదు కాకరకాయ',
              hi: 'करेला',
              ta: 'பாகற்காய்',
              kn: 'ಹಾಗಲಕಾಯಿ',
              bn: 'করলা',
              as: 'তিতা কেৰেলা',
              mr: 'कारले',
              en: 'Bitter Gourd'
            },
            icon: '🥒',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 6,
    title: 'Medication Safety & Health Habits',
    badge: 'Level 6: Wellness Safety',
    questions: [
      {
        id: 'q6_1',
        icon: '💊',
        text: {
          te: 'వైద్యులు సూచించిన మందులను ఎప్పుడు తీసుకోవాలి?',
          hi: 'डॉक्टर द्वारा बताई गई दवाइयाँ कब लेनी चाहिए?',
          ta: 'மருத்துவர் பரிந்துரைத்த மருந்துகளை எப்போது எடுத்துக்கொள்ள வேண்டும்?',
          kn: 'ವೈದ್ಯರು ಸೂಚಿಸಿದ ಮಾತ್ರೆಗಳನ್ನು ಯಾವಾಗ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?',
          bn: 'ডাক্তারের পরামর্শ অনুযায়ী ওষুধ কখন খাওয়া উচিত?',
          as: 'ডাক্তৰে কোৱা মতে ঔষধ কেতিয়া খাব লাগে?',
          mr: 'डॉक्टरांच्या सल्ल्यानुसार औषधे कधी घेतली पाहिजेत?',
          en: 'When should prescribed medical tablets and doses be taken?'
        },
        options: [
          {
            text: {
              te: 'సరైన సమయానికి డాక్టర్ చెప్పిన ప్రకారం',
              hi: 'सही समय पर डॉक्टर के निर्देशानुसार',
              ta: 'சரியான நேரத்தில் மருத்துவர் அறிவுரைப்படி',
              kn: 'ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ವೈದ್ಯರ ಸಲಹೆಯಂತೆ',
              bn: 'নির্দিষ্ট সময়ে ডাক্তারের পরামর্শ অনুযায়ী',
              as: 'সঠিক সময়ত নিয়ম অনুসৰি',
              mr: 'वेळेवर डॉक्टरांच्या सल्ल्यानुसार',
              en: 'On schedule as prescribed by the doctor'
            },
            icon: '⏰',
            isCorrect: true
          },
          {
            text: {
              te: 'గుర్తువచ్చినప్పుడే ఎప్పుడైనా',
              hi: 'जब मन करे बिना समय के',
              ta: 'எப்போதாவது நேரம் தவறாக',
              kn: 'ಯಾವಾಗಲಾದರೂ ಸಮಯವಿಲ್ಲದೆ',
              bn: 'যখন খুশি কোনো নিয়ম ছাড়া',
              as: 'যিকোনো সময়ত',
              mr: 'कधीही अवेळी',
              en: 'Randomly whenever remembered'
            },
            icon: '❓',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 7,
    title: 'Musical & Auditory Reminiscence',
    badge: 'Level 7: Auditory Memory',
    questions: [
      {
        id: 'q7_1',
        icon: '🪕',
        text: {
          te: 'తీగలతో శ్రావ్యమైన భారతీయ శాస్త్రీయ సంగీతాన్ని పలికించే వాద్యం ఏది?',
          hi: 'तारों द्वारा मधुर शास्त्रीय संगीत बजाने वाला भारतीय वाद्य कौन सा है?',
          ta: 'நரம்புகளால் அமைந்த பாரம்பரிய இந்திய இசைக்கருவி எது?',
          kn: 'ತಂತಿಗಳಿಂದ ಮಧುರ ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ ನುಡಿಸುವ ಭಾರತೀಯ ವಾದ್ಯ ಯಾವುದು?',
          bn: 'তার দিয়ে মধুর ভারতীয় শাস্ত্রীয় সঙ্গীত বাজানোর বাদ্যযন্ত্র কোনটি?',
          as: 'তাঁৰ থকা ভাৰতীয় শাস্ত্ৰীয় সংগীতৰ বাদ্য কি?',
          mr: 'तारांनी सुरेल शास्त्रीय संगीत वाजवणारे भारतीय वाद्य कोणते?',
          en: 'Which classical Indian string instrument produces meditative raga melodies?'
        },
        options: [
          {
            text: {
              te: 'సితార్ లేదా వీణ',
              hi: 'सितार या वीणा',
              ta: 'சித்தார் அல்லது வீணை',
              kn: 'ಸಿತಾರ್ ಅಥವಾ ವೀಣೆ',
              bn: 'সেতার বা বীণা',
              as: 'চেতাৰ বা বীণা',
              mr: 'सतार किंवा वीणा',
              en: 'Classical Sitar or Veena'
            },
            icon: '🪕',
            isCorrect: true
          },
          {
            text: {
              te: 'ట్రాఫిక్ హారన్',
              hi: 'गाड़ी का हॉर्न',
              ta: 'வாகன ஹாரன்',
              kn: 'ಕಾರಿನ ಹಾರ್ನ್',
              bn: 'গাড়ির হর্ন',
              as: 'গাড়ীৰ হৰ্ণ',
              mr: 'गाडीचा हॉर्न',
              en: 'Car Traffic Horn'
            },
            icon: '📢',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 8,
    title: 'Time, Clock & Sequence Memory',
    badge: 'Level 8: Temporal Logic',
    questions: [
      {
        id: 'q8_1',
        icon: '⏱️',
        text: {
          te: 'ఒక రోజులో ఎన్ని గంటలు ఉంటాయి?',
          hi: 'एक पूरे दिन और रात में कुल कितने घंटे होते हैं?',
          ta: 'ஒரு முழு நாளில் மொத்தம் எத்தனை மணிநேரங்கள் உள்ளன?',
          kn: 'ಒಂದು ಪೂರ್ತಿ ದಿನದಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಗಂಟೆಗಳು ಇರುತ್ತವೆ?',
          bn: 'একটি পুরো দিনে মোট কত ঘণ্টা থাকে?',
          as: 'এদিনত মুঠ কিমান ঘণ্টা থাকে?',
          mr: 'एका संपूर्ण दिवसात एकूण किती तास असतात?',
          en: 'How many hours are in one complete cycle of a full day and night?'
        },
        options: [
          {
            text: {
              te: '24 గంటలు',
              hi: '24 घंटे',
              ta: '24 மணிநேரம்',
              kn: '24 ಗಂಟೆಗಳು',
              bn: '২৪ ঘণ্টা',
              as: '২৪ ঘণ্টা',
              mr: '२४ तास',
              en: '24 Hours'
            },
            icon: '🕰️',
            isCorrect: true
          },
          {
            text: {
              te: '10 గంటలు',
              hi: '10 घंटे',
              ta: '10 மணிநேரம்',
              kn: '10 ಗಂಟೆಗಳು',
              bn: '১০ ঘণ্টা',
              as: '১০ ঘণ্টা',
              mr: '१० तास',
              en: '10 Hours'
            },
            icon: '⏳',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 9,
    title: 'Sacred Nature & Courtyard Plants',
    badge: 'Level 9: Cultural Botany',
    questions: [
      {
        id: 'q9_1',
        icon: '🌿',
        text: {
          te: 'భారతీయ ఇళ్ల ముంగిట పవిత్రంగా పూజించే ఔషధ మొక్క ఏది?',
          hi: 'भारतीय घरों के आंगन में श्रद्धा से लगाई जाने वाली पवित्र औषधीय वनस्पति कौन सी है?',
          ta: 'வீட்டு முற்றத்தில் புனிதமாக வைத்து வணங்கப்படும் மூலிகைச் செடி எது?',
          kn: 'ಭಾರತೀಯ ಮನೆಗಳ ಅಂಗಳದಲ್ಲಿ ಪೂಜಿಸುವ ಪವಿತ್ರ ಔಷಧೀಯ ಗಿಡ ಯಾವುದು?',
          bn: 'ভারতীয় বাড়ির উঠোনে ভক্তিভরে পূজা করা পবিত্র ভেষজ গাছ কোনটি?',
          as: 'ঘৰৰ চোতালত ৰোৱা পৱিত্ৰ বনৌষধি গছ কি?',
          mr: 'घराच्या अंगणात पूजनीय मानली जाणारी पवित्र औषधी वनस्पती कोणती?',
          en: 'Which fragrant, medicinal holy plant is traditionally nurtured in Indian home courtyards?'
        },
        options: [
          {
            text: {
              te: 'తులసి మొక్క (Holy Tulsi)',
              hi: 'तुलसी (Holy Tulsi)',
              ta: 'துளசி செடி (Holy Tulsi)',
              kn: 'ತುಳಸಿ ಗಿಡ (Holy Tulsi)',
              bn: 'তুলসী গাছ (Holy Tulsi)',
              as: 'তুলসী গছ (Holy Tulsi)',
              mr: 'तुळशीचे रोप (Holy Tulsi)',
              en: 'Holy Basil (Tulsi)'
            },
            icon: '🌿',
            isCorrect: true
          },
          {
            text: {
              te: 'ముళ్ళ కంచె',
              hi: 'कांटेदार झाड़ी',
              ta: 'முள் செடி',
              kn: 'ಮುಳ್ಳಿನ ಪೊದೆ',
              bn: 'কাঁটাঝোপ',
              as: 'কাঁইটীয়া গছ',
              mr: 'काटेरी झुडूप',
              en: 'Thorny Bush'
            },
            icon: '🌵',
            isCorrect: false
          }
        ]
      }
    ]
  },
  {
    level: 10,
    title: 'Grandmaster Executive Logic',
    badge: 'Level 10: Grandmaster Cognition',
    questions: [
      {
        id: 'q10_1',
        icon: '🧠',
        text: {
          te: 'వృద్ధాప్యంలో జ్ఞాపకశక్తి చురుకుగా ఉండటానికి ప్రతిరోజూ ఏమి చేయాలి?',
          hi: 'उम्र बढ़ने पर भी याददाश्त को सक्रिय और मजबूत रखने के लिए रोज़ क्या करना चाहिए?',
          ta: 'முதுமையிலும் நினைவாற்றலை சுறுசுறுப்பாக வைத்திருக்க தினமும் என்ன செய்ய வேண்டும்?',
          kn: 'ವಯಸ್ಸಾದಾಗಲೂ ಸ್ಮರಣಶಕ್ತಿ ಚುರುಕಾಗಿಡಲು ಪ್ರತಿದಿನ ಏನು ಮಾಡಬೇಕು?',
          bn: 'বয়স বাড়লেও স্মৃতিশক্তি সতেজ রাখতে প্রতিদিন কী করা উচিত?',
          as: 'স্মৃতিশক্তি সজীৱ কৰি ৰাখিবলৈ সদায় কি কৰা উচিত?',
          mr: 'वय वाढले तरी स्मरणशक्ती तल्लख ठेवण्यासाठी रोज काय केले पाहिजे?',
          en: 'What daily lifestyle practices keep our brain sharp, resilient, and active as we age?'
        },
        options: [
          {
            text: {
              te: 'నీరు త్రాగడం, మెదడు ఆటలు ఆడడం, ఆనందంగా మాట్లాడటం',
              hi: 'पानी पीना, दिमागी खेल खेलना और अपनों से बात करना',
              ta: 'தண்ணீர் குடிப்பது, நினைவாற்றல் விளையாட்டுகள், குடும்ப உரையாடல்',
              kn: 'ಸಾಕಷ್ಟು ನೀರು, ಸ್ಮರಣ ಆಟಗಳು ಮತ್ತು ಸಂತೋಷದ ಮಾತುಕತೆ',
              bn: 'পর্যাপ্ত জল পান, স্মৃতিচর্চা খেলা এবং প্রিয়জনের সাথে কথা',
              as: 'পানী খোৱা, মনৰ খেল খেলা আৰু কথা পতা',
              mr: 'पाणी पिणे, स्मरण खेळ खेळणे आणि कुटुंबाशी बोलणे',
              en: 'Staying hydrated, playing brain games, and staying social'
            },
            icon: '🌟',
            isCorrect: true
          },
          {
            text: {
              te: 'రోజంతా ఒంటరిగా విచారంగా కూర్చోవడం',
              hi: 'दिनभर अकेले उदास बैठना',
              ta: 'நாள் முழுவதும் தனிமையில் இருப்பது',
              kn: 'ದಿನವಿಡೀ ಒಬ್ಬಂಟಿಯಾಗಿ ಕುಳಿತುಕೊಳ್ಳುವುದು',
              bn: 'সারাদিন একা বসে থাকা',
              as: 'অকলে বহি থকা',
              mr: 'दिवसभर एकटे बसून राहणे',
              en: 'Sitting isolated and inactive all day'
            },
            icon: '😔',
            isCorrect: false
          }
        ]
      }
    ]
  }
];

export const CognitiveQAGame = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('family'); // 'family' | 'clinical'
  const [familyQuestions, setFamilyQuestions] = useState([]);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  // Clinical Mode state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Family Mode state
  const [familyQuestionIndex, setFamilyQuestionIndex] = useState(0);

  // Interactive Play states
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isLevelCleared, setIsLevelCleared] = useState(false);

  const timerRef = useRef(null);

  // Load family questions
  const reloadFamilyQuestions = () => {
    const list = familyQuestionsStorage.getQuestions();
    setFamilyQuestions(list);
  };

  useEffect(() => {
    reloadFamilyQuestions();
  }, []);

  // Compute active question based on tab
  const levelData = QA_LEVELS[currentLevel - 1] || QA_LEVELS[0];
  const activeQuestion = activeTab === 'family'
    ? (familyQuestions[familyQuestionIndex] || familyQuestions[0])
    : (levelData.questions[questionIndex] || levelData.questions[0]);

  // Timer
  useEffect(() => {
    if (!isLevelCleared) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLevelCleared]);

  // Reset states on question change
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentLevel, questionIndex, familyQuestionIndex, activeTab]);

  // Read question aloud
  const speakCurrentQuestion = () => {
    if (!activeQuestion) return;
    const qText = activeQuestion.text[lang] || activeQuestion.text.en || activeQuestion.text.te || '';
    speakText(qText, lang, () => {}, 0.85);
  };

  const handleOptionSelect = (option, idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (option.isCorrect) {
      setIsCorrect(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      playGentleTone(523.25 + (newStreak * 70), 783.99 + (newStreak * 80));

      const pointsEarned = 150 * (1 + newStreak * 0.2);
      setScore(s => s + Math.round(pointsEarned));

      if (activeTab === 'family') {
        // Next family question
        if (familyQuestionIndex + 1 < familyQuestions.length) {
          setTimeout(() => {
            setFamilyQuestionIndex(i => i + 1);
          }, 1200);
        } else {
          setTimeout(() => {
            setIsLevelCleared(true);
            playGentleTone(659.25, 1046.5);
          }, 1000);
        }
      } else {
        // Clinical mode
        if (questionIndex + 1 < levelData.questions.length) {
          setTimeout(() => {
            setQuestionIndex(i => i + 1);
          }, 1200);
        } else {
          setTimeout(() => {
            setIsLevelCleared(true);
            playGentleTone(659.25, 1046.5);
            syncManager.recordSession({
              sessionId: `qa_${Date.now()}`,
              userId: 'patient_default',
              gameType: 'cognitive_qa',
              difficultyLevel: currentLevel,
              completionTimeMs: secondsElapsed * 1000,
              score: score + 200,
              clientTimestamp: Date.now()
            });
          }, 1000);
        }
      }
    } else {
      setIsCorrect(false);
      setStreak(0);
      playGentleTone(349.23, 261.63);
      // Forgiving retry
      setTimeout(() => {
        setIsAnswered(false);
        setSelectedOption(null);
      }, 1300);
    }
  };

  const handleDeleteFamilyQ = (id) => {
    if (confirm('Are you sure you want to remove this family question?')) {
      const updated = familyQuestionsStorage.deleteQuestion(id);
      setFamilyQuestions(updated);
      if (familyQuestionIndex >= updated.length) {
        setFamilyQuestionIndex(Math.max(0, updated.length - 1));
      }
    }
  };

  const advanceNextLevel = () => {
    if (activeTab === 'family') {
      setFamilyQuestionIndex(0);
      setIsLevelCleared(false);
    } else if (currentLevel < 10) {
      setCurrentLevel(l => l + 1);
      setQuestionIndex(0);
      setIsLevelCleared(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTe = lang === 'te';

  return (
    <div
      style={{
        maxWidth: '840px',
        margin: '0 auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {/* Top Mode Toggle: Family vs Clinical */}
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setActiveTab('family');
              setIsLevelCleared(false);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '20px',
              border: activeTab === 'family' ? '3px solid #BE185D' : '2px solid #CAC4D0',
              backgroundColor: activeTab === 'family' ? '#FCE7F3' : '#FFFFFF',
              color: activeTab === 'family' ? '#9D174D' : '#1C1B1F',
              fontWeight: 800,
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: activeTab === 'family' ? '0 4px 12px rgba(190, 24, 93, 0.25)' : 'none'
            }}
          >
            <Heart size={20} color="#BE185D" />
            <span>{isTe ? `👨‍👩‍👧‍👦 కుటుంబ జ్ఞాపకాలు (${familyQuestions.length})` : `👨‍👩‍👧‍👦 Family & Home (${familyQuestions.length})`}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('clinical');
              setIsLevelCleared(false);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '20px',
              border: activeTab === 'clinical' ? '3px solid #6750A4' : '2px solid #CAC4D0',
              backgroundColor: activeTab === 'clinical' ? '#F3EDF7' : '#FFFFFF',
              color: activeTab === 'clinical' ? '#21005D' : '#1C1B1F',
              fontWeight: 800,
              fontSize: '0.98rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: activeTab === 'clinical' ? '0 4px 12px rgba(103, 80, 164, 0.25)' : 'none'
            }}
          >
            <Sparkles size={20} color="#6750A4" />
            <span>{isTe ? '🧠 క్లినికల్ ప్రశ్నలు (10 లెవెల్స్)' : '🧠 Clinical Trivia (10 Levels)'}</span>
          </button>
        </div>

        {/* Add Family Question Button */}
        <button
          onClick={() => setIsFamilyModalOpen(true)}
          style={{
            minHeight: '48px',
            padding: '10px 20px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: '#1E7E34',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(30, 126, 52, 0.35)'
          }}
        >
          <Plus size={20} color="#FFFFFF" />
          <span>{isTe ? 'కుటుంబ ప్రశ్నను జోడించండి' : 'Add Family Question'}</span>
        </button>
      </div>

      {/* Live Game HUD */}
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
            <span style={{ fontSize: '0.75rem', color: '#79747E', fontWeight: 700, display: 'block' }}>TIME</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatTime(secondsElapsed)}</span>
          </div>
        </div>

        {streak > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={22} color="#EA580C" />
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#EA580C' }}>
              {streak}x {isTe ? 'వరుస సరైన సమాధానాలు!' : 'Streak!'}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="#EAB308" />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#79747E', fontWeight: 700, display: 'block' }}>SCORE</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B45309' }}>{score}</span>
          </div>
        </div>

        <button
          onClick={speakCurrentQuestion}
          aria-label="Listen to Question"
          style={{
            padding: '6px 14px',
            borderRadius: '16px',
            border: '1.5px solid #6750A4',
            backgroundColor: '#F3EDF7',
            color: '#21005D',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Volume2 size={18} color="#6750A4" />
          <span>{isTe ? 'వినండి' : 'Listen'}</span>
        </button>
      </div>

      {/* Clinical Level Selector Bar (Only shown in clinical tab) */}
      {activeTab === 'clinical' && (
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '16px',
            display: 'flex',
            gap: '6px'
          }}
        >
          {QA_LEVELS.map((lvl) => {
            const isCurrent = currentLevel === lvl.level;
            return (
              <button
                key={lvl.level}
                onClick={() => {
                  setCurrentLevel(lvl.level);
                  setQuestionIndex(0);
                  setIsLevelCleared(false);
                }}
                style={{
                  flex: '1 0 auto',
                  minWidth: '75px',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  border: isCurrent ? '2.5px solid #6750A4' : '1.5px solid #CAC4D0',
                  backgroundColor: isCurrent ? '#6750A4' : '#FFFFFF',
                  color: isCurrent ? '#FFFFFF' : '#1C1B1F',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isCurrent ? '0 4px 12px rgba(103,80,164,0.3)' : 'none'
                }}
              >
                Lvl {lvl.level}
              </button>
            );
          })}
        </div>
      )}

      {/* Question Card */}
      {!isLevelCleared && activeQuestion ? (
        <div
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            border: activeTab === 'family' ? '3.5px solid #BE185D' : '3px solid #6750A4',
            padding: '32px 24px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Header with Relationship tag & Delete button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.8rem' }}>{activeQuestion.icon || '👨‍👩‍👧‍👦'}</span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: activeTab === 'family' ? '#FCE7F3' : '#F3EDF7',
                  color: activeTab === 'family' ? '#9D174D' : '#21005D',
                  fontSize: '0.85rem',
                  fontWeight: 800
                }}
              >
                {activeQuestion.relationship || (activeTab === 'family' ? 'Family Memory' : levelData.badge)}
              </span>
            </div>

            {activeTab === 'family' && familyQuestions.length > 1 && (
              <button
                onClick={() => handleDeleteFamilyQ(activeQuestion.id)}
                title="Remove Question"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#B3261E',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* Question Text */}
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1C1B1F',
              margin: 0,
              lineHeight: 1.4
            }}
          >
            {activeQuestion.text[lang] || activeQuestion.text.en || activeQuestion.text.te || ''}
          </h2>

          {/* Affectionate Family Hint Clue (if available) */}
          {activeQuestion.familyHint && (activeQuestion.familyHint[lang] || activeQuestion.familyHint.en || activeQuestion.familyHint.te) && (
            <div
              style={{
                backgroundColor: '#FEF3C7',
                border: '1.5px solid #F59E0B',
                borderRadius: '14px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} color="#B45309" />
              <span style={{ fontSize: '0.92rem', color: '#92400E', fontWeight: 600 }}>
                {isTe ? 'కుటుంబ క్లూ: ' : 'Loving Clue: '}
                {activeQuestion.familyHint[lang] || activeQuestion.familyHint.en || activeQuestion.familyHint.te}
              </span>
            </div>
          )}

          {/* Multiple Choice Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let bgColor = '#FFFFFF';
              let borderColor = '#CAC4D0';
              let textColor = '#1C1B1F';

              if (isAnswered && isSelected) {
                if (opt.isCorrect) {
                  bgColor = '#D1E7DD';
                  borderColor = '#1E7E34';
                  textColor = '#0F5132';
                } else {
                  bgColor = '#F8D7DA';
                  borderColor = '#B3261E';
                  textColor = '#842029';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt, idx)}
                  disabled={isAnswered}
                  style={{
                    minHeight: '64px',
                    padding: '14px 20px',
                    borderRadius: '20px',
                    border: `3px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isAnswered ? 'default' : 'pointer',
                    boxShadow: isSelected ? '0 6px 18px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                    <span style={{ fontSize: '1.18rem', fontWeight: 700, textAlign: 'left' }}>
                      {opt.text[lang] || opt.text.en || opt.text.te || ''}
                    </span>
                  </div>

                  {isAnswered && isSelected && (
                    <div>
                      {opt.isCorrect ? (
                        <CheckCircle2 size={28} color="#1E7E34" />
                      ) : (
                        <span style={{ color: '#B3261E', fontWeight: 800, fontSize: '1.2rem' }}>✕</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback pill */}
          {isAnswered && (
            <div
              style={{
                padding: '12px 18px',
                borderRadius: '16px',
                backgroundColor: isCorrect ? '#D1E7DD' : '#FEF3C7',
                border: isCorrect ? '2px solid #1E7E34' : '2px solid #F59E0B',
                color: isCorrect ? '#0F5132' : '#92400E',
                fontWeight: 800,
                textAlign: 'center',
                fontSize: '1.05rem',
                animation: 'fadeIn 0.2s ease'
              }}
            >
              {isCorrect
                ? (isTe ? '✓ చాలా అద్భుతం! సరిగ్గా గుర్తుంచుకున్నారు!' : '✓ Wonderful! You remembered correctly!')
                : (isTe ? 'మళ్లీ ప్రయత్నించండి! ఆరాముగా ఆలోచించండి.' : 'Try again! Take your time.')}
            </div>
          )}
        </div>
      ) : isLevelCleared ? (
        /* Celebration */
        <div
          role="status"
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '4px solid #1E7E34',
            borderRadius: '28px',
            padding: '36px 24px',
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

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F5132', margin: '0 0 8px 0' }}>
            {activeTab === 'family'
              ? (isTe ? 'కుటుంబ జ్ఞాపకాల రౌండ్ పూర్తయింది!' : 'Family Memories Round Cleared!')
              : (isTe ? `లెవెల్ ${currentLevel} విజయవంతంగా పూర్తయింది!` : `Level ${currentLevel} Cleared! Excellent!`)}
          </h2>

          <p style={{ fontSize: '1.1rem', color: '#49454F', margin: '0 0 24px 0', maxWidth: '480px' }}>
            {isTe
              ? 'మీ జ్ఞాపకశక్తి మరియు కుటుంబ సంబంధాల అనుబంధం అద్భుతంగా పనిచేస్తోంది!'
              : 'Your long-term orientation and familial connections are shining bright!'}
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={advanceNextLevel}
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
              <span>{activeTab === 'family' ? (isTe ? 'మళ్లీ మొదటినుంచి ఆడండి' : 'Play Family Quiz Again') : (isTe ? `తదుపరి లెవెల్ ${currentLevel + 1}` : `Advance to Level ${currentLevel + 1}`)}</span>
              <ChevronRight size={26} color="#FFFFFF" />
            </button>

            <button
              onClick={() => setIsFamilyModalOpen(true)}
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
              <Plus size={22} color="#6750A4" />
              <span>{isTe ? 'మరిన్ని కుటుంబ ప్రశ్నలను కలపండి' : 'Add Another Question'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Add Family Question Modal */}
      <AddFamilyQuestionModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        onQuestionAdded={() => {
          reloadFamilyQuestions();
          setActiveTab('family');
          setFamilyQuestionIndex(0);
          setIsLevelCleared(false);
        }}
      />
    </div>
  );
};
