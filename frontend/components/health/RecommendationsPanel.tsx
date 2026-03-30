// frontend/components/health/RecommendationsPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface RecommendationsData {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  lifestyle: string[];
  monitoring: string[];
}

export default function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'immediate' | 'shortTerm' | 'longTerm' | 'lifestyle' | 'monitoring'>('immediate');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations/generate', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !recommendations) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error loading recommendations: {error}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'immediate', label: '🔴 Immediate', icon: 'urgent' },
    { id: 'shortTerm', label: '🟡 Short-term (1-4 weeks)', icon: 'clock' },
    { id: 'longTerm', label: '🟢 Long-term (1+ months)', icon: 'target' },
    { id: 'lifestyle', label: '💪 Lifestyle', icon: 'lifestyle' },
    { id: 'monitoring', label: '📊 Monitoring', icon: 'pulse' }
  ] as const;

  const getRecommendationsList = () => {
    const key = selectedTab as keyof RecommendationsData;
    return recommendations[key] || [];
  };

  const getPriorityColor = (tab: string) => {
    switch (tab) {
      case 'immediate': return 'bg-red-50 border-l-4 border-red-500';
      case 'shortTerm': return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'longTerm': return 'bg-green-50 border-l-4 border-green-500';
      case 'lifestyle': return 'bg-blue-50 border-l-4 border-blue-500';
      case 'monitoring': return 'bg-purple-50 border-l-4 border-purple-500';
      default: return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  const getTabActiveColor = (tab: string) => {
    if (selectedTab === tab) {
      switch (tab) {
        case 'immediate': return 'bg-red-100 text-red-700';
        case 'shortTerm': return 'bg-yellow-100 text-yellow-700';
        case 'longTerm': return 'bg-green-100 text-green-700';
        case 'lifestyle': return 'bg-blue-100 text-blue-700';
        case 'monitoring': return 'bg-purple-100 text-purple-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    }
    return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
  };

  const recommendationsList = getRecommendationsList();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Health Recommendations</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${getTabActiveColor(tab.id)}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendationsList.length > 0 ? (
          recommendationsList.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${getPriorityColor(selectedTab)} hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{rec}</h3>
                  <p className="text-xs text-gray-600">
                    {selectedTab === 'immediate' && 'Action required immediately for optimal health'}
                    {selectedTab === 'shortTerm' && 'Focus on this goal within the next 1-4 weeks'}
                    {selectedTab === 'longTerm' && 'Long-term habit to develop over months'}
                    {selectedTab === 'lifestyle' && 'Modify your lifestyle habits for better health'}
                    {selectedTab === 'monitoring' && 'Track this metric regularly for health trends'}
                  </p>
                </div>
                <button className="flex-shrink-0 text-blue-600 hover:text-blue-800 font-semibold">
                  ➜
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No {selectedTab} recommendations at this time</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{recommendations.immediate?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Immediate</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{recommendations.shortTerm?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Short-term</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{recommendations.longTerm?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Long-term</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{recommendations.lifestyle?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Lifestyle</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{recommendations.monitoring?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Monitor</p>
        </div>
      </div>

      {/* Call to Action */}
      <button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-shadow">
        Create Action Plan
      </button>
    </div>
  );
}
