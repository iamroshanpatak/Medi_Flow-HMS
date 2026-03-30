// MediFlow Nepal — FAQ Chatbot (Rule-based)
// backend/ai/faqChatbot.js

const faqs = [
  {
    keywords: ["opd", "open", "time", "hours", "when", "schedule"],
    answer: "OPD is open Sunday to Friday, 8:00 AM to 5:00 PM. Emergency services are available 24/7."
  },
  {
    keywords: ["document", "bring", "need", "required", "id", "paper"],
    answer: "Please bring: (1) Citizenship card or valid ID, (2) Previous medical reports if any, (3) Referral letter if referred from another hospital."
  },
  {
    keywords: ["appointment", "book", "how", "schedule", "register"],
    answer: "You can book an appointment directly from the Patient Portal. Select your preferred department, doctor, and time slot."
  },
  {
    keywords: ["cancel", "reschedule", "change", "postpone"],
    answer: "You can cancel or reschedule your appointment from the Patient Portal up to 2 hours before the appointment time."
  },
  {
    keywords: ["fee", "cost", "price", "charge", "payment", "how much"],
    answer: "OPD registration fee is NPR 200. Doctor consultation fees vary by department (NPR 300–800). Emergency services may have different charges."
  },
  {
    keywords: ["queue", "token", "number", "waiting", "position", "turn"],
    answer: "Your token number and queue position are shown on your Patient Dashboard. You will also receive an SMS notification when your turn is near."
  },
  {
    keywords: ["department", "which", "where", "go", "specialist"],
    answer: "Use our AI Triage feature to find the right department based on your symptoms. Go to 'Start Triage' on the home screen."
  },
  {
    keywords: ["parking", "location", "address", "find", "directions"],
    answer: "The hospital is located in Kathmandu. Parking is available at the main entrance. Please check the hospital's official website for exact directions."
  },
  {
    keywords: ["emergency", "urgent", "serious", "critical"],
    answer: "For emergencies, go directly to the Emergency ward or call our emergency number. Do not wait in the regular OPD queue."
  },
  {
    keywords: ["report", "result", "lab", "test", "prescription"],
    answer: "Lab reports and prescriptions are available from the hospital records counter after your consultation. Bring your token number and ID."
  }
];

function faqChatbot(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  const words = msg.split(/\s+/);

  let bestMatch = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const score = faq.keywords.filter(keyword => words.some(w => w.includes(keyword) || keyword.includes(w))).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (!bestMatch || bestScore === 0) {
    return {
      answer: "I'm sorry, I couldn't find a specific answer to your question. Please visit the hospital reception desk or call our helpline for assistance.",
      matched: false,
      confidence: "none"
    };
  }

  return {
    answer: bestMatch.answer,
    matched: true,
    confidence: bestScore >= 2 ? "high" : "medium"
  };
}

module.exports = { faqChatbot, faqs };
