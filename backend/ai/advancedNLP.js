// backend/ai/advancedNLP.js
// Advanced Natural Language Processing for medical context
// Handles semantic analysis, intent recognition, and medical terminology

class AdvancedNLP {
  constructor() {
    // Medical terminology database
    this.medicalTerms = {
      symptoms: {
        cardiovascular: ['chest pain', 'shortness of breath', 'palpitations', 'dizziness', 'fainting'],
        respiratory: ['cough', 'wheezing', 'congestion', 'asthma', 'breathlessness', 'pneumonia'],
        digestive: ['nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal pain', 'acid reflux'],
        neurological: ['headache', 'migraine', 'dizziness', 'numbness', 'tingling', 'seizure'],
        musculoskeletal: ['back pain', 'joint pain', 'arthritis', 'fracture', 'sprain'],
        dermatological: ['rash', 'eczema', 'psoriasis', 'acne', 'hives', 'skin irritation'],
        infectious: ['fever', 'flu', 'cold', 'infection', 'cough', 'sore throat'],
        endocrine: ['diabetes', 'thyroid', 'fatigue', 'weight gain', 'weight loss'],
      },
      
      conditions: {
        acute: ['sudden', 'sudden onset', 'recently', 'today', 'yesterday'],
        chronic: ['for months', 'for years', 'long-standing', 'chronic', 'ongoing'],
        severity: {
          mild: ['slight', 'minor', 'little', 'barely', 'barely noticeable'],
          moderate: ['some', 'fairly', 'quite', 'moderate'],
          severe: ['severe', 'worst', 'unbearable', 'extreme', 'excruciating'],
        }
      },

      medications: {
        common: ['aspirin', 'ibuprofen', 'acetaminophen', 'paracetamol', 'metformin', 'lisinopril', 'atorvastatin'],
        allergies: ['penicillin', 'sulfa', 'cephalosporin', 'nsaid', 'antibiotic']
      }
    };

    // Intent patterns for chatbot
    this.intentPatterns = {
      symptom_inquiry: [/what (should i|can i) do|how to|treat|manage/i, /symptoms? of/i, /do i have/i],
      health_history: [/my history|past medical|previously|before/i, /had/i],
      medication_question: [/medication|medicine|drug|prescription/i, /take|dosage|dose/i],
      emergency: [/emergency|urgent|hospital|911|call ambulance/i, /severe|worst/i],
      appointment: [/appointment|schedule|book|visit|doctor/i],
      lifestyle: [/exercise|diet|sleep|stress|lifestyle/i],
      allergy: [/allergy|allergic|intolerant/i]
    };

    // Response templates
    this.responseTemplates = {
      symptom_relief: "Based on your symptoms, here are some general recommendations:",
      doctor_needed: "These symptoms require medical attention. Please schedule an appointment with a doctor.",
      emergency_care: "This requires immediate medical attention. Please visit the emergency room or call 911.",
      medication_info: "Regarding your medication:",
      lifestyle_suggestion: "Here are some lifestyle modifications that may help:"
    };
  }

