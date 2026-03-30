// MediFlow Nepal — Wait Time Prediction
// backend/ai/waitTimePredictor.js

// Average consultation times per department (in minutes)
// These values should be updated from real MongoDB data over time
const avgConsultTimes = {
  EMERGENCY: 20,
  CARDIOLOGY: 15,
  NEUROLOGY: 15,
  GASTROENTEROLOGY: 12,
  ORTHOPEDICS: 12,
  DERMATOLOGY: 10,
  ENT: 10,
  GENERAL_OPD: 8
};

// Peak hour multipliers — waits are longer during busy times
function getPeakMultiplier(hour) {
  if (hour >= 9 && hour <= 11) return 1.5;   // Morning rush
  if (hour >= 16 && hour <= 18) return 1.3;  // Evening rush
  if (hour >= 13 && hour <= 14) return 0.7;  // Lunch lull
  return 1.0;
}

// Day of week multiplier — Mondays are busiest in Nepal hospitals
function getDayMultiplier(dayOfWeek) {
  const multipliers = { 0: 0.6, 1: 1.4, 2: 1.2, 3: 1.1, 4: 1.0, 5: 1.3, 6: 0.7 };
  return multipliers[dayOfWeek] ?? 1.0;
}

/**
 * Predict wait time for a patient
 * @param {string} department - e.g. "GENERAL_OPD"
 * @param {number} queuePosition - patient's position in queue (1 = next)
 * @param {number} activeConsultations - doctors currently consulting
 * @param {Date} timestamp - when patient joined queue
 * @returns {{ estimatedMinutes, estimatedTime, category, message }}
 */
function predictWaitTime(department, queuePosition, activeConsultations = 1, timestamp = new Date()) {
  const avgTime = avgConsultTimes[department] ?? 10;
  const hour = timestamp.getHours();
  const day = timestamp.getDay();

  const peakMultiplier = getPeakMultiplier(hour);
  const dayMultiplier = getDayMultiplier(day);

  // Core formula: (queue position / active doctors) × avg consult × adjustments
  const baseWait = (queuePosition / Math.max(activeConsultations, 1)) * avgTime;
  const adjustedWait = Math.round(baseWait * peakMultiplier * dayMultiplier);

  // Calculate estimated appointment time
  const estimatedTime = new Date(timestamp.getTime() + adjustedWait * 60000);
  const timeString = estimatedTime.toLocaleTimeString("en-NP", { hour: "2-digit", minute: "2-digit" });

  // Category for UI display
  let category, message;
  if (adjustedWait <= 10) {
    category = "short";
    message = "Your turn is coming soon. Please stay nearby.";
  } else if (adjustedWait <= 30) {
    category = "medium";
    message = "Estimated wait is moderate. You can rest in the waiting area.";
  } else {
    category = "long";
    message = "Long wait expected. We will SMS you when your turn is near.";
  }

  return {
    estimatedMinutes: adjustedWait,
    estimatedTime: timeString,
    category,
    message,
    breakdown: {
      baseWait: Math.round(baseWait),
      peakMultiplier,
      dayMultiplier,
      avgConsultTime: avgTime
    }
  };
}

/**
 * Decide whether to send SMS notification
 * Returns true if patient should be notified now
 */
function shouldNotify(queuePosition, department, activeConsultations = 1) {
  const { estimatedMinutes } = predictWaitTime(department, queuePosition, activeConsultations);
  return estimatedMinutes <= 15; // Notify when 15 minutes away
}

module.exports = { predictWaitTime, shouldNotify, avgConsultTimes };
