// backend/ai/patientHistoryAnalyzer.js
// Patient History Analyzer - extracts insights from patient historical data

class PatientHistoryAnalyzer {
  constructor() {
    this.analysisCache = {};
    this.chronicConditionThresholds = {
      visits: 3, // 3+ visits for same condition
      timeframe: 90 // within 90 days
    };
  }

  /**
   * Comprehensive patient history analysis
   */
  analyzePatientHistory(patientData) {
    const analysis = {
      profile: this.buildPatientProfile(patientData),
      medicalHistory: this.analyzeMedicalHistory(patientData),
      patterns: this.identifyPatterns(patientData),
      insights: this.generateInsights(patientData),
      recommendations: this.generateHistoryBasedRecommendations(patientData),
      timeline: this.buildTimelineView(patientData),
      riskProfile: this.assessFromHistory(patientData),
      qualityScore: this.calculateDataQualityScore(patientData)
    };

    return analysis;
  }

  /**
   * Build comprehensive patient profile
   */
  buildPatientProfile(patientData) {
    return {
      demographics: {
        age: this.calculateAge(patientData.dateOfBirth),
        gender: patientData.gender,
        bmi: patientData.weight && patientData.height 
          ? this.calculateBMI(patientData.weight, patientData.height)
          : null
      },
      chronicity: this.assessChronicity(patientData),
      activityLevel: this.assessActivityLevel(patientData),
      riskLevel: this.categorizeRiskLevel(patientData),
      adherence: this.assessMedicationAdherence(patientData),
      engagementLevel: this.assessPatientEngagement(patientData)
    };
  }

  /**
   * Analyze entire medical history
   */
  analyzeMedicalHistory(patientData) {
    return {
      conditions: this.summarizeConditions(patientData.conditions),
      medications: this.summarizeMedications(patientData.medications),
      allergies: patientData.allergies || [],
      surgeries: patientData.surgeries || [],
      familyHistory: patientData.familyHistory || [],
      vaccinations: patientData.vaccinations || [],
      previousHospitalizations: this.countHospitalizations(patientData),
      emergencyVisits: this.countEmergencyVisits(patientData),
      totalVisits: this.countTotalVisits(patientData)
    };
  }

  /**
   * Identify patterns in patient data
   */
  identifyPatterns(patientData) {
    const patterns = {
      seasonalPatterns: this.detectSeasonalPatterns(patientData),
      symptomClusters: this.detectSymptomClusters(patientData),
      medicationPatterns: this.analyzeMedicationPatterns(patientData),
      visitPatterns: this.analyzeVisitPatterns(patientData),
      labValuePatterns: this.analyzeLabValuePatterns(patientData),
      behavioralPatterns: this.identifyBehavioralPatterns(patientData)
    };

    return patterns;
  }

  /**
   * Generate key insights from history
   */
  generateInsights(patientData) {
    const insights = [];

    // Check for chronic disease progression
    const chronicProgression = this.checkChronicProgression(patientData);
    if (chronicProgression) {
      insights.push({
        category: 'condition_progression',
        insight: `${chronicProgression.condition} showing progression`,
        severity: 'moderate',
        actionable: true
      });
    }

    // Check for medication adherence issues
    if (this.hasAdherenceIssues(patientData)) {
      insights.push({
        category: 'medication_adherence',
        insight: 'Patient may have medication adherence challenges',
        severity: 'moderate',
        actionable: true
      });
    }

    // Check for frequent visitors pattern
    const visitFrequency = this.assessVisitFrequency(patientData);
    if (visitFrequency === 'high') {
      insights.push({
        category: 'high_utilization',
        insight: 'High healthcare utilization detected',
        severity: 'low',
        actionable: true
      });
    }

    // Check for disease complications
    const complications = this.detectComplications(patientData);
    if (complications.length > 0) {
      insights.push({
        category: 'complications',
        insight: `Potential complications detected: ${complications.join(', ')}`,
        severity: 'high',
        actionable: true
      });
    }

    // Check for preventive care gaps
    const gaps = this.identifyPreventiveGaps(patientData);
    if (gaps.length > 0) {
      insights.push({
        category: 'preventive_care',
        insight: `Preventive care gaps: ${gaps.join(', ')}`,
        severity: 'low',
        actionable: true
      });
    }

    return insights;
  }