  /**
   * Extract medical entities from user input
   * Returns: { symptoms, conditions, medications, severity, intent }
   */
  extractMedicalEntities(text) {
    const normalized = text.toLowerCase().trim();
    
    const result = {
      symptoms: [],
      conditions: [],
      medications: [],
      severity: 'moderate',
      intent: null,
      keywords: [],
      confidence: 0
    };

    // Extract symptoms
    for (const [category, symptomList] of Object.entries(this.medicalTerms.symptoms)) {
      for (const symptom of symptomList) {
        if (normalized.includes(symptom)) {
          result.symptoms.push({ term: symptom, category });
        }
      }
    }

    // Extract condition (acute/chronic)
    const acuteTerms = this.medicalTerms.conditions.acute;
    const chronicTerms = this.medicalTerms.conditions.chronic;
    
    result.isAcute = acuteTerms.some(term => normalized.includes(term));
    result.isChronic = chronicTerms.some(term => normalized.includes(term));

    // Extract severity
    for (const [level, terms] of Object.entries(this.medicalTerms.conditions.severity)) {
      if (terms.some(term => normalized.includes(term))) {
        result.severity = level;
        break;
      }
    }

    // Extract medications
    for (const med of this.medicalTerms.medications.common) {
      if (normalized.includes(med)) {
        result.medications.push(med);
      }
    }

    // Detect intent
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some(pattern => pattern.test(normalized))) {
        result.intent = intent;
        break;
      }
    }

    // Calculate confidence
    const entityCount = result.symptoms.length + result.medications.length + (result.intent ? 1 : 0);
    result.confidence = Math.min(entityCount / 3, 1);

    return result;
  }

  /**
   * Analyze conversation context and history
   */
  analyzeContext(currentMessage, conversationHistory = []) {
    const context = {
      focus: null,
      followUp: false,
      emotionalTone: this.detectEmotionalTone(currentMessage),
      urgency: this.detectUrgency(currentMessage),
      clarity: this.measureClarity(currentMessage)
    };

    // Detect if it's a follow-up question
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      context.followUp = this.isFollowUp(currentMessage, lastMessage);
    }

    return context;
  }

  /**
   * Detect emotional tone (worried, calm, urgent, etc.)
   */
  detectEmotionalTone(text) {
    const normalized = text.toLowerCase();
    
    const tones = {
      worried: ['worried', 'anxious', 'concerned', 'scared', 'afraid', 'panic'],
      calm: ['feeling fine', 'ok', 'alright', 'minor', 'just checking'],
      urgent: ['emergency', 'urgent', 'severe', 'worst', 'unbearable', 'can\'t'],
      frustrated: ['tired of', 'frustrated', 'annoyed', 'sick of'],
      desperate: ['help', 'please', 'struggling', 'can\'t take it']
    };

    for (const [tone, keywords] of Object.entries(tones)) {
      if (keywords.some(kw => normalized.includes(kw))) {
        return tone;
      }
    }

    return 'neutral';
  }

  /**
   * Detect urgency level
   */
  detectUrgency(text) {
    const normalized = text.toLowerCase();
    const urgencyKeywords = {
      critical: ['emergency', 'can\'t breathe', 'chest pain', 'unconscious', 'bleeding'],
      high: ['severe', 'worst', 'unbearable', 'can\'t function'],
      medium: ['bothering', 'affecting work', 'uncomfortable'],
      low: ['minor', 'slight', 'just wondering']
    };

    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      if (keywords.some(kw => normalized.includes(kw))) {
        return level;
      }
    }

    return 'low';
  }

  /**
   * Measure clarity of user message (0-1)
   */
  measureClarity(text) {
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]/).length;
    const hasSpecifics = /\d+/.test(text); // Has numbers (duration, severity, etc.)
    
    let clarity = 0.5; // Base clarity
    
    if (wordCount < 3) clarity -= 0.3; // Too short
    if (wordCount > 100) clarity -= 0.2; // Too long
    if (hasSpecifics) clarity += 0.2; // Good: includes specifics
    if (sentenceCount > 1) clarity += 0.1; // Good: multiple sentences
    
    return Math.max(0, Math.min(1, clarity));
  }

  /**
   * Check if message is a follow-up
   */
  isFollowUp(currentMessage, lastMessage) {
    const followUpIndicators = [/and\s+(also|what|how)/i, /what about/i, /any other/i, /besides/i, /also/i];
    const pronouns = /\b(it|that|this|those|these|it\'s)\b/i;
    
    return followUpIndicators.some(indicator => indicator.test(currentMessage)) ||
           (pronouns.test(currentMessage) && lastMessage);
  }

  /**
   * Generate intelligent response based on analysis
   */
  generateResponse(entities, context) {
    let response = '';

    // Check urgency first
    if (context.urgency === 'critical') {
      return {
        message: "⚠️ URGENT: Your symptoms suggest you need immediate medical attention. Please visit the nearest emergency room or call emergency services immediately.",
        level: 'emergency',
        action: 'redirect_emergency'
      };
    }

    // Handle different intents
    switch (entities.intent) {
      case 'symptom_inquiry':
        response = this.generateSymptomResponse(entities, context);
        break;
      case 'emergency':
        response = this.generateEmergencyResponse(entities);
        break;
      case 'medication_question':
        response = this.generateMedicationResponse(entities);
        break;
      case 'lifestyle':
        response = this.generateLifestyleResponse(entities);
        break;
      default:
        response = this.generateGeneralResponse(entities, context);
    }

    return response;
  }

  generateSymptomResponse(entities, context) {
    const symptomsText = entities.symptoms.map(s => s.term).join(', ');
    const recommendations = [];

    if (entities.symptoms.length === 0) {
      return {
        message: "I understand you have health concerns. Could you describe your symptoms in more detail? For example, where does it hurt, when did it start, and how severe is it?",
        level: 'info'
      };
    }

    // Get department recommendations
    const departments = this.mapSymptomsToDepartments(entities.symptoms);

    recommendations.push(`Based on your symptoms (${symptomsText}), you may need to see a specialist in: ${departments.join(', ')}`);

    if (entities.severity === 'severe') {
      recommendations.push("Given the severity of your symptoms, I recommend scheduling an appointment as soon as possible.");
    }

    recommendations.push("In the meantime, try to rest and stay hydrated. If symptoms worsen, seek immediate medical attention.");

    return {
      message: recommendations.join('\n\n'),
      symptoms: entities.symptoms,
      departments,
      level: 'medical',
      action: 'suggest_appointment'
    };
  }

  generateEmergencyResponse(entities) {
    return {
      message: "⚠️ Based on your symptoms, this requires immediate professional evaluation. Please visit the emergency department or call emergency services.",
      level: 'emergency',
      action: 'redirect_emergency'
    };
  }

  generateMedicationResponse(entities) {
    const meds = entities.medications.length > 0 
      ? entities.medications.join(', ')
      : 'your medications';

    return {
      message: `Regarding ${meds}: Please consult with your doctor or pharmacist for specific information about dosage, side effects, and interactions. Never adjust medication without medical supervision.`,
      level: 'caution',
      medications: entities.medications
    };
  }

  generateLifestyleResponse(entities) {
    return {
      message: "Healthy lifestyle choices can significantly improve your wellbeing:\n\n" +
               "• Exercise: 30 minutes moderate activity, 5 days/week\n" +
               "• Diet: Balanced nutrition with fruits, vegetables, whole grains\n" +
               "• Sleep: 7-9 hours per night\n" +
               "• Stress: Meditation, yoga, or deep breathing exercises\n\n" +
               "Discuss personalized recommendations with your doctor.",
      level: 'advice'
    };
  }

  generateGeneralResponse(entities, context) {
    return {
      message: "I'm here to help with health-related questions. You can ask about symptoms, medications, lifestyle changes, or health conditions. How can I assist you today?",
      level: 'info'
    };
  }

  /**
   * Map symptoms to medical departments
   */
  mapSymptomsToDepartments(symptoms) {
    const departmentMap = new Map();

    symptoms.forEach(symptom => {
      const mapping = {
        'cardiovascular': 'Cardiology',
        'respiratory': 'Pulmonology',
        'digestive': 'Gastroenterology',
        'neurological': 'Neurology',
        'musculoskeletal': 'Orthopedics',
        'dermatological': 'Dermatology',
        'infectious': 'Internal Medicine',
        'endocrine': 'Endocrinology'
      };
      
      const dept = mapping[symptom.category];
      if (dept) {
        departmentMap.set(dept, true);
      }
    });

    return Array.from(departmentMap.keys());
  }

  /**
   * Calculate response confidence (0-1)
   */
  calculateConfidence(entities, context) {
    let confidence = 0.5;

    // Increase confidence based on entity extraction
    if (entities.symptoms.length > 0) confidence += 0.2;
    if (entities.intent) confidence += 0.15;
    if (context.clarity > 0.7) confidence += 0.15;

    // Decrease confidence for ambiguous cases
    if (context.clarity < 0.5) confidence -= 0.1;
    if (entities.symptoms.length === 0 && !entities.intent) confidence = 0.3;

    return Math.min(1, Math.max(0, confidence));
  }
}

module.exports = AdvancedNLP;
