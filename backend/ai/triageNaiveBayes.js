// MediFlow Nepal — Naive Bayes Triage Classifier
// backend/ai/triageNaiveBayes.js
// Formula: P(Dept | Symptoms) ∝ P(Dept) × ∏ P(Symptom | Dept)

const trainingData = {
  EMERGENCY: {
    prior: 0.05,
    likelihoods: {
      "chest pain": 0.90, "difficulty breathing": 0.85, "severe bleeding": 0.80,
      "unconscious": 0.95, "stroke": 0.92, "heart attack": 0.93,
      "fever": 0.08, "headache": 0.10, "cough": 0.05, "stomach pain": 0.04
    }
  },
  CARDIOLOGY: {
    prior: 0.08,
    likelihoods: {
      "palpitations": 0.88, "irregular heartbeat": 0.90, "shortness of breath": 0.75,
      "chest pain": 0.60, "dizziness": 0.50, "heart flutter": 0.85,
      "fever": 0.05, "headache": 0.10, "cough": 0.08
    }
  },
  GENERAL_OPD: {
    prior: 0.40,
    likelihoods: {
      "fever": 0.85, "cough": 0.80, "cold": 0.75, "fatigue": 0.70,
      "headache": 0.50, "body ache": 0.65, "chills": 0.60,
      "chest pain": 0.04, "stomach pain": 0.25, "difficulty breathing": 0.08
    }
  },
  GASTROENTEROLOGY: {
    prior: 0.15,
    likelihoods: {
      "stomach pain": 0.90, "nausea": 0.85, "vomiting": 0.80,
      "diarrhea": 0.88, "bloating": 0.75, "acidity": 0.78, "gastric": 0.80,
      "fever": 0.25, "headache": 0.10, "chest pain": 0.04
    }
  },
  NEUROLOGY: {
    prior: 0.10,
    likelihoods: {
      "headache": 0.88, "migraine": 0.92, "seizure": 0.95,
      "numbness": 0.82, "dizziness": 0.72, "fainting": 0.70, "tremor": 0.85,
      "fever": 0.18, "stomach pain": 0.04, "cough": 0.04
    }
  },
  ORTHOPEDICS: {
    prior: 0.12,
    likelihoods: {
      "joint pain": 0.92, "back pain": 0.88, "bone pain": 0.90,
      "fracture": 0.95, "muscle pain": 0.78, "sprain": 0.85, "knee pain": 0.90,
      "fever": 0.08, "headache": 0.04, "cough": 0.02
    }
  },
  DERMATOLOGY: {
    prior: 0.08,
    likelihoods: {
      "rash": 0.95, "itching": 0.92, "skin problem": 0.94,
      "acne": 0.88, "eczema": 0.90, "allergy": 0.75, "hives": 0.85,
      "fever": 0.15, "headache": 0.04, "cough": 0.03
    }
  },
  ENT: {
    prior: 0.07,
    likelihoods: {
      "ear pain": 0.92, "sore throat": 0.88, "nasal congestion": 0.85,
      "hearing loss": 0.90, "runny nose": 0.80, "sinusitis": 0.88, "tonsil": 0.85,
      "fever": 0.35, "headache": 0.30, "cough": 0.40
    }
  }
};

const SMOOTHING = 0.01;

const deptLabels = {
  EMERGENCY: { label: "Emergency", nepali: "आपतकालीन", color: "red" },
  CARDIOLOGY: { label: "Cardiology", nepali: "हृदय रोग", color: "orange" },
  GENERAL_OPD: { label: "General OPD", nepali: "सामान्य ओपीडी", color: "green" },
  GASTROENTEROLOGY: { label: "Gastroenterology", nepali: "पेट रोग", color: "yellow" },
  NEUROLOGY: { label: "Neurology", nepali: "स्नायु रोग", color: "purple" },
  ORTHOPEDICS: { label: "Orthopedics", nepali: "हड्डी रोग", color: "blue" },
  DERMATOLOGY: { label: "Dermatology", nepali: "छाला रोग", color: "pink" },
  ENT: { label: "ENT", nepali: "कान, नाक, घाँटी", color: "teal" }
};

function triageNaiveBayes(symptoms) {
  const normalized = symptoms.map(s => s.toLowerCase().trim());
  const scores = {};

  for (const [dept, data] of Object.entries(trainingData)) {
    let logScore = Math.log(data.prior);
    for (const symptom of normalized) {
      const likelihood = data.likelihoods[symptom] ?? SMOOTHING;
      logScore += Math.log(likelihood);
    }
    scores[dept] = logScore;
  }

  const bestDept = Object.entries(scores).reduce(
    (best, [dept, score]) => score > best[1] ? [dept, score] : best,
    ["GENERAL_OPD", -Infinity]
  )[0];

  // Convert to relative percentages for display
  const maxScore = Math.max(...Object.values(scores));
  let total = 0;
  const expScores = {};
  for (const [dept, score] of Object.entries(scores)) {
    expScores[dept] = Math.exp(score - maxScore);
    total += expScores[dept];
  }

  const probabilities = {};
  for (const dept of Object.keys(scores)) {
    probabilities[dept] = parseFloat(((expScores[dept] / total) * 100).toFixed(1));
  }

  return {
    department: bestDept,
    label: deptLabels[bestDept].label,
    nepali: deptLabels[bestDept].nepali,
    color: deptLabels[bestDept].color,
    confidence: probabilities[bestDept] > 60 ? "high" : probabilities[bestDept] > 35 ? "medium" : "low",
    confidencePercent: probabilities[bestDept],
    allProbabilities: probabilities,
    algorithm: "naive_bayes"
  };
}

module.exports = { triageNaiveBayes, trainingData, deptLabels };
