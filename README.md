# PharmaVision AI - Medical Packaging Computer Vision & Pharmacology Assistant

PharmaVision AI is a high-precision computer vision web application designed to analyze medication packaging (bottles, blister packs, pill boxes, ointment tubes, and prescription labels) in real-time. It uses optical character recognition, Google Gemini Vision AI, OpenAI GPT-4o, and the NIH / NCBI Biomedical Database (PubChem & MeSH) to present interactive clinical Flash Cards and AI Pharmacist guidance.

---

## 🌟 Key Features

- **High-Precision Optical Packaging Scanner**: Captures medicine packaging images and extracts brand names, active ingredients, dosage forms, and strengths.
- **Multi-Model AI Failover Architecture**: Seamless integration of Google Gemini 3.6 Flash / 2.5 Flash, OpenAI GPT-4o / GPT-4o-mini, and deterministic optical vision fallbacks.
- **NCBI / NIH PubChem Biomedical Verification**: Enriches scanned medications with verified PubChem CID numbers, molecular formulas, molecular weights, IUPAC names, and MeSH classifications.
- **Interactive Side-by-Side Flash Cards**: Displays clinical guidance (Primary Uses, Mechanism of Action, Dosage Instructions, Safety Precautions, Side Effects, Patient Profiles, Drug Interactions) with side-by-side Next/Previous controls and progress indicators.
- **AI Pharmacist Q&A Assistant**: Instant Q&A chatbot restricted to safety and dosage questions about the patient's scanned medication.
- **Scan History**: Saves previous scans for quick access and historical review.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, CSS (Material You / HSL theme design), Lucide React icons, React Router DOM.
- **Backend**: Node.js, Express, Google Generative AI SDK (`@google/generative-ai`), OpenAI SDK (`openai`), Supabase DB & Auth, Native HTTPS NCBI Entrez Client.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm

### 2. Installation & Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)
- `PORT`: Server port (default: `5000`)
- `GEMINI_API_KEY`: Google Gemini API Key
- `OPENAI_API_KEY`: OpenAI API Key
- `NCBI_API_KEY`: NIH / NCBI Entrez API Key (optional, increases rate limit)
- `JWT_SECRET`: Secret key for authentication

### Frontend (`frontend/.env`)
- `VITE_API_URL`: API Base URL (default: `/api`)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID

---

## 📄 License

MIT License
