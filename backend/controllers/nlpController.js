// backend/controllers/nlpController.js
// Controller for Advanced NLP operations
const AdvancedNLP = require('../ai/advancedNLP');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const nlp = new AdvancedNLP();

/**
 * Analyze user medical text and extract insights
 */
exports.analyzeText = async (req, res) => {
  try {
    const { text, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    // Extract medical entities
    const entities = nlp.extractMedicalEntities(text);

    // Analyze context with conversation history
    const context = nlp.analyzeContext(text, conversationHistory);

    // Generate intelligent response
    const response = nlp.generateResponse(entities, context);

    // Store interaction for learning
    await storeNLPInteraction(userId, text, entities, response);

    // Map to departments if applicable
    let departmentRecommendations = [];
    if (entities.symptoms.length > 0) {
      departmentRecommendations = nlp.mapSymptomsToDepartments(entities.symptoms.map(s => s.term));
    }

    return res.status(200).json({
      success: true,
      entities,
      context,
      response,
      departmentRecommendations,
      nextSteps: generateNextSteps(entities, response),
      confidenceScore: entities.confidence,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('NLP Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
};

/**
 * Get medical insights from conversation history
 */
exports.getConversationInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Analyze recent interactions
    const interactions = user.nlpInteractions?.filter(i => new Date(i.date) > startDate) || [];

    if (interactions.length === 0) {
      return res.status(200).json({
        success: true,
        insights: [],
        totalInteractions: 0,
        message: 'No interactions found in the specified period'
      });
    }

    // Aggregate insights
    const aggregatedSymptoms = {};
    const aggregatedIntents = {};
    let totalConfidence = 0;

    interactions.forEach(interaction => {
      // Aggregate symptoms
      interaction.entities?.symptoms?.forEach(symptom => {
        aggregatedSymptoms[symptom.term] = (aggregatedSymptoms[symptom.term] || 0) + 1;
      });

      // Aggregate intents
      if (interaction.entities?.intent) {
        aggregatedIntents[interaction.entities.intent] = (aggregatedIntents[interaction.entities.intent] || 0) + 1;
      }

      totalConfidence += interaction.entities?.confidence || 0;
    });

    const averageConfidence = totalConfidence / interactions.length;

    const insights = {
      mostCommonSymptoms: Object.entries(aggregatedSymptoms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom, count]) => ({ symptom, frequency: count })),
      commonIntents: Object.entries(aggregatedIntents)
        .sort((a, b) => b[1] - a[1])
        .map(([intent, count]) => ({ intent, frequency: count })),
      averageConfidence,
      conversationPatterns: analyzeConversationPatterns(interactions),
      recommendedDepartments: extractRecommendedDepartments(interactions),
      suggestedActions: generateSuggestedActions(interactions)
    };

    return res.status(200).json({
      success: true,
      insights,
      totalInteractions: interactions.length,
      timeframe: days
    });
  } catch (error) {
    console.error('Error getting conversation insights:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
};

/**
 * Detect urgency from patient description
 */
exports.detectUrgency = async (req, res) => {
  try {
    const { symptomDescription } = req.body;

    if (!symptomDescription) {
      return res.status(400).json({ error: 'Symptom description required' });
    }

    const urgencyLevel = nlp.detectUrgency(symptomDescription);
    const emotionalTone = nlp.detectEmotionalTone(symptomDescription);

    const recommendations = {
      critical: 'Seek emergency care immediately (Call 911)',
      high: 'Schedule urgent appointment within 24 hours',
      medium: 'Schedule appointment within 1 week',
      low: 'Schedule routine appointment'
    };

    return res.status(200).json({
      success: true,
      urgencyLevel,
      emotionalTone,
      recommendation: recommendations[urgencyLevel],
      shouldNotifyDoctor: urgencyLevel === 'critical' || urgencyLevel === 'high'
    });
  } catch (error) {
    console.error('Urgency detection error:', error);
    res.status(500).json({ error: 'Failed to detect urgency' });
  }
};

/**
 * Get suggested appointments based on NLP analysis
 */
exports.suggestAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Symptoms array required' });
    }

    // Convert symptom strings to entities for department mapping
    const symptomText = symptoms.join(' ');
    const entities = nlp.extractMedicalEntities(symptomText);
    
    // Map symptoms to departments
    const departments = nlp.mapSymptomsToDepartments(entities.symptoms);

    // Find available doctors in mapped departments (using User model with doctor role)
    const suggestedAppointments = [];

    for (const department of departments) {
      // Query doctors by department
      const doctors = await User.find({ 
        role: 'doctor', 
        department: department,
        isActive: true 
      }).limit(3);
      
      suggestedAppointments.push({
        department,
        availableDoctors: doctors.length,
        urgency: entities.severity,
        estimatedWaitTime: '2-3 days'
      });
    }

    return res.status(200).json({
      success: true,
      suggestedDepartments: departments,
      suggestions: suggestedAppointments,
      count: suggestedAppointments.length
    });
  } catch (error) {
    console.error('Error suggesting appointments:', error);
    res.status(500).json({ error: 'Failed to suggest appointments' });
  }
};

