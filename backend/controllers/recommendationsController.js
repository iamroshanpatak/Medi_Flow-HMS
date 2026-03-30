// backend/controllers/recommendationsController.js
// Controller for Health Recommendations
const HealthRecommendationsEngine = require('../ai/healthRecommendations');
const PredictiveHealthAnalysis = require('../ai/predictiveHealthAnalysis');
const PatientHistoryAnalyzer = require('../ai/patientHistoryAnalyzer');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const engine = new HealthRecommendationsEngine();
const predictor = new PredictiveHealthAnalysis();
const analyzer = new PatientHistoryAnalyzer();

/**
 * Generate personalized health recommendations
 */
exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { includeHistory = true } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare patient data
    const patientData = {
      age: calculateAge(user.dateOfBirth),
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      conditions: user.conditions || [],
      medications: user.medications || [],
      exerciseFrequency: user.exerciseFrequency,
      dietQuality: user.dietQuality,
      sleepHours: user.sleepHours,
      stressLevel: user.stressLevel,
      smokingStatus: user.smokingStatus,
      alcoholConsumption: user.alcoholConsumption,
      labResults: user.labResults || [],
      familyHistory: user.familyHistory || []
    };

    // Generate recommendations
    const recommendations = engine.generateRecommendations(patientData);

    // Include historical analysis if requested
    let historyInsights = null;
    if (includeHistory) {
      historyInsights = analyzer.analyzePatientHistory(patientData);
    }

    // Include predictive analysis
    const predictiveInsights = predictor.assessCardiovascularRisk(patientData);

    // Store recommendations
    const storedRecommendation = {
      userId,
      recommendations,
      predictiveInsights,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Valid for 30 days
    };

    user.recommendationHistory = user.recommendationHistory || [];
    user.recommendationHistory.push(storedRecommendation);
    if (user.recommendationHistory.length > 10) {
      user.recommendationHistory = user.recommendationHistory.slice(-10);
    }
    await user.save();

    return res.status(200).json({
      success: true,
      recommendations,
      healthScore: recommendations.score,
      riskFactors: recommendations.riskFactors,
      priority: recommendations.priority,
      historyInsights,
      predictiveInsights,
      generatedAt: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

/**
 * Get health score and health metrics
 */
exports.getHealthScore = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const patientData = {
      age: calculateAge(user.dateOfBirth),
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      conditions: user.conditions || [],
      medications: user.medications || [],
      exerciseFrequency: user.exerciseFrequency,
      dietQuality: user.dietQuality,
      sleepHours: user.sleepHours,
      stressLevel: user.stressLevel,
      smokingStatus: user.smokingStatus
    };

    const recommendations = engine.generateRecommendations(patientData);
    
    const bmi = user.weight && user.height 
      ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
      : null;

    const healthMetrics = {
      healthScore: recommendations.score,
      bmi,
      bmiCategory: getBmiCategory(bmi),
      ageGroup: getAgeGroup(patientData.age),
      chronicConditionCount: patientData.conditions.length,
      medicationCount: patientData.medications.length,
      riskLevel: getRiskLevel(recommendations.score),
      lastUpdated: new Date()
    };

    // Trending
    const previousScore = user.recommendationHistory?.[user.recommendationHistory.length - 1]?.recommendations?.score;
    if (previousScore) {
      healthMetrics.trend = recommendations.score > previousScore ? 'improving' : 'declining';
      healthMetrics.scoreChange = recommendations.score - previousScore;
    }

    return res.status(200).json({
      success: true,
      healthMetrics,
      score: recommendations.score,
      scoreOutOf100: true,
      interpretation: getScoreInterpretation(recommendations.score),
      components: {
        lifestyle: calculateLifestyleScore(patientData),
        medical: calculateMedicalScore(patientData),
        preventive: calculatePreventiveScore(user)
      }
    });
  } catch (error) {
    console.error('Error getting health score:', error);
    res.status(500).json({ error: 'Failed to get health score' });
  }
};

/**
 * Get action plan for health goals
 */
