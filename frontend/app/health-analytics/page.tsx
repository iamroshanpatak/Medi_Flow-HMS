// frontend/app/health-analytics/page.tsx
'use client';

import React from 'react';
import HealthAnalytics from '@/components/health/HealthAnalytics';
import RiskFactorDisplay from '@/components/health/RiskFactorDisplay';

export default function HealthAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Analytics & Risk Assessment</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive analysis of your health trends, patterns, and risk factors
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Analytics */}
        <div className="mb-8">
          <HealthAnalytics />
        </div>

        {/* Risk Factor Display */}
        <div className="mb-8">
          <RiskFactorDisplay />
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use These Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold text-gray-800 mb-2">Track Trends</h3>
              <p className="text-sm text-gray-600">
                Monitor your health metrics over time to identify patterns and improvements. Regular tracking helps detect early warning signs.
              </p>
            </div>

            <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="font-bold text-gray-800 mb-2">Identify Risks</h3>
              <p className="text-sm text-gray-600">
                Understand your health risks and take preventive action. Early intervention can significantly improve outcomes.
              </p>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl mb-3">💪</div>
              <h3 className="font-bold text-gray-800 mb-2">Take Action</h3>
              <p className="text-sm text-gray-600">
                Use these insights to make informed decisions about your health and lifestyle. Create actionable goals for improvement.
              </p>
            </div>
          </div>
        </div>

        {/* Data Interpretation Guide */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Understanding Your Analytics</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">✅ Green Indicators</h4>
              <p className="text-sm text-gray-600">These are positive health metrics. Continue your current habits and lifestyle.</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">⚡ Yellow Indicators</h4>
              <p className="text-sm text-gray-600">These metrics need attention. Consider making gradual lifestyle changes.</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">🚨 Red Indicators</h4>
              <p className="text-sm text-gray-600">These require immediate action. Consult with your healthcare provider.</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold mb-2">📋 Review Your Data</h3>
              <p className="text-blue-100 text-sm">
                Take time to understand your health metrics and how they compare to your goals.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">🎯 Create Goals</h3>
              <p className="text-blue-100 text-sm">
                Set specific, measurable health goals based on the insights provided.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">⚕️ Consult Doctor</h3>
              <p className="text-blue-100 text-sm">
                Schedule an appointment to discuss your analytics with a healthcare provider.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">📊 Monitor Progress</h3>
              <p className="text-blue-100 text-sm">
                Regularly update your metrics and track progress towards your health goals.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Download Report
            </button>
            <button className="border-2 border-white text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Share with Doctor
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white mt-8 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">How often should I check my analytics?</h4>
              <p className="text-sm text-gray-600">We recommend reviewing your analytics monthly to track progress and identify trends early.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">What if my risk score is high?</h4>
              <p className="text-sm text-gray-600">Don&apos;t panic! Schedule a consultation with your doctor to create an action plan to address risk factors.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">How accurate are the predictions?</h4>
              <p className="text-sm text-gray-600">Our AI uses machine learning on medical data. However, consult doctors for medical decisions.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">Can I export my data?</h4>
              <p className="text-sm text-gray-600">Yes! You can download your full health report and share it with your healthcare providers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
