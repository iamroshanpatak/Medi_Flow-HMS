// backend/ai/healthRecommendations.js
// Health Recommendations Engine - provides personalized health suggestions
// Based on patient history, age, conditions, and lifestyle

class HealthRecommendationsEngine {
  constructor() {
    this.recommendationDatabase = {
      age: {
        '18-30': {
          focus: ['Mental health', 'Fitness', 'Preventive care'],
          risks: ['Stress', 'Poor sleep', 'Sedentary lifestyle']
        },
        '30-50': {
          focus: ['Chronic disease prevention', 'Work-life balance', 'Regular screening'],
          risks: ['Hypertension', 'Cholesterol', 'Diabetes']
        },
        '50-65': {
          focus: ['Cancer screening', 'Cardiovascular health', 'Bone health'],
          risks: ['Heart disease', 'Osteoporosis', 'Cognitive decline']
        },
        '65+': {
          focus: ['Fall prevention', 'Cognitive function', 'Medication management'],
          risks: ['Fractures', 'Dementia', 'Polypharmacy']
        }
      },

      conditions: {
        'diabetes': {
          recommendations: [
            'Monitor blood glucose regularly',
            'Follow a balanced diet low in refined sugars',
            'Exercise 150 minutes per week',
            'Check feet daily for injuries',
            'Regular eye exams and kidney tests'
          ],
          frequency: 'monthly'
        },
        'hypertension': {
          recommendations: [
            'Monitor blood pressure at home',
            'Reduce salt intake',
            'Exercise regularly',
            'Manage stress',
            'Limit alcohol consumption'
          ],
          frequency: 'weekly'
        },
        'asthma': {
          recommendations: [
            'Keep rescue inhaler accessible',
            'Avoid known triggers',
            'Use peak flow meter daily',
            'Maintain clean environment',
            'Get annual flu vaccine'
          ],
          frequency: 'daily'
        },
        'obesity': {
          recommendations: [
            'Create caloric deficit gradually',
            'Increase physical activity',
            'Improve dietary habits',
            'Track weight weekly',
            'Consider nutrition counseling'
          ],
          frequency: 'weekly'
        },
        'anxiety': {
          recommendations: [
            'Practice meditation or mindfulness',
            'Regular exercise',
            'Limit caffeine',
            'Maintain sleep schedule',
            'Consider therapy or counseling'
          ],
          frequency: 'daily'
        },
        'depression': {
          recommendations: [
            'Maintain social connections',
            'Regular physical activity',
            'Get sunlight exposure',
            'Establish routines',
            'Professional mental health support'
          ],
          frequency: 'daily'
        },
        'arthritis': {
          recommendations: [
            'Low-impact exercises (swimming, yoga)',
            'Heat/ice therapy as needed',
            'Weight management',
            'Sufficient rest',
            'Anti-inflammatory diet'
          ],
          frequency: 'daily'
        },
        'high_cholesterol': {
          recommendations: [
            'Reduce saturated fats',
            'Increase fiber intake',
            'Exercise regularly',
            'Maintain healthy weight',
            'Get cholesterol checked annually'
          ],
          frequency: 'monthly'
        }
      },

      lifestyle: {
        exercise: {
          'low': ['Start with 10-15 minute walks', 'Gradually increase to 30 minutes', 'Try yoga or stretching'],
          'moderate': ['Maintain 150 minutes/week moderate activity', 'Add resistance training', 'Mix cardio and strength'],
          'high': ['Aim for 300 minutes/week', 'Include high-intensity intervals', 'Focus on recovery']
        },
        diet: {
          'poor': [
            'Start with one healthy meal per day',
            'Replace sugary drinks with water',
            'Add one vegetable to each meal',
            'Consider nutrition education'
          ],
          'fair': [
            'Increase fruit and vegetable intake',
            'Choose whole grains',
            'Reduce processed foods',
            'Monitor portion sizes'
          ],
          'good': [
            'Maintain balanced macronutrients',
            'Focus on nutrient density',
            'Support local organic farming',
            'Meal planning and prep'
          ]
        },
        sleep: {
          'poor': [
            'Establish consistent sleep schedule',
            'Limit screen time before bed',
            'Create dark, cool sleeping environment',
            'Avoid caffeine after 2 PM',
            'Consider sleep study if needed'
          ],
          'fair': [
            'Aim for consistent 7-9 hours',
            'Maintain regular wake time',
            'Improve bedroom environment',
            'Relaxation techniques'
          ],
          'good': [
            'Maintain sleep consistency',
            'Monitor for changes',
            'Continue good sleep hygiene',
            'Support immune function'
          ]
        },
        stress: {
          'high': [
            'Daily meditation or breathing exercises',
            'Regular physical activity',
            'Time management skills',
            'Social support and counseling',
            'Hobby or relaxation activities'
          ],
          'moderate': [
            'Regular exercise',
            'Mindfulness practice',
            'Work-life balance',
            'Hobby engagement'
          ],
          'low': [
            'Maintain current practices',
            'Continue regular exercise',
            'Stay socially connected',
            'Practice preventive wellness'
          ]
        }
      },

      screenings: {
        '25-40': {
          'every 5 years': ['Blood pressure', 'Cholesterol', 'BMI'],
          'every 3 years': ['Blood glucose'],
          'as needed': ['Mental health screening']
        },
        '40-50': {
          'annually': ['Blood pressure', 'Blood glucose'],
          'every 2 years': ['cholesterol', 'Cancer screening'],
          'every 10 years': ['Colorectal cancer screening (at 45)']
        },
        '50+': {
          'annually': ['Blood pressure', 'Blood glucose', 'Cancer screening'],
          'every 1-2 years': ['Cholesterol', 'Bone density (women)'],
          'every 10 years': ['Colorectal cancer screening']
        }
      }
    };
  }