  /**
   * Generate history-based recommendations
   */
  generateHistoryBasedRecommendations(patientData) {
    const recommendations = {
      immediate: [],
      followUp: [],
      preventive: [],
      lifestyle: [],
      monitoring: []
    };

    // Based on chronic conditions
    if (patientData.conditions?.includes('diabetes')) {
      recommendations.monitoring.push('Quarterly HbA1c testing');
      recommendations.preventive.push('Annual eye exams and foot checks');
    }

    if (patientData.conditions?.includes('hypertension')) {
      recommendations.monitoring.push('Monthly home blood pressure checks');
      recommendations.lifestyle.push('Reduce sodium intake and increase exercise');
    }

    if (patientData.conditions?.includes('asthma')) {
      recommendations.immediate.push('Ensure rescue inhaler available');
      recommendations.monitoring.push('Track peak flow readings');
    }

    // Based on visit frequency
    if (this.assessVisitFrequency(patientData) === 'high') {
      recommendations.immediate.push('Consider care coordination or case management');
    }

    // Based on medication complexity
    if (patientData.medications?.length > 5) {
      recommendations.immediate.push('Consider medication review with pharmacist');
      recommendations.monitoring.push('Monitor for drug interactions');
    }

    return recommendations;
  }

  /**
   * Build timeline view of patient history
   */
  buildTimelineView(patientData) {
    const timeline = [];

    // Add conditions
    if (patientData.conditions) {
      patientData.conditions.forEach(condition => {
        timeline.push({
          type: 'condition',
          event: condition,
          date: 'ongoing',
          severity: this.getConditionSeverity(condition)
        });
      });
    }

    // Add recent visits
    if (patientData.visits) {
      const recentVisits = patientData.visits.slice(-10);
      recentVisits.forEach(visit => {
        timeline.push({
          type: 'visit',
          event: `Visit - ${visit.reason || 'General'}`,
          date: visit.date,
          department: visit.department
        });
      });
    }

    // Sort by date
    timeline.sort((a, b) => {
      if (a.date === 'ongoing') return -1;
      if (b.date === 'ongoing') return 1;
      return new Date(b.date) - new Date(a.date);
    });

    return timeline;
  }

  /**
   * Assess risk profile from history
   */
  assessFromHistory(patientData) {
    return {
      chronicDiseaseScore: this.calculateChronicDiseaseScore(patientData),
      complicationRisk: this.assessComplicationRisk(patientData),
      healthcareUtilization: this.assessHealthcareUtilization(patientData),
      preventiveCareStatus: this.assessPreventiveCareStatus(patientData)
    };
  }

