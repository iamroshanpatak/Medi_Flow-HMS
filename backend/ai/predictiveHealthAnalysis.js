// backend/ai/predictiveHealthAnalysis.js
// Predictive Health Analysis - forecasts health trends and risks
// Uses statistical models and pattern analysis

class PredictiveHealthAnalysis {
  constructor() {
    this.trendAnalysis = {};
    this.riskModels = {
      cardiovascular: this.buildCardiovascularRiskModel(),
      metabolic: this.buildMetabolicRiskModel(),
      respiratory: this.buildRespiratoryRiskModel(),
      mental: this.buildMentalHealthRiskModel()
    };
  }

  /**
   * Analyze patient health trends over time
   */
  analyzeTrends(patientHistory) {
    const trends = {
      weightTrend: null,
      bloodPressureTrend: null,
      bloodGlucoseTrend: null,
      exerciseTrend: null,
      predictions: {},
      confidence: 0,
      alerts: []
    };

    // Analyze weight trend
    if (patientHistory.weight && patientHistory.weight.length > 2) {
      trends.weightTrend = this.calculateTrend(patientHistory.weight.map(w => w.value));
      if (trends.weightTrend === 'increasing' && this.isRapid(patientHistory.weight)) {
        trends.alerts.push('Rapid weight gain detected');
      }
    }

    // Analyze blood pressure trend
    if (patientHistory.bloodPressure && patientHistory.bloodPressure.length > 2) {
      trends.bloodPressureTrend = this.calculateTrend(
        patientHistory.bloodPressure.map(bp => (bp.systolic + bp.diastolic) / 2)
      );
      if (trends.bloodPressureTrend === 'increasing') {
        trends.alerts.push('Blood pressure trending upward');
      }
    }

    // Analyze blood glucose trend
    if (patientHistory.glucose && patientHistory.glucose.length > 2) {
      trends.bloodGlucoseTrend = this.calculateTrend(patientHistory.glucose.map(g => g.value));
      if (trends.bloodGlucoseTrend === 'increasing') {
        trends.alerts.push('Blood glucose showing upward trend');
      }
    }

    // Predict future values
    if (patientHistory.weight && patientHistory.weight.length >= 3) {
      const weights = patientHistory.weight.map(w => w.value);
      trends.predictions.weight = this.predictFutureValue(weights, 3); // 3 months
    }

    trends.confidence = this.calculateTrendConfidence(patientHistory);

    return trends;
  }

  /**
   * Calculate trend direction (increasing, decreasing, stable)
   */
  calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';

