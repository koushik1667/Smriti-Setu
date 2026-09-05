const test = require('node:test');
const assert = require('node:assert/strict');
const Document = require('../src/models/Document');
const Chat = require('../src/models/Chat');
const ScanHistory = require('../src/models/ScanHistory');
const User = require('../src/models/User');

test('Durable Database - Persists and Retrieves Scanned Documents', async () => {
  const testDoc = await Document.create({
    userId: 'test_user_db_1',
    documentType: 'prescription',
    title: 'Dr. Rao Clinic Prescription',
    summary: 'Antibiotic therapy for throat infection',
    doctorInfo: { doctorName: 'Dr. Rao', clinicOrHospital: 'City Health Clinic' },
    medicines: [{ medicationName: 'Augmentin 625mg', prescribedDosage: '1 tablet twice daily' }],
    drugInteractions: [],
    generalPrecautions: ['Drink plenty of warm water']
  });

  assert.ok(testDoc.id, 'Document should have an ID');
  assert.equal(testDoc.document_type, 'prescription');

  const retrieved = await Document.findById(testDoc.id);
  assert.ok(retrieved, 'Should retrieve document by ID');
  assert.equal(retrieved.title, 'Dr. Rao Clinic Prescription');

  const userDocs = await Document.findByUserId('test_user_db_1');
  assert.ok(userDocs.length >= 1, 'Should find documents for user');

  // Clean up
  await Document.delete(testDoc.id);
  const deleted = await Document.findById(testDoc.id);
  assert.equal(deleted, null, 'Document should be deleted');
});

test('Durable Database - Persists and Retrieves Chat Conversations', async () => {
  const sessionId = 'test_session_' + Date.now();
  
  await Chat.createMessage({
    userId: 'test_user_db_2',
    sessionId,
    chatType: 'voice_therapist',
    role: 'user',
    text: 'Good evening Dr. Ananya, I am feeling a bit restless.',
    language: 'en'
  });

  await Chat.createMessage({
    userId: 'test_user_db_2',
    sessionId,
    chatType: 'voice_therapist',
    role: 'assistant',
    text: 'Good evening. Take a slow, peaceful breath with me. You are completely safe.',
    language: 'en'
  });

  const history = await Chat.getSessionHistory(sessionId);
  assert.equal(history.length, 2, 'Should have 2 messages in session history');
  assert.equal(history[0].role, 'user');
  assert.equal(history[1].role, 'assistant');

  const sessions = await Chat.getRecentSessions('test_user_db_2');
  assert.ok(sessions.some(s => s.session_id === sessionId), 'Should list recent session');

  // Clean up
  await Chat.clearSession(sessionId);
  const clearedHistory = await Chat.getSessionHistory(sessionId);
  assert.equal(clearedHistory.length, 0, 'Session history should be cleared');
});

test('Durable Database - Persists Scanned Medicines Across Storage', async () => {
  const scan = await ScanHistory.create({
    userId: 'test_user_db_3',
    medicationName: 'Metformin 500mg',
    primaryUse: 'Type 2 Diabetes Mellitus',
    dosageInstructions: '1 tablet after breakfast',
    warnings: ['Take with food'],
    activeIngredients: ['Metformin Hydrochloride 500mg']
  });

  assert.ok(scan.id, 'Scan should have an ID');
  assert.equal(scan.medicationName, 'Metformin 500mg');

  const userScans = await ScanHistory.findByUserId('test_user_db_3');
  assert.ok(userScans.some(s => s.id === scan.id), 'Scan should be in user history');

  // Clean up
  await ScanHistory.deleteById(scan.id, 'test_user_db_3');
});