  /**
   * Detect seasonal patterns in healthcare utilization
   */
  detectSeasonalPatterns(patientData) {
    if (!patientData.visits || patientData.visits.length < 12) {
      return { detected: false, pattern: null };
    }

    const monthCounts = {};
    patientData.visits.forEach(visit => {
      const month = new Date(visit.date).getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const avgVisits = Object.values(monthCounts).reduce((a, b) => a + b) / 12;
    const variation = Math.max(...Object.values(monthCounts)) - Math.min(...Object.values(monthCounts));

    if (variation > avgVisits * 0.5) {
      return {
        detected: true,
        pattern: 'Seasonal variation detected in healthcare utilization'
      };
    }

    return { detected: false, pattern: null };
  }

  /**
   * Detect symptom clusters
   */
  detectSymptomClusters(patientData) {
    if (!patientData.symptoms) return [];

    const clusters = {};
    patientData.symptoms.forEach(symptom => {
      const category = this.categorizeSymptom(symptom);
      clusters[category] = (clusters[category] || []).concat(symptom);
    });

    return Object.entries(clusters)
      .filter(([_, symptoms]) => symptoms.length > 1)
      .map(([category, symptoms]) => ({
        category,
        symptoms,
        suggestedDepartment: this.mapSymptomsToDepartment(symptoms)
      }));
  }

  /**
   * Analyze medication patterns
   */
  analyzeMedicationPatterns(patientData) {
    if (!patientData.medications) return {};

    return {
      totalMedications: patientData.medications.length,
      categories: this.categorizeMedications(patientData.medications),
      potentialInteractions: this.checkMedicationInteractions(patientData.medications),
      adherencePattern: 'Good adherence expected'
    };
  }

  /**
   * Analyze visit patterns
   */
  analyzeVisitPatterns(patientData) {
    if (!patientData.visits || patientData.visits.length === 0) {
      return {
        totalVisits: 0,
        periodVisits: [],
        averageInterval: null,
        pattern: 'no_data'
      };
    }

    const visits = patientData.visits.sort((a, b) => new Date(a.date) - new Date(b.date));
    const intervals = [];

    for (let i = 1; i < visits.length; i++) {
      const interval = (new Date(visits[i].date) - new Date(visits[i - 1].date)) / (1000 * 60 * 60 * 24);
      intervals.push(interval);
    }

    const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b) / intervals.length : null;

    return {
      totalVisits: visits.length,
      averageInterval: avgInterval ? Math.round(avgInterval) : null,
      frequency: this.categorizeVisitFrequency(avgInterval),
      lastVisit: visits[visits.length - 1].date,
      trend: this.analyzeVisitTrend(visits)
    };
  }

  /**
   * Analyze lab value patterns
   */
  analyzeLabValuePatterns(patientData) {
    const patterns = {};

    if (patientData.labResults) {
      const testTypes = new Set();
      patientData.labResults.forEach(lab => testTypes.add(lab.testType));

      testTypes.forEach(testType => {
        const results = patientData.labResults.filter(l => l.testType === testType);
        patterns[testType] = {
          count: results.length,
          latest: results[results.length - 1].value,
          trend: this.analyzeTrendInLabValues(results)
        };
      });
    }

    return patterns;
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
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  /**
   * Assess chronicity level
   */
  assessChronicity(patientData) {
    const chronicConditionCount = patientData.conditions?.filter(c => 
      ['diabetes', 'hypertension', 'asthma', 'arthritis', 'copd', 'heart_disease'].includes(c)
    ).length || 0;

    if (chronicConditionCount >= 3) return 'high';
    if (chronicConditionCount >= 1) return 'moderate';
    return 'low';
  }

  /**
   * Assess activity level
   */
  assessActivityLevel(patientData) {
    if (!patientData.exerciseFrequency) return 'unknown';
    if (patientData.exerciseFrequency === 'daily' || patientData.exerciseFrequency === '5+ days/week') {
      return 'high';
    }
    if (patientData.exerciseFrequency === '3-4 days/week' || patientData.exerciseFrequency === '1-2 days/week') {
      return 'moderate';
    }
    return 'low';
  }

  /**
   * Categorize risk level
   */
  categorizeRiskLevel(patientData) {
    let riskScore = 0;

    // Chronic disease score
    const chronicScore = this.calculateChronicDiseaseScore(patientData);
    riskScore += chronicScore;

    // Age risk
    const age = this.calculateAge(patientData.dateOfBirth);
    if (age > 75) riskScore += 25;
    else if (age > 65) riskScore += 15;

    // Medication complexity
    if (patientData.medications?.length > 10) riskScore += 15;
    else if (patientData.medications?.length > 5) riskScore += 8;

    if (riskScore > 50) return 'high';
    if (riskScore > 25) return 'moderate';
    return 'low';
  }

  /**
   * Assess medication adherence
   */
  assessMedicationAdherence(patientData) {
    if (!patientData.medications) return 'unknown';

    // If patient has many conditions but few medications, may indicate adherence issues
    const conditionMedicationRatio = (patientData.conditions?.length || 0) / (patientData.medications.length || 1);
    
    if (conditionMedicationRatio > 2) return 'poor';
    if (conditionMedicationRatio > 1.5) return 'fair';
    return 'good';
  }

  /**
   * Assess patient engagement level
   */
  assessPatientEngagement(patientData) {
    let score = 0;

    // Regular visits
    if (patientData.visits?.length > 3) score += 25;

    // Completes screenings
    if (patientData.labResults?.length > 2) score += 25;

    // Preventive care
    if (patientData.vaccinations?.length > 0) score += 25;

    // Updates to profile
    if (patientData.lastUpdated && new Date() - new Date(patientData.lastUpdated) < 90 * 24 * 60 * 60 * 1000) {
      score += 25;
    }

    if (score >= 75) return 'high';
    if (score >= 50) return 'moderate';
    return 'low';
  }

  /**
   * Summarize conditions
   */
  summarizeConditions(conditions) {
    if (!conditions) return [];
    return conditions.map(c => ({
      name: c,
      severity: this.getConditionSeverity(c),
      status: 'active'
    }));
  }

  /**
   * Summarize medications
   */
  summarizeMedications(medications) {
    if (!medications) return [];
    return medications.map(m => ({
      name: m.name || m,
      category: this.categorizeMedication(m.name || m),
      frequency: m.frequency || 'unknown'
    }));
  }

  /**
   * Count hospitalizations
   */
  countHospitalizations(patientData) {
    return patientData.visits?.filter(v => v.type === 'hospitalization').length || 0;
  }

  /**
   * Count emergency visits
   */
  countEmergencyVisits(patientData) {
    return patientData.visits?.filter(v => v.type === 'emergency').length || 0;
  }

  /**
   * Count total visits
   */
  countTotalVisits(patientData) {
    return patientData.visits?.length || 0;
  }

  /**
   * Check chronic disease progression
   */
  checkChronicProgression(patientData) {
    // Detect if any chronic condition is worsening
    if (patientData.conditions?.includes('diabetes') && patientData.glucose) {
      const recentGlucose = patientData.glucose.slice(-3).map(g => g.value);
      const avgRecent = recentGlucose.reduce((a, b) => a + b) / recentGlucose.length;
      if (avgRecent > 180) {
        return { condition: 'Diabetes', trend: 'worsening' };
      }
    }

    return null;
  }

  /**
   * Check for adherence issues
   */
  hasAdherenceIssues(patientData) {
    if (!patientData.medications || patientData.medications.length === 0) return false;
    
    // If has chronic conditions but medications too few, likely adherence issue
    const ratio = (patientData.conditions?.length || 0) / patientData.medications.length;
    return ratio > 2;
  }

  /**
   * Assess visit frequency
   */
  assessVisitFrequency(patientData) {
    const visitCount = patientData.visits?.length || 0;
    const yearInMs = 365.25 * 24 * 60 * 60 * 1000;
    const timeSpan = new Date() - new Date(patientData.createdAt || new Date());
    const yearsActive = timeSpan / yearInMs;

    const visitRate = visitCount / Math.max(yearsActive, 1);

    if (visitRate > 6) return 'high';
    if (visitRate > 2) return 'moderate';
    return 'low';
  }

  /**
   * Detect complications
   */
  detectComplications(patientData) {
    const complications = [];

    // Diabetes complications
    if (patientData.conditions?.includes('diabetes')) {
      if (patientData.conditions?.includes('nephropathy')) complications.push('Diabetic nephropathy');
      if (patientData.conditions?.includes('neuropathy')) complications.push('Diabetic neuropathy');
      if (patientData.conditions?.includes('retinopathy')) complications.push('Diabetic retinopathy');
    }

    // Hypertension complications
    if (patientData.conditions?.includes('hypertension')) {
      if (patientData.conditions?.includes('chronic_kidney_disease')) complications.push('Hypertensive kidney disease');
    }

    return complications;
  }

  /**
   * Identify preventive care gaps
   */
  identifyPreventiveGaps(patientData) {
    const gaps = [];
    const age = this.calculateAge(patientData.dateOfBirth);

    if (age >= 50 && !patientData.screenings?.includes('colorectal')) {
      gaps.push('Colorectal cancer screening');
    }

    if (age >= 40 && patientData.gender === 'female' && !patientData.screenings?.includes('mammogram')) {
      gaps.push('Mammogram screening');
    }

    if (age >= 65 && !patientData.vaccinations?.includes('pneumococcal')) {
      gaps.push('Pneumococcal vaccination');
    }

    return gaps;
  }

  /**
   * Calculate chronic disease score
   */
  calculateChronicDiseaseScore(patientData) {
    const chronicConditions = patientData.conditions?.filter(c => 
      ['diabetes', 'hypertension', 'asthma', 'arthritis', 'copd', 'heart_disease', 'kidney_disease'].includes(c)
    ) || [];

    return Math.min(100, chronicConditions.length * 15);
  }

  /**
   * Assess complication risk
   */
  assessComplicationRisk(patientData) {
    let risk = 0;

    if (patientData.conditions?.includes('diabetes')) risk += 20;
    if (patientData.conditions?.includes('hypertension')) risk += 15;
    if (patientData.conditions?.includes('smoking')) risk += 25;

    return Math.min(100, risk);
  }

  /**
   * Assess healthcare utilization
   */
  assessHealthcareUtilization(patientData) {
    const visitCount = patientData.visits?.length || 0;
    const hospitalizationCount = this.countHospitalizations(patientData);
    const emergencyCount = this.countEmergencyVisits(patientData);

    return {
      visitCount,
      hospitalizationCount,
      emergencyCount,
      utilizationScore: (visitCount * 1 + hospitalizationCount * 5 + emergencyCount * 3)
    };
  }

  /**
   * Assess preventive care status
   */
  assessPreventiveCareStatus(patientData) {
    const screeningsCompleted = patientData.screenings?.length || 0;
    const vaccinationsCompleted = patientData.vaccinations?.length || 0;
    const labTestsCompleted = patientData.labResults?.length || 0;

    return {
      screeningsCompleted,
      vaccinationsCompleted,
      labTestsCompleted,
      status: (screeningsCompleted + vaccinationsCompleted + labTestsCompleted) > 5 ? 'good' : 'needs_improvement'
    };
  }

  /**
   * Get condition severity
   */
  getConditionSeverity(condition) {
    const severityMap = {
      'diabetes': 'chronic',
      'hypertension': 'chronic',
      'heart_disease': 'serious',
      'cancer': 'serious',
      'asthma': 'chronic',
      'copd': 'serious',
      'kidney_disease': 'serious'
    };

    return severityMap[condition] || 'moderate';
  }

  /**
   * Categorize symptom
   */
  categorizeSymptom(symptom) {
    const categories = {
      'fever': 'systemic',
      'cough': 'respiratory',
      'chest_pain': 'cardiovascular',
      'headache': 'neurological',
      'joint_pain': 'musculoskeletal'
    };

    return categories[symptom] || 'general';
  }

  /**
   * Map symptoms to department
   */
  mapSymptomsToDepartment(symptoms) {
    const departmentMap = {
      'respiratory': 'Pulmonology',
      'cardiovascular': 'Cardiology',
      'neurological': 'Neurology',
      'musculoskeletal': 'Orthopedics'
    };

    return departmentMap[symbols?.[0]] || 'General Medicine';
  }

  /**
   * Categorize medications
   */
  categorizeMedications(medications) {
    const categories = {};
    medications?.forEach(med => {
      const category = this.categorizeMedication(med.name || med);
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  /**
   * Categorize individual medication
   */
  categorizeMedication(medName) {
    if (medName.includes('statin') || medName.includes('losartan') || medName.includes('metoprolol')) {
      return 'cardiovascular';
    }
    if (medName.includes('metformin') || medName.includes('insulin')) {
      return 'endocrine';
    }
    if (medName.includes('albuterol') || medName.includes('fluticasone')) {
      return 'respiratory';
    }
    return 'other';
  }

  /**
   * Check medication interactions
   */
  checkMedicationInteractions(medications) {
    // Simplified interaction checker
    const interactions = [];
    const medNames = medications.map(m => m.name?.toLowerCase() || m.toLowerCase());

    // Common interactions
    if (medNames.some(m => m.includes('warfarin')) && medNames.some(m => m.includes('aspirin'))) {
      interactions.push('Warfarin-Aspirin interaction');
    }

    if (medNames.some(m => m.includes('metformin')) && medNames.some(m => m.includes('contrast'))) {
      interactions.push('Metformin-Contrast interaction');
    }

    return interactions;
  }

  /**
   * Analyze visit trend
   */
  analyzeVisitTrend(visits) {
    if (visits.length < 3) return 'insufficient_data';

    const recent = visits.slice(-3).length;
    const older = visits.slice(-6, -3).length;

    if (recent > older) return 'increasing';
    if (recent < older) return 'decreasing';
    return 'stable';
  }

  /**
   * Analyze trend in lab values
   */
  analyzeTrendInLabValues(results) {
    if (results.length < 2) return 'insufficient_data';

    const recent = results.slice(-2).map(r => r.value);
    if (recent[1] > recent[0]) return 'increasing';
    if (recent[1] < recent[0]) return 'decreasing';
    return 'stable';
  }

  /**
   * Identify behavioral patterns
   */
  identifyBehavioralPatterns(patientData) {
    return {
      missedAppointments: patientData.missedAppointments || 0,
      adherence: this.assessMedicationAdherence(patientData),
      engagement: this.assessPatientEngagement(patientData)
    };
  }

  /**
   * Calculate data quality score
   */
  calculateDataQualityScore(patientData) {
    let score = 0;
    const maxScore = 100;

    // Check completeness
    if (patientData.weight && patientData.height) score += 20;
    if (patientData.conditions && patientData.conditions.length > 0) score += 15;
    if (patientData.medications && patientData.medications.length > 0) score += 15;
    if (patientData.visits && patientData.visits.length > 0) score += 20;
    if (patientData.labResults && patientData.labResults.length > 0) score += 15;
    if (patientData.allergies && patientData.allergies.length > 0) score += 15;

    return Math.min(maxScore, score);
  }

  /**
   * Categorize visit frequency
   */
  categorizeVisitFrequency(avgInterval) {
    if (avgInterval === null) return 'no_visits';
    if (avgInterval < 30) return 'frequent';
    if (avgInterval < 90) return 'regular';
    return 'infrequent';
  }
}

module.exports = PatientHistoryAnalyzer;