    const recent = values.slice(-3);
    const older = values.slice(-6, -3);

    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b) / older.length : recent[0];

    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (Math.abs(percentChange) < 5) return 'stable';
    return percentChange > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Check if trend is rapid/unusual
   */
  isRapid(measurements) {
    if (measurements.length < 2) return false;
    const recent = measurements.slice(-2);
    const change = Math.abs(recent[1].value - recent[0].value);
    return change > 2; // More than 2 kg in one measurement period
  }

  /**
   * Predict future value using linear regression
   */
  predictFutureValue(values, periodAhead) {
    if (values.length < 2) return null;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = values;

    // Calculate linear regression
    const xMean = x.reduce((a, b) => a + b) / n;
    const yMean = y.reduce((a, b) => a + b) / n;

    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

    if (denominator === 0) return { value: y[n - 1], confidence: 0.3 };

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    const predictedValue = slope * (n + periodAhead) + intercept;
    const confidence = this.calculateRegressionConfidence(y, x);

    return {
      value: Math.round(predictedValue * 10) / 10,
      confidence,
      timeframe: `${periodAhead} periods ahead`
    };
  }

  /**
   * Assess risk for cardiovascular disease
   */
  assessCardiovascularRisk(patientData) {
    const riskFactors = this.riskModels.cardiovascular;
    let riskScore = 0;

    // Age factor
    const age = this.calculateAge(patientData.dateOfBirth);
    riskScore += age > 55 ? 10 : age > 45 ? 5 : 0;

    // Hypertension
    if (patientData.conditions?.includes('hypertension')) {
      riskScore += 15;
    } else if (patientData.bloodPressure && patientData.bloodPressure.length > 0) {
      const latestBP = patientData.bloodPressure[patientData.bloodPressure.length - 1];
      if (latestBP && latestBP.systolic && latestBP.diastolic) {
        if (latestBP.systolic > 140 || latestBP.diastolic > 90) {
          riskScore += 10;
        }
      }
    }

    // Cholesterol
    if (patientData.conditions?.includes('high_cholesterol')) {
      riskScore += 12;
    } else if (patientData.cholesterol && patientData.cholesterol.length > 0) {
      const latest = patientData.cholesterol[patientData.cholesterol.length - 1];
      if (latest > 240) riskScore += 8;
      if (latest > 200) riskScore += 4;
    }

    // Diabetes
    if (patientData.conditions?.includes('diabetes')) {
      riskScore += 8;
    }

    // Smoking
    if (patientData.smokingStatus === 'current') {
      riskScore += 15;
    } else if (patientData.smokingStatus === 'former') {
      riskScore += 5;
    }

    // Physical activity
    if (patientData.exerciseFrequency === 'never') {
      riskScore += 10;
    } else if (patientData.exerciseFrequency === '1 time/week') {
      riskScore += 5;
    }

    // BMI
    const bmi = this.calculateBMI(patientData.weight, patientData.height);
    if (bmi > 30) riskScore += 8;

    return {
      riskScore: Math.min(100, riskScore),
      category: this.getRiskCategory(riskScore),
      recommendations: this.getCardiovascularRecommendations(riskScore)
    };
  }

  /**
   * Assess risk for metabolic syndrome
   */
  assessMetabolicRisk(patientData) {
    let riskFactors = 0;

    const bmi = this.calculateBMI(patientData.weight, patientData.height);
    if (bmi > 30) riskFactors++;

    // Blood pressure
    if (patientData.bloodPressure && patientData.bloodPressure.length > 0) {
      const latest = patientData.bloodPressure[patientData.bloodPressure.length - 1];
      if (latest && latest.systolic && latest.diastolic) {
        if (latest.systolic > 130 || latest.diastolic > 85) {
          riskFactors++;
        }
      }
    }

    // Glucose
    if (patientData.glucose && patientData.glucose.length > 0) {
      const latest = patientData.glucose[patientData.glucose.length - 1];
      if (latest && latest.value && latest.value > 110) riskFactors++;
    }

    // Triglycerides (if available)
    if (patientData.triglycerides && patientData.triglycerides.length > 0) {
      const latest = patientData.triglycerides[patientData.triglycerides.length - 1];
      if (latest > 150) riskFactors++;
    }

    // Family history
    if (patientData.familyHistory?.some(h => ['diabetes', 'obesity'].includes(h))) {
      riskFactors++;
    }

    const hasMetabolicSyndrome = riskFactors >= 3;

    return {
      riskFactors,
      hasMetabolicSyndrome,
      score: (riskFactors / 5) * 100,
      category: hasMetabolicSyndrome ? 'high' : 'moderate',
      components: this.identifyMetabolicComponents(patientData)
    };
  }

  /**
   * Analyze depression and mental health risk
   */
  assessMentalHealthRisk(patientData) {
    const riskIndicators = {
      symptoms: patientData.mentalHealthSymptoms || [],
      score: 0,
      recommendations: []
    };

    // Screen for depression symptoms
    const depressionSymptoms = [
      'persistent sadness',
      'loss of interest',
      'sleep disturbance',
      'fatigue',
      'worthlessness',
      'difficulty concentrating',
      'thoughts of death'
    ];

    depressionSymptoms.forEach(symptom => {
      if (riskIndicators.symptoms.includes(symptom)) {
        riskIndicators.score += 15;
      }
    });

    // Lifestyle factors
    if (patientData.socialIsolation) riskIndicators.score += 10;
    if (patientData.stressLevel === 'high') riskIndicators.score += 15;
    if (patientData.substanceUse) riskIndicators.score += 20;

    riskIndicators.category = this.getRiskCategory(riskIndicators.score);
    riskIndicators.needsProfessionalHelp = riskIndicators.score > 50;

    return riskIndicators;
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
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  /**
   * Get risk category
   */
  getRiskCategory(score) {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'moderate';
    if (score >= 10) return 'borderline';
    return 'low';
  }

  /**
   * Identify metabolic syndrome components
   */
  identifyMetabolicComponents(data) {
    const components = [];
    const bmi = this.calculateBMI(data.weight, data.height);
    
    if (bmi > 30) components.push('Central obesity');
    if (data.bloodPressure && data.bloodPressure.length > 0) {
      const latest = data.bloodPressure[data.bloodPressure.length - 1];
      if (latest && latest.systolic && latest.systolic > 130) components.push('Elevated blood pressure');
    }
    if (data.glucose && data.glucose.length > 0) {
      const latest = data.glucose[data.glucose.length - 1];
      if (latest && latest.value && latest.value > 110) components.push('Elevated glucose');
    }
    if (data.triglycerides && data.triglycerides.length > 0) {
      const latest = data.triglycerides[data.triglycerides.length - 1];
      if (latest > 150) components.push('Elevated triglycerides');
    }

    return components;
  }

  /**
   * Get cardiovascular risk recommendations
   */
  getCardiovascularRecommendations(score) {
    const category = this.getRiskCategory(score);
    const recommendations = {
      critical: [
        'Immediate cardiology referral',
        'Consider stress testing',
        'Aggressive lifestyle modification',
        'Medication optimization'
      ],
      high: [
        'Schedule cardiology consultation within 1 month',
        'Monitor blood pressure and cholesterol',
        'Increase physical activity',
        'Dietary modifications'
      ],
      moderate: [
        'Annual cardiovascular screening',
        'Maintain healthy lifestyle',
        'Regular exercise',
        'Monitor risk factors'
      ],
      low: [
        'Continue healthy lifestyle',
        'Regular check-ups',
        'Maintain exercise routine'
      ]
    };

    return recommendations[category] || [];
  }

  /**
   * Calculate confidence level for predictions
   */
  calculateTrendConfidence(patientHistory) {
    let confidence = 0.5; // Base confidence

    const dataAge = patientHistory.weight?.length || patientHistory.bloodPressure?.length || 0;
    
    if (dataAge >= 6) confidence += 0.3;
    else if (dataAge >= 3) confidence += 0.15;

    // Check data consistency
    const consistencyScore = this.checkDataConsistency(patientHistory);
    confidence += consistencyScore * 0.2;

    return Math.min(1, confidence);
  }

  /**
   * Check data consistency (less noise = higher consistency)
   */
  checkDataConsistency(data) {
    if (!data.weight || data.weight.length < 2) return 0.5;

    const values = data.weight.map(w => w.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Coefficient of variation

    return Math.max(0, 1 - cv);
  }

  /**
   * Build cardiovascular risk model
   */
  buildCardiovascularRiskModel() {
    return {
      name: 'Framingham Risk Score',
      factors: ['age', 'cholesterol', 'hdl', 'blood_pressure', 'smoking', 'diabetes']
    };
  }

  /**
   * Build metabolic syndrome risk model
   */
  buildMetabolicRiskModel() {
    return {
      name: 'Metabolic Syndrome Criteria',
      factors: ['obesity', 'blood_pressure', 'glucose', 'triglycerides', 'hdl']
    };
  }

  /**
   * Build respiratory risk model
   */
  buildRespiratoryRiskModel() {
    return {
      name: 'Respiratory Health Risk',
      factors: ['smoking', 'exposure', 'family_history', 'lung_function']
    };
  }

  /**
   * Build mental health risk model
   */
  buildMentalHealthRiskModel() {
    return {
      name: 'Mental Health Screening',
      factors: ['depression_symptoms', 'anxiety', 'stress', 'social_support']
    };
  }

  /**
   * Calculate regression confidence
   */
  calculateRegressionConfidence(y, x) {
    const n = y.length;
    const xMean = x.reduce((a, b) => a + b) / n;
    const yMean = y.reduce((a, b) => a + b) / n;

    const residuals = y.map((val, i) => {
      const predicted = (val - yMean) * (x[i] - xMean) / ((x[i] - xMean) ** 2 || 1);
      return val - predicted;
    });

    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / n;
    const rmse = Math.sqrt(mse);
    const meanY = yMean || 1;
    const mape = (rmse / meanY) * 100;

    return Math.max(0, Math.min(1, 1 - (mape / 100)));
  }
}

module.exports = PredictiveHealthAnalysis;
