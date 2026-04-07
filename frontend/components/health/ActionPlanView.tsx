// frontend/components/health/ActionPlanView.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface Goal {
  description: string;
  timeline: string;
}

interface Milestone {
  week: number;
  action: string;
}

interface ActionPlan {
  goals: Goal[];
  milestones: Milestone[];
  resources: string[];
  tracking: Record<string, unknown>;
}

export default function ActionPlanView() {
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [completedGoals, setCompletedGoals] = useState<number[]>([]);

  useEffect(() => {
    const fetchActionPlan = async () => {
      try {
        const response = await fetch('/api/recommendations/action-plan?duration=3 months', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch action plan');
        }

        const data = await response.json();
        setActionPlan(data.actionPlan);
        setStartDate(data.startDate ? new Date(data.startDate) : new Date());
        setTargetDate(data.targetEndDate ? new Date(data.targetEndDate) : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchActionPlan();
  }, []);

  const toggleGoalCompletion = (index: number) => {
    setCompletedGoals(prev =>
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !actionPlan) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error loading action plan: {error}</p>
      </div>
    );
  }

  const progressPercentage = (completedGoals.length / (actionPlan.goals?.length || 1)) * 100;
  const daysRemaining = targetDate 
    ? Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">3-Month Action Plan</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {startDate?.toLocaleDateString()}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-lg font-bold text-purple-600 mt-1">3 Months</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Days Left</p>
            <p className="text-lg font-bold text-green-600 mt-1">
              {daysRemaining || 'N/A'}
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-gray-800">Overall Progress</p>
            <p className="text-sm text-gray-600">{Math.round(progressPercentage)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Health Goals</h3>

        <div className="space-y-3">
          {actionPlan.goals?.map((goal, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                completedGoals.includes(index)
                  ? 'bg-green-50 border-l-green-500 opacity-60'
                  : 'bg-blue-50 border-l-blue-500'
              } cursor-pointer hover:shadow-md transition-all`}
              onClick={() => toggleGoalCompletion(index)}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  completedGoals.includes(index)
                    ? 'bg-green-500 border-green-500'
                    : 'border-blue-400'
                }`}>
                  {completedGoals.includes(index) && (
                    <span className="text-white font-bold">✓</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${completedGoals.includes(index) ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {goal.description}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Timeline: <span className="font-semibold">{goal.timeline}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Click on goals to mark them as complete
        </p>
      </div>

      {/* Milestones Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Weekly Milestones</h3>

        <div className="space-y-4">
          {actionPlan.milestones?.map((milestone, index) => (
            <div
              key={index}
              className="relative pl-8 pb-8 border-l-2 border-blue-300 last:border-l-transparent last:pb-0"
            >
              <div className="absolute -left-3 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase">Week {milestone.week}</p>
                    <p className="text-gray-800 font-semibold mt-1">{milestone.action}</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-blue-200 text-blue-700 text-xs font-bold rounded-full">
                    {Math.ceil(milestone.week / 4)} Month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      {actionPlan.resources && actionPlan.resources.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Helpful Resources</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionPlan.resources.map((resource, index) => (
              <a
                key={index}
                href="#"
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="font-semibold text-gray-800">{resource}</p>
                    <p className="text-xs text-blue-600 mt-1">View resource →</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Your Journey to Better Health</h3>
        <p className="text-blue-100">
          You&apos;re {Math.round(progressPercentage)}% of the way through your action plan.
          Stay consistent with your goals and track your progress weekly for best results.
        </p>
        <button className="mt-4 bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          Edit Plan
        </button>
      </div>
    </div>
  );
}