/**
 * Chat endpoint for ongoing medical conversation
 */
exports.chat = async (req, res) => {
  try {
    const { message, conversationId, userId } = req.body;
    const currentUserId = req.user.id || userId;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Get conversation history
    const user = await User.findById(currentUserId);
    let conversation = user?.conversations?.find(c => c.id === conversationId) || { messages: [] };

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Analyze message
    const entities = nlp.extractMedicalEntities(message);
    const context = nlp.analyzeContext(message, conversation.messages.slice(0, -1));
    const response = nlp.generateResponse(entities, context);

    // Add assistant response
    conversation.messages.push({
      role: 'assistant',
      content: response.message,
      metadata: {
        level: response.level,
        action: response.action,
        confidence: nlp.calculateConfidence(entities, context)
      },
      timestamp: new Date()
    });

    // Save conversation
    if (!conversationId) {
      user.conversations = user.conversations || [];
      user.conversations.push(conversation);
    }
    await user.save();

    return res.status(200).json({
      success: true,
      response: response.message,
      metadata: {
        level: response.level,
        action: response.action,
        suggestions: response.suggestions,
        departments: response.departments
      },
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat processing failed' });
  }
};

/**
 * Get FAQ responses based on query
 */
exports.getFAQResponse = async (req, res) => {
  try {
    const { query, question } = req.body;
    const searchTerm = query || question;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Query or question required' });
    }

    const clarity = nlp.measureClarity(searchTerm);
    const entities = nlp.extractMedicalEntities(searchTerm);

    const faqResponses = {
      'how to schedule appointment': 'You can schedule appointments through the Patient Dashboard under "Book Appointment". Select your preferred doctor, date, and time.',
      'how to reschedule': 'Go to My Appointments, click the appointment you want to reschedule, and select a new date/time.',
      'how to cancel appointment': 'In My Appointments, find the appointment and click Cancel. Cancellations must be made 24 hours before.',
      'emergency symptoms': 'If you experience chest pain, difficulty breathing, loss of consciousness, or severe bleeding, call emergency services immediately.',
      'medication questions': 'Consult your prescribing doctor or pharmacist for medication questions. Do not modify doses without medical advice.'
    };

    // Find matching FAQ
    let bestMatch = null;
    let highestSimilarity = 0;

    Object.entries(faqResponses).forEach(([faqQuery, answer]) => {
      const similarity = calculateSimilarity(searchTerm.toLowerCase(), faqQuery.toLowerCase());
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { query: faqQuery, answer };
      }
    });

    return res.status(200).json({
      success: true,
      response: bestMatch?.answer || 'No matching FAQ found. Please contact support.',
      confidence: highestSimilarity,
      clarityScore: clarity,
      relatedQuestions: generateRelatedQuestions(searchTerm)
    });
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ error: 'Failed to get FAQ response' });
  }
};

