// MediFlow Nepal — Triage Controller
// backend/controllers/aiController.js

const { triageDecisionTree } = require("../ai/triageDecisionTree");
const { triageNaiveBayes } = require("../ai/triageNaiveBayes");
const { predictWaitTime } = require("../ai/waitTimePredictor");
const { faqChatbot } = require("../ai/faqChatbot");

// POST /api/ai/triage
const triage = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ success: false, error: "Please provide at least one symptom." });
    }

    const dtResult = triageDecisionTree(symptoms);
    const nbResult = triageNaiveBayes(symptoms);

    const agree = dtResult.department === nbResult.department;

    const finalResult = {
      department: nbResult.department,
      label: nbResult.label,
      nepali: nbResult.nepali,
      color: nbResult.color,
      confidence: agree ? "high" : nbResult.confidence,
      confidencePercent: nbResult.confidencePercent,
      agreement: agree,
      allProbabilities: nbResult.allProbabilities,
      matchedSymptoms: dtResult.matchedSymptoms,
      message: agree
        ? `Both algorithms recommend: ${nbResult.label}`
        : `Recommended: ${nbResult.label}. Please confirm with reception.`,
      decisionTree: dtResult,
      naiveBayes: nbResult
    };

    return res.status(200).json({ success: true, symptoms, result: finalResult });
  } catch (err) {
    console.error("Triage error:", err);
    return res.status(500).json({ success: false, error: "Triage service unavailable." });
  }
};

// POST /api/ai/waittime
const waitTime = async (req, res) => {
  try {
    const { department, queuePosition, activeConsultations } = req.body;

    if (!department || queuePosition == null) {
      return res.status(400).json({ success: false, error: "Department and queue position are required." });
    }

    const result = predictWaitTime(department, queuePosition, activeConsultations || 1, new Date());

    return res.status(200).json({ success: true, department, queuePosition, result });
  } catch (err) {
    console.error("Wait time error:", err);
    return res.status(500).json({ success: false, error: "Wait time service unavailable." });
  }
};

// POST /api/ai/faq
const faq = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, error: "Please provide a message." });
    }

    const result = faqChatbot(message);
    return res.status(200).json({ success: true, message, result });
  } catch (err) {
    console.error("FAQ error:", err);
    return res.status(500).json({ success: false, error: "FAQ service unavailable." });
  }
};

module.exports = { triage, waitTime, faq };
