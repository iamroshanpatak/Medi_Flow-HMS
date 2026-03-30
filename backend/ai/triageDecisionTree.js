// MediFlow Nepal — Triage Decision Tree Algorithm
// backend/ai/triageDecisionTree.js

const departmentRules = {
  EMERGENCY: {
    label: "Emergency",
    nepali: "आपतकालीन",
    symptoms: ["chest pain", "difficulty breathing", "unconscious", "severe bleeding", "heart attack", "stroke", "not breathing", "collapsed"],
    priority: 1,
    color: "red"
  },
  CARDIOLOGY: {
    label: "Cardiology",
    nepali: "हृदय रोग",
    symptoms: ["palpitations", "irregular heartbeat", "shortness of breath", "dizziness with chest", "heart flutter"],
    priority: 2,
    color: "orange"
  },
  NEUROLOGY: {
    label: "Neurology",
    nepali: "स्नायु रोग",
    symptoms: ["headache", "migraine", "seizure", "numbness", "memory loss", "vision problem", "dizziness", "fainting", "tremor"],
    priority: 2,
    color: "purple"
  },
  GASTROENTEROLOGY: {
    label: "Gastroenterology",
    nepali: "पेट रोग",
    symptoms: ["stomach pain", "nausea", "vomiting", "diarrhea", "constipation", "bloating", "acidity", "gastric", "abdomen pain"],
    priority: 3,
    color: "yellow"
  },
  ORTHOPEDICS: {
    label: "Orthopedics",
    nepali: "हड्डी रोग",
    symptoms: ["joint pain", "back pain", "bone pain", "fracture", "swollen knee", "muscle pain", "sprain", "knee pain", "shoulder pain"],
    priority: 3,
    color: "blue"
  },
  DERMATOLOGY: {
    label: "Dermatology",
    nepali: "छाला रोग",
    symptoms: ["rash", "itching", "skin problem", "acne", "eczema", "allergy", "hives", "skin infection", "dry skin"],
    priority: 4,
    color: "pink"
  },
  ENT: {
    label: "ENT",
    nepali: "कान, नाक, घाँटी",
    symptoms: ["ear pain", "sore throat", "nasal congestion", "hearing loss", "runny nose", "sinusitis", "tonsil", "ear infection"],
    priority: 4,
    color: "teal"
  },
  GENERAL_OPD: {
    label: "General OPD",
    nepali: "सामान्य ओपीडी",
    symptoms: ["fever", "cold", "cough", "fatigue", "weakness", "flu", "general checkup", "body ache", "chills"],
    priority: 5,
    color: "green"
  }
};

function triageDecisionTree(symptoms) {
  const normalized = symptoms.map(s => s.toLowerCase().trim());
  let bestMatch = null;
  let bestScore = 0;
  let bestMatched = [];

  for (const [key, dept] of Object.entries(departmentRules)) {
    const matched = dept.symptoms.filter(symptom =>
      normalized.some(input => input.includes(symptom) || symptom.includes(input))
    );
    const score = matched.length * (1 / dept.priority);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
      bestMatched = matched;
    }
  }

  if (!bestMatch || bestScore === 0) {
    return {
      department: "GENERAL_OPD",
      label: departmentRules.GENERAL_OPD.label,
      nepali: departmentRules.GENERAL_OPD.nepali,
      color: departmentRules.GENERAL_OPD.color,
      confidence: "low",
      matchedSymptoms: [],
      algorithm: "decision_tree"
    };
  }

  return {
    department: bestMatch,
    label: departmentRules[bestMatch].label,
    nepali: departmentRules[bestMatch].nepali,
    color: departmentRules[bestMatch].color,
    confidence: bestMatched.length >= 2 ? "high" : "medium",
    matchedSymptoms: bestMatched,
    algorithm: "decision_tree"
  };
}

module.exports = { triageDecisionTree, departmentRules };