// Helper functions

/**
 * Store NLP interaction for analytics and learning
 */
async function storeNLPInteraction(userId, text, entities, response) {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.nlpInteractions = user.nlpInteractions || [];
      user.nlpInteractions.push({
        text,
        entities,
        response: { message: response.message, level: response.level },
        date: new Date()
      });
      if (user.nlpInteractions.length > 1000) {
        user.nlpInteractions = user.nlpInteractions.slice(-1000);
      }
      await user.save();
    }
  } catch (error) {
    console.error('Error storing NLP interaction:', error);
  }
}

/**
 * Generate next steps based on analysis
 */
function generateNextSteps(entities, response) {
  const steps = [];

  if (response.action === 'redirect_emergency') {
    steps.push('Call emergency services immediately');
  } else if (response.action === 'suggest_appointment') {
    steps.push('Book an appointment with recommended department');
    steps.push('Prepare medical history for appointment');
  } else if (response.action === 'lifestyle_advice') {
    steps.push('Follow recommended lifestyle modifications');
    steps.push('Schedule follow-up in 2 weeks');
  }

  return steps;
}

/**
 * Analyze conversation patterns
 */
function analyzeConversationPatterns(interactions) {
  const patterns = {};
  interactions.forEach(interaction => {
    const intent = interaction.entities?.intent || 'unknown';
    patterns[intent] = (patterns[intent] || 0) + 1;
  });
  return patterns;
}

/**
 * Extract recommended departments
 */
function extractRecommendedDepartments(interactions) {
  const departments = {};
  interactions.forEach(interaction => {
    interaction.entities?.symptoms?.forEach(symptom => {
      const dept = nlp.mapSymptomsToDepartments([symptom.term])?.[0];
      if (dept) {
        departments[dept] = (departments[dept] || 0) + 1;
      }
    });
  });
  return Object.entries(departments)
    .sort((a, b) => b[1] - a[1])
    .map(([dept, count]) => ({ department: dept, frequency: count }));
}

/**
 * Generate suggested actions
 */
function generateSuggestedActions(interactions) {
  const actions = [];
  const intents = {};

  interactions.forEach(interaction => {
    const intent = interaction.entities?.intent;
    if (intent) intents[intent] = (intents[intent] || 0) + 1;
  });

  if (intents['emergency']) {
    actions.push('Have emergency contact information readily available');
  }

  if (intents['symptom_inquiry'] && Object.values(intents).reduce((a, b) => a + b) > 5) {
    actions.push('Consider scheduling comprehensive health checkup');
  }

  return actions;
}

/**
 * Evaluate urgency from symptoms
 */
function evaluateUrgency(symptoms) {
  const emergencySymptoms = ['chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding'];
  const hasEmergency = symptoms.some(s => emergencySymptoms.some(e => s.toLowerCase().includes(e)));

  if (hasEmergency) return 'emergency';
  if (symptoms.length > 3) return 'high';
  return 'routine';
}

/**
 * Calculate string similarity (simple Levenshtein-like)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate edit distance between strings
 */
function getEditDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Generate related questions
 */
function generateRelatedQuestions(query) {
  const relatedQuestions = {
    'appointment': ['How do I cancel an appointment?', 'What documents should I bring?'],
    'symptoms': ['When should I see a doctor?', 'What are emergency symptoms?'],
    'medication': ['How do I refill my prescription?', 'What are side effects?'],
    'emergency': ['What is considered an emergency?', 'How do I contact emergency services?']
  };

  let relatedQuestionList = [];
  Object.entries(relatedQuestions).forEach(([keyword, questions]) => {
    if (query.toLowerCase().includes(keyword)) {
      relatedQuestionList = questions;
    }
  });

  return relatedQuestionList;
}

module.exports = exports;