exports.getActionPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { duration = '3 months' } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const patientData = {
      age: calculateAge(user.dateOfBirth),
      weight: user.weight,
      height: user.height,
      conditions: user.conditions || [],
      exerciseFrequency: user.exerciseFrequency,
      dietQuality: user.dietQuality,
      sleepHours: user.sleepHours,
      stressLevel: user.stressLevel
    };

    const recommendations = engine.generateRecommendations(patientData);
    const actionPlan = engine.generateActionPlan(recommendations, duration);

    // Store action plan
    user.currentActionPlan = {
      plan: actionPlan,
      startDate: new Date(),
      duration,
      status: 'active'
    };
    await user.save();

    return res.status(200).json({
      success: true,
      actionPlan,
      startDate: new Date(),
      targetEndDate: calculateTargetDate(duration),
      goals: actionPlan.goals,
      milestones: actionPlan.milestones,
      resources: actionPlan.resources,
      tracking: actionPlan.tracking,
      reviewSchedule: generateReviewSchedule(duration)
    });
  } catch (error) {
    console.error('Error getting action plan:', error);
    res.status(500).json({ error: 'Failed to get action plan' });
  }
};

/**
 * Get risk assessment
 */
exports.getRiskAssessment = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const patientData = {
      dateOfBirth: user.dateOfBirth,
      weight: user.weight,
      height: user.height,
      conditions: user.conditions || [],
      medications: user.medications || [],
      bloodPressure: user.bloodPressure || [],
      glucose: user.glucose || [],
      cholesterol: user.cholesterol || [],
      exerciseFrequency: user.exerciseFrequency,
      smokingStatus: user.smokingStatus,
      familyHistory: user.familyHistory || [],
      triglycerides: user.triglycerides || []
    };

    // Assess different risk categories
    const cardiovascularRisk = predictor.assessCardiovascularRisk(patientData);
    const metabolicRisk = predictor.assessMetabolicRisk(patientData);
    const mentalHealthRisk = predictor.assessMentalHealthRisk(patientData);

    // Analyze trends
    const trends = predictor.analyzeTrends(patientData);

    return res.status(200).json({
      success: true,
      overallRiskScore: (
        (cardiovascularRisk.riskScore + metabolicRisk.score * 100 + mentalHealthRisk.score) / 3
      ).toFixed(1),
      riskAssessment: {
        cardiovascular: cardiovascularRisk,
        metabolic: metabolicRisk,
        mentalHealth: mentalHealthRisk,
        trends,
        alerts: generateRiskAlerts(cardiovascularRisk, metabolicRisk, mentalHealthRisk),
        priorities: prioritizeRisks(cardiovascularRisk, metabolicRisk, mentalHealthRisk)
      }
    });
  } catch (error) {
    console.error('Error getting risk assessment:', error);
    res.status(500).json({ error: 'Failed to get risk assessment' });
  }
};

/**
 * Get screening recommendations
 */
exports.getScreeningRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const age = calculateAge(user.dateOfBirth);
    const screenings = engine.getScreeningRecommendations(age);

    // Check which screenings have been completed
    const completedScreenings = user.screenings || [];
    const screeningStatus = screenings.map(screening => ({
      ...screening,
      completed: completedScreenings.includes(screening.name),
      dueDate: calculateDueDate(screening.frequency)
    }));

    return res.status(200).json({
      success: true,
      screenings: screeningStatus,
      age,
      completionRate: completedScreenings.length / screenings.length,
      nextScreeningDue: findNextDueScreening(screeningStatus),
      recommendations: generateScreeningPriorities(screeningStatus)
    });
  } catch (error) {
    console.error('Error getting screening recommendations:', error);
    res.status(500).json({ error: 'Failed to get screening recommendations' });
  }
};

/**
 * Get lifestyle recommendations
 */
