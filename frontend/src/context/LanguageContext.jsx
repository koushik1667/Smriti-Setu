import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: 'PharmaVision AI',
    tagline: 'AI Medicine Scanner',
    home: 'Home',
    scanner: 'Scanner',
    history: 'History',
    profile: 'Profile',
    logout: 'Logout',
    signIn: 'Sign in',
    signUp: 'Sign up',
    register: 'Register',
    email: 'Email Address',
    password: 'Password',
    fullName: 'Full Name',
    alreadyAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    positionMedicine: 'Position Medicine Label Here',
    captureAnalyze: 'Capture & Analyze Medicine',
    uploadFile: 'Upload File',
    switchCam: 'Switch Cam',
    retakeScan: 'Retake / Scan Another',
    analyzing: 'Analyzing Medicine Packaging with AI Vision...',
    analyzingDesc: 'Reading optical text, active ingredients, dosage markings, and safety details',
    flashcards: 'Flashcards',
    singleColumn: 'Single Column',
    showAllCards: 'Show All Cards',
    carouselView: 'Flashcard Carousel',
    previousCard: 'Previous Card',
    nextCard: 'Next Card',
    cardXofY: 'Card {x} of {y}',
    aiPharmacist: 'AI Pharmacist Q&A Assistant',
    askPharmacist: 'Ask about this medicine...',
    askBtn: 'Ask',
    disclaimer: '* Disclaimer: PharmaVision AI is an assistive visual intelligence tool. Always verify medication details with a qualified healthcare professional or pharmacist.',
    welcomeBack: 'Welcome Back',
    dashboardSubtitle: 'Your AI Medical Packaging Intelligence Hub',
    recentScans: 'Recent Medicine Scans',
    viewAll: 'View All',
    noScansYet: 'No medicine scans yet. Click Scanner to analyze your first medication packaging!',
    savedScans: 'Saved Scans',
    matchConfidence: 'Match Confidence',
    primaryUse: 'Primary Use & Indication',
    activeIngredients: 'Active Ingredients',
    dosageInstructions: 'Dosage Instructions',
    warnings: 'Critical Warnings & Precautions',
    sideEffects: 'Possible Side Effects',
    ncbiRecord: 'NCBI / NIH PubChem Record',
    selectLanguage: 'Language'
  },
  hi: {
    appName: 'फार्माविज़न एआई',
    tagline: 'एआई दवा स्कैनर',
    home: 'होम',
    scanner: 'स्कैनर',
    history: 'इतिहास',
    profile: 'प्रोफाइल',
    logout: 'लॉगआउट',
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
    register: 'पंजीकरण करें',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    alreadyAccount: 'क्या आपके पास पहले से एक खाता मौजूद है?',
    noAccount: 'खाता नहीं है?',
    positionMedicine: 'दवा के लेबल को यहाँ रखें',
    captureAnalyze: 'कैप्चर करें और विश्लेषण करें',
    uploadFile: 'फ़ाइल अपलोड करें',
    switchCam: 'कैमरा बदलें',
    retakeScan: 'पुनः स्कैन करें',
    analyzing: 'एआई विज़न द्वारा दवा पैकेजिंग का विश्लेषण किया जा रहा है...',
    analyzingDesc: 'ऑप्टिकल टेक्स्ट, सक्रिय सामग्री, खुराक और सुरक्षा विवरण पढ़ा जा रहा है',
    flashcards: 'फ़्लैशकार्ड',
    singleColumn: 'एकल कॉलम',
    showAllCards: 'सभी कार्ड दिखाएं',
    carouselView: 'फ़्लैशकार्ड हिंडोला',
    previousCard: 'पिछला कार्ड',
    nextCard: 'अगला कार्ड',
    cardXofY: 'कार्ड {x} का {y}',
    aiPharmacist: 'एआई फार्मासिस्ट प्रश्नोत्तर सहायक',
    askPharmacist: 'इस दवा के बारे में पूछें...',
    askBtn: 'पूछें',
    disclaimer: '* अस्वीकरण: फार्माविज़न एआई एक सहायक दृश्य बुद्धिमत्ता उपकरण है। हमेशा एक योग्य स्वास्थ्य देखभाल पेशेवर या फार्मासिस्ट से दवा विवरण की पुष्टि करें।',
    welcomeBack: 'वापसी पर स्वागत है',
    dashboardSubtitle: 'आपका एआई मेडिकल पैकेजिंग इंटेलिजेंस हब',
    recentScans: 'हाल की दवा स्कैन',
    viewAll: 'सभी देखें',
    noScansYet: 'अभी तक कोई दवा स्कैन नहीं हुई है। अपनी पहली दवा पैकेजिंग का विश्लेषण करने के लिए स्कैनर पर क्लिक करें!',
    savedScans: 'सहेजे गए स्कैन',
    matchConfidence: 'मैच आत्मविश्वास',
    primaryUse: 'प्राथमिक उपयोग और संकेत',
    activeIngredients: 'सक्रिय सामग्रियां',
    dosageInstructions: 'खुराक के निर्देश',
    warnings: 'गंभीर चेतावनियां और सावधानियां',
    sideEffects: 'संभावित दुष्प्रभाव',
    ncbiRecord: 'एनसीबीआई / एनआईएच पबकेम रिकॉर्ड',
    selectLanguage: 'भाषा'
  },
  te: {
    appName: 'ఫార్మావిజన్ AI',
    tagline: 'AI మందుల స్కానర్',
    home: 'హోమ్',
    scanner: 'స్కానర్',
    history: 'చరిత్ర',
    profile: 'ప్రొఫైల్',
    logout: 'లాగ్ అవుట్',
    signIn: 'సైన్ ఇన్',
    signUp: 'సైన్ అప్',
    register: 'రిజిస్టర్',
    email: 'ఈమెయిల్ చిరునామా',
    password: 'పాస్‌వర్డ్',
    fullName: 'పూర్తి పేరు',
    alreadyAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    noAccount: 'ఖాతా లేదా?',
    positionMedicine: 'మందుల లేబుల్‌ను ఇక్కడ ఉంచండి',
    captureAnalyze: 'క్యాప్చర్ & విశ్లేషించండి',
    uploadFile: 'ఫైల్ అప్‌లోడ్ చేయండి',
    switchCam: 'కెమెరా మార్చండి',
    retakeScan: 'మళ్లీ స్కాన్ చేయండి',
    analyzing: 'AI విజన్‌తో మందుల ప్యాకేజింగ్ విశ్లేషించబడుతోంది...',
    analyzingDesc: 'టెక్స్ట్, క్రియాశీల పదార్థాలు, మోతాదు గుర్తులు మరియు రక్షణ వివరాలను చదువుతోంది',
    flashcards: 'ఫ్లాష్ కార్డ్‌లు',
    singleColumn: 'సింగిల్ కాలమ్',
    showAllCards: 'అన్ని కార్డ్‌లు చూపించు',
    carouselView: 'ఫ్లాష్ కార్డ్ కరౌసెల్',
    previousCard: 'మునుపటి కార్డ్',
    nextCard: 'తదుపరి కార్డ్',
    cardXofY: 'కార్డ్ {x} / {y}',
    aiPharmacist: 'AI ఫార్మాసిస్ట్ Q&A సహాయకుడు',
    askPharmacist: 'ఈ మందుల గురించి అడగండి...',
    askBtn: 'అడగండి',
    disclaimer: '* గమనిక: ఫార్మావిజన్ AI ఒక సహాయక దృశ్య మేధస్సు సాధనం. ఎల్లప్పుడూ అర్హత కలిగిన ఆరోగ్య సంరక్షణ నిపుణులు లేదా ఫార్మాసిస్ట్‌తో మందుల వివరాలను సరిచూసుకోండి.',
    welcomeBack: 'స్వాగతం',
    dashboardSubtitle: 'మీ AI మెడికల్ ప్యాకేజింగ్ ఇంటెలిజెన్స్ హబ్',
    recentScans: 'ఇటీవలి మందుల స్కాన్లు',
    viewAll: 'అన్నీ చూడండి',
    noScansYet: 'ఇంకా మందుల స్కాన్‌లు లేవు. మీ మొదటి మందుల ప్యాకేజింగ్‌ను విశ్లేషించడానికి స్కానర్‌పై క్లిక్ చేయండి!',
    savedScans: 'సేవ్ చేసిన స్కాన్‌లు',
    matchConfidence: 'మ్యాచింగ్ పర్సంటేజ్',
    primaryUse: 'ప్రధాన ఉపయోగాలు',
    activeIngredients: 'క్రియాశీల పదార్థాలు',
    dosageInstructions: 'మోతాదు సూచనలు',
    warnings: 'ముఖ్యమైన హెచ్చరికలు',
    sideEffects: 'దుష్ప్రభావాలు',
    ncbiRecord: 'NCBI / NIH పబ్‌కెమ్ రికార్డ్',
    selectLanguage: 'భాష'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('pharmavision_lang') || 'en';
  });

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('pharmavision_lang', newLang);
    }
  };

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations['en']?.[key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