  /**
   * Generate personalized recommendations based on patient profile
   */
  generateRecommendations(patientData) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      preventive: [],
      lifestyle: [],
      screenings: [],
      priority: 'normal',
      riskFactors: [],
      score: 0 // Overall health score (0-100)
    };

    // Analyze patient data
    const age = this.calculateAge(patientData.dateOfBirth);
    const bmi = this.calculateBMI(patientData.weight, patientData.height);
    const riskScore = this.assessRiskFactors(patientData, age, bmi);

    recommendations.score = 100 - riskScore;
    recommendations.riskFactors = this.identifyRiskFactors(patientData, age, bmi);

    // Generate condition-specific recommendations
    if (patientData.conditions && patientData.conditions.length > 0) {
      patientData.conditions.forEach(condition => {
        if (this.recommendationDatabase.conditions[condition]) {
          const condRecs = this.recommendationDatabase.conditions[condition].recommendations;
          recommendations.immediate.push(...condRecs.slice(0, 2));
          recommendations.longTerm.push(...condRecs.slice(2));
        }
      });
    }

    // Generate lifestyle recommendations
    const lifestyleRecs = this.generateLifestyleRecommendations(patientData);
    recommendations.lifestyle = lifestyleRecs;

    // Generate preventive screening recommendations
    const screeningRecs = this.getScreeningRecommendations(age);
    recommendations.screenings = screeningRecs;

    // Set priority based on risk
    if (riskScore > 70) {
      recommendations.priority = 'critical';
      recommendations.immediate.unshift('Schedule comprehensive health assessment immediately');
    } else if (riskScore > 50) {
      recommendations.priority = 'high';
      recommendations.immediate.unshift('Schedule doctor appointment within 2 weeks');
    } else if (riskScore > 30) {
      recommendations.priority = 'moderate';
      recommendations.shortTerm.unshift('Schedule routine check-up within 1 month');
    }

    return recommendations;
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Calculate BMI
   */
  calculateBMI(weight, height) {
    // weight in kg, height in cm
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  /**
   * Assess overall risk factors
   */
  assessRiskFactors(data, age, bmi) {
    let riskScore = 0;

    // Age risk
    if (age > 65) riskScore += 15;
    else if (age > 50) riskScore += 10;
    else if (age > 40) riskScore += 5;

    // BMI risk
    if (bmi > 40) riskScore += 20;
    else if (bmi > 30) riskScore += 15;
    else if (bmi < 18.5) riskScore += 10;

    // Condition risk
    if (data.conditions && data.conditions.length > 0) {
      const severeConditions = ['diabetes', 'heart_disease', 'cancer', 'stroke'];
      data.conditions.forEach(condition => {
        riskScore += severeConditions.includes(condition) ? 15 : 10;
      });
    }

    // Lifestyle risk
    if (data.exerciseFrequency === 'never') riskScore += 15;
    if (data.smokingStatus === 'current') riskScore += 20;
    if (data.alcoholConsumption === 'heavy') riskScore += 15;
    if (data.sleepHours < 6 || data.sleepHours > 9) riskScore += 10;
    if (data.stressLevel === 'high') riskScore += 10;

    // Medication adherence risk
    if (data.medicationAdherence === 'poor') riskScore += 10;

    return Math.min(100, riskScore);
  }

  /**
   * Identify specific risk factors
   */
  identifyRiskFactors(data, age, bmi) {
    const factors = [];

    if (age > 65) factors.push('Advanced age');
    if (bmi > 30) factors.push('Overweight/Obesity');
    if (bmi < 18.5) factors.push('Underweight');
    if (data.smokingStatus === 'current') factors.push('Smoking');
    if (data.alcoholConsumption === 'heavy') factors.push('Heavy alcohol use');
    if (data.exerciseFrequency === 'never') factors.push('Sedentary lifestyle');
    if (data.sleepHours < 6) factors.push('Insufficient sleep');
    if (data.stressLevel === 'high') factors.push('High stress');
    if (data.familyHistory && data.familyHistory.length > 0) factors.push('Family health history');

    return factors;
  }

  /**
   * Generate lifestyle-specific recommendations
   */
  generateLifestyleRecommendations(data) {
    const recommendations = [];

    // Exercise recommendations
    const exerciseLevel = this.assessExerciseLevel(data.exerciseFrequency);
    const exerciseRecs = this.recommendationDatabase.lifestyle.exercise[exerciseLevel];
    recommendations.push({
      category: 'Exercise',
      level: exerciseLevel,
      recommendations: exerciseRecs,
      target: '150 minutes/week moderate activity'
    });

    // Diet recommendations
    const dietLevel = this.assessDietQuality(data.diet);
    const dietRecs = this.recommendationDatabase.lifestyle.diet[dietLevel];
    recommendations.push({
      category: 'Nutrition',
      level: dietLevel,
      recommendations: dietRecs,
      target: 'Balanced, nutrient-dense diet'
    });

    // Sleep recommendations
    const sleepLevel = this.assessSleepQuality(data.sleepHours);
    const sleepRecs = this.recommendationDatabase.lifestyle.sleep[sleepLevel];
    recommendations.push({
      category: 'Sleep',
      level: sleepLevel,
      recommendations: sleepRecs,
      target: '7-9 hours daily'
    });

    // Stress management
    const stressLevel = data.stressLevel || 'moderate';
    const stressRecs = this.recommendationDatabase.lifestyle.stress[stressLevel];
    recommendations.push({
      category: 'Stress Management',
      level: stressLevel,
      recommendations: stressRecs,
      target: 'Low stress levels'
    });

    return recommendations;
  }

  assessExerciseLevel(frequency) {
    const map = {
      'daily': 'high',
      '4-5 times/week': 'high',
      '2-3 times/week': 'moderate',
      '1 time/week': 'low',
      'never': 'low'
    };
    return map[frequency] || 'low';
  }

  assessDietQuality(diet) {
    if (!diet) return 'poor';
    const healthyScore = (diet.fruits || 0) + (diet.vegetables || 0) - (diet.fastFood || 0) * 2;
    if (healthyScore > 5) return 'good';
    if (healthyScore > 2) return 'fair';
    return 'poor';
  }

  assessSleepQuality(hours) {
    if (!hours) return 'poor';
    if (hours >= 7 && hours <= 9) return 'good';
    if (hours >= 6 && hours <= 10) return 'fair';
    return 'poor';
  }

  /**
   * Get recommended screenings for age group
   */
  getScreeningRecommendations(age) {
    let ageGroup;
    if (age < 25) ageGroup = '25-40';
    else if (age < 40) ageGroup = '25-40';
    else if (age < 50) ageGroup = '40-50';
    else ageGroup = '50+';

    const screenings = this.recommendationDatabase.screenings[ageGroup];
    const recs = [];

    for (const [frequency, tests] of Object.entries(screenings)) {
      recs.push({
        frequency,
        tests,
        description: `${tests.join(', ')} - ${frequency}`
      });
    }

    return recs;
  }

  /**
   * Generate wellness action plan
   */
  generateActionPlan(recommendations, duration = '3 months') {
    const actionPlan = {
      duration,
      goals: [],
      milestones: [],
      resources: [],
      tracking: {}
    };

    // Set SMART goals
    actionPlan.goals = [
      {
        goal: 'Improve exercise frequency',
        target: '150 minutes/week',
        timeline: duration,
        measurable: true
      },
      {
        goal: 'Maintain healthy diet',
        target: '5+ servings fruits/vegetables daily',
        timeline: duration,
        measurable: true
      },
      {
        goal: 'Improve sleep consistency',
        target: '7-9 hours daily',
        timeline: duration,
        measurable: true
      },
      {
        goal: 'Reduce stress levels',
        target: 'Practice mindfulness 3+ times/week',
        timeline: duration,
        measurable: true
      }
    ];

    // Set milestones
    actionPlan.milestones = [
      { week: 2, milestone: 'Establish exercise routine' },
      { week: 4, milestone: 'First progress check-in' },
      { week: 8, milestone: 'Adjust goals based on progress' },
      { week: 12, milestone: 'Final assessment and next steps' }
    ];

    // Provide resources
    actionPlan.resources = [
      { type: 'app', name: 'MyFitnessPal', purpose: 'Track diet and exercise' },
      { type: 'video', name: 'Yoga for beginners', purpose: 'Stress reduction' },
      { type: 'article', name: 'Sleep hygiene guide', purpose: 'Better sleep' }
    ];

    return actionPlan;
  }
}

module.exports = HealthRecommendationsEngine;