exports.getLifestyleRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const patientData = {
      weight: user.weight,
      height: user.height,
      exerciseFrequency: user.exerciseFrequency,
      dietQuality: user.dietQuality,
      sleepHours: user.sleepHours,
      stressLevel: user.stressLevel,
      conditions: user.conditions || []
    };

    const recommendations = engine.generateRecommendations(patientData);
    const lifestyleRecommendations = engine.generateLifestyleRecommendations(patientData);

    return res.status(200).json({
      success: true,
      lifestyle: lifestyleRecommendations,
      currentStatus: {
        exerciseFrequency: patientData.exerciseFrequency,
        dietQuality: patientData.dietQuality,
        sleepHours: patientData.sleepHours,
        stressLevel: patientData.stressLevel,
        bmi: calculateBMI(patientData.weight, patientData.height)
      },
      improvements: identifyLifestyleImprovements(patientData),
      goals: generateLifestyleGoals(patientData),
      apps: recommendHealthApps(patientData.conditions)
    });
  } catch (error) {
    console.error('Error getting lifestyle recommendations:', error);
    res.status(500).json({ error: 'Failed to get lifestyle recommendations' });
  }
};

/**
 * Get personalized health insights
 */
exports.getHealthInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Analyze patient history
    const historyAnalysis = analyzer.analyzePatientHistory(user);

    // Get health score
    const recommendations = engine.generateRecommendations(user);

    const insights = {
      profile: historyAnalysis.profile,
      keyFindings: historyAnalysis.insights.slice(0, 3),
      trends: historyAnalysis.patterns.visitPatterns,
      recommendations: recommendations.immediate.slice(0, 3),
      nextActions: historyAnalysis.recommendations.immediate,
      dataQuality: historyAnalysis.qualityScore,
      lastUpdated: new Date()
    };

    return res.status(200).json({
      success: true,
      insights,
      summary: generateInsightsSummary(insights)
    });
  } catch (error) {
    console.error('Error getting health insights:', error);
    res.status(500).json({ error: 'Failed to get health insights' });
  }
};

/**
 * Update health metrics and trigger new recommendations
 */
exports.updateHealthMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const metrics = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update health metrics
    Object.assign(user, metrics);
    await user.save();

    // Generate new recommendations based on updated data
    const patientData = {
      age: calculateAge(user.dateOfBirth),
      weight: user.weight,
      height: user.height,
      conditions: user.conditions || [],
      medications: user.medications || [],
      exerciseFrequency: user.exerciseFrequency,
      dietQuality: user.dietQuality,
      sleepHours: user.sleepHours,
      stressLevel: user.stressLevel
    };

    const recommendations = engine.generateRecommendations(patientData);

    return res.status(200).json({
      success: true,
      message: 'Health metrics updated',
      newRecommendations: recommendations,
      healthScore: recommendations.score,
      metricsUpdated: Object.keys(metrics)
    });
  } catch (error) {
    console.error('Error updating health metrics:', error);
    res.status(500).json({ error: 'Failed to update health metrics' });
  }
};

// Helper functions

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

