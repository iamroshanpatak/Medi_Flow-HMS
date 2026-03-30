// frontend/app/health-recommendations/page.tsx
'use client';

import React, { useState } from 'react';
import HealthScoreCard from '@/components/health/HealthScoreCard';
import RecommendationsPanel from '@/components/health/RecommendationsPanel';
import ActionPlanView from '@/components/health/ActionPlanView';

type TabType = 'score' | 'recommendations' | 'action-plan';

export default function HealthRecommendationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('score');

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'score', label: 'Health Score', icon: '📊' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    { id: 'action-plan', label: 'Action Plan', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Health Journey</h1>
          <p className="mt-2 text-gray-600">
            Get personalized health recommendations based on your medical history and current health status
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white shadow-sm z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'score' && (
          <div className="space-y-6">
            <HealthScoreCard />
            
            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">About Your Score</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Your health score is calculated using multiple factors including:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Lifestyle habits (exercise, diet, sleep)</li>
                  <li>✓ Medical history and conditions</li>
                  <li>✓ Preventive care compliance</li>
                  <li>✓ Recent health assessments</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">How to Improve</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Focus on these areas to boost your health score:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Increase physical activity</li>
                  <li>✓ Maintain healthy diet</li>
                  <li>✓ Get regular health screenings</li>
                  <li>✓ Manage stress effectively</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsPanel />
        )}

        {activeTab === 'action-plan' && (
          <ActionPlanView />
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Health?</h2>
          <p className="text-blue-100 mb-6">
            Schedule a consultation with a doctor to discuss your personalized health plan
          </p>
          <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Schedule Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