function getBmiCategory(bmi) {
  if (!bmi) return 'unknown';
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

function getAgeGroup(age) {
  if (age < 20) return '18-20';
  if (age < 30) return '20-30';
  if (age < 40) return '30-40';
  if (age < 50) return '40-50';
  if (age < 60) return '50-60';
  if (age < 70) return '60-70';
  return '70+';
}

function getRiskLevel(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'moderate';
  return 'low';
}

function getScoreInterpretation(score) {
  const level = getRiskLevel(score);
  const interpretations = {
    critical: 'Your health requires immediate attention',
    high: 'You have significant health risks to address',
    moderate: 'Your health needs some improvements',
    low: 'Your health is in good condition'
  };
  return interpretations[level];
}

function calculateLifestyleScore(data) {
  let score = 50;
  if (data.exerciseFrequency === 'daily' || data.exerciseFrequency === '5+ days/week') score += 20;
  if (data.dietQuality === 'good') score += 15;
  if (data.sleepHours >= 7 && data.sleepHours <= 9) score += 10;
  if (data.stressLevel === 'low') score += 5;
  return Math.min(100, score);
}

function calculateMedicalScore(data) {
  let score = 60;
  score -= Math.min(data.conditions.length * 10, 30);
  score -= Math.min(data.medications.length * 2, 15);
  return Math.max(0, score);
}

function calculatePreventiveScore(user) {
  let score = 50;
  if (user.screenings?.length > 0) score += 20;
  if (user.vaccinations?.length > 2) score += 20;
  if (user.labResults?.length > 2) score += 10;
  return Math.min(100, score);
}

function calculateTargetDate(duration) {
  const now = new Date();
  const months = parseInt(duration.match(/\d+/)[0]) || 3;
  return new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
}

function generateReviewSchedule(duration) {
  const schedule = [];
  const parts = parseInt(duration.match(/\d+/)[0]) || 3;
  
  for (let i = 1; i <= parts; i++) {
    schedule.push({
      week: i * 4,
      action: `Review progress on week ${i * 4}`
    });
  }
  
  return schedule;
}

function generateRiskAlerts(cardio, metabolic, mental) {
  const alerts = [];
  
  if (cardio.riskScore > 50) {
    alerts.push({
      type: 'cardiovascular',
      severity: 'high',
      message: 'Consider cardiology consultation'
    });
  }
  
  if (metabolic.hasMetabolicSyndrome) {
    alerts.push({
      type: 'metabolic',
      severity: 'high',
      message: 'Metabolic syndrome detected - lifestyle change recommended'
    });
  }
  
  if (mental.needsProfessionalHelp) {
    alerts.push({
      type: 'mental_health',
      severity: 'high',
      message: 'Consider mental health professional consultation'
    });
  }
  
  return alerts;
}

function prioritizeRisks(cardio, metabolic, mental) {
  const risks = [
    { type: 'cardiovascular', score: cardio.riskScore },
    { type: 'metabolic', score: metabolic.score * 100 },
    { type: 'mental_health', score: mental.score }
  ];
  
  return risks.sort((a, b) => b.score - a.score);
}

function calculateDueDate(frequency) {
  const now = new Date();
  const frequencies = {
    'annually': 365,
    'biennially': 730,
    'every 3 years': 1095,
    'every 5 years': 1825
  };
  
  const days = frequencies[frequency] || 365;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function findNextDueScreening(screenings) {
  return screenings
    .filter(s => !s.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
}

function generateScreeningPriorities(screenings) {
  return screenings
    .filter(s => !s.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);
}

function identifyLifestyleImprovements(data) {
  const improvements = [];
  
  if (data.exerciseFrequency === 'never' || data.exerciseFrequency === '1 time/week') {
    improvements.push('Increase physical activity to 150 minutes/week');
  }
  
  if (data.dietQuality === 'poor' || data.dietQuality === 'fair') {
    improvements.push('Improve diet quality - increase fruits, vegetables, whole grains');
  }
  
  if (data.sleepHours < 7 || data.sleepHours > 9) {
    improvements.push('Aim for 7-9 hours of quality sleep per night');
  }
  
  if (data.stressLevel === 'high') {
    improvements.push('Implement stress management techniques - meditation, yoga, or counseling');
  }
  
  return improvements;
}

function generateLifestyleGoals(data) {
  return [
    { category: 'exercise', goal: '150 min/week moderate activity', timeline: '3 months' },
    { category: 'nutrition', goal: 'Eat 5 servings of fruits/vegetables daily', timeline: '2 weeks' },
    { category: 'sleep', goal: '7-9 hours per night', timeline: 'ongoing' },
    { category: 'stress', goal: 'Daily mindfulness practice (10-15 min)', timeline: 'ongoing' }
  ];
}

function recommendHealthApps(conditions) {
  const appRecommendations = {
    'diabetes': ['MyFitnessPal', 'Glucose Buddy', 'MySugr'],
    'hypertension': ['Blood Pressure Tracker', 'Heart Healthy'],
    'asthma': ['Asthma MD', 'Peak Flow Pro'],
    'anxiety': ['Calm', 'Headspace', 'Insight Timer'],
    'obesity': ['MyFitnessPal', 'Fitbit']
  };
  
  const apps = new Set();
  conditions?.forEach(condition => {
    appRecommendations[condition]?.forEach(app => apps.add(app));
  });
  
  return Array.from(apps).slice(0, 3);
}

function generateInsightsSummary(insights) {
  let summary = `Your health profile indicates ${insights.profile.riskLevel} risk. `;
  
  if (insights.keyFindings.length > 0) {
    summary += `Key finding: ${insights.keyFindings[0].insight}. `;
  }
  
  summary += `Focus on: ${insights.nextActions.slice(0, 2).join(', ')}.`;
  
  return summary;
}

module.exports = exports;
