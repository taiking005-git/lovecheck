import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { EvaluationRequest, AggregatedScore } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Toast } from "../components/ui/Toast";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Copy, Plus, Users, Clock, Share2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EvaluationRequest[]>([]);
  const [aggregates, setAggregates] = useState<AggregatedScore[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [allowAnon, setAllowAnon] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const reqs = await db.getUserRequests(user.uid);
      setRequests(reqs);

      // Aggregate all responses from all requests for the chart
      const allResponses = reqs.flatMap(r => r.responses);
      const aggs = db.calculateAggregates(allResponses);
      setAggregates(aggs);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newLabel) return;

    setIsGenerating(true);
    try {
      await db.createRequest(user.uid, newLabel, allowAnon);
      setIsCreating(false);
      setNewLabel('');
      loadData();
      showToast('New evaluation link created!', 'success');
    } catch (error) {
      console.error("Error creating request:", error);
      showToast('Failed to create link. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/#/evaluate/${id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            showToast('Link copied to clipboard!', 'success');
          } else {
            showToast('Failed to copy link manually', 'error');
          }
        } catch (err) {
          showToast('Failed to copy link', 'error');
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy link', 'error');
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Your Love Profile
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="outline" onClick={() => {
            const url = `${window.location.origin}/#/profile/${user?.uid}`;
            navigator.clipboard.writeText(url);
            showToast('Profile link copied to clipboard!', 'success');
          }}>
            <Share2 className="-ml-1 mr-2 h-5 w-5" />
            Share Profile
          </Button>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            New Evaluation Link
          </Button>
        </div>
      </div>

      {/* Create Request Form */}
      {isCreating && (
        <div className="mb-8">
          <Card>
            <CardContent>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Evaluation Link</h3>
              <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                  <Input
                    label="Label (e.g. 'Family', 'Small Group')"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    required
                    placeholder="Who is this for?"
                  />
                </div>
                <div className="flex items-center mb-3">
                  <input
                    id="anon"
                    type="checkbox"
                    checked={allowAnon}
                    onChange={(e) => setAllowAnon(e.target.checked)}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anon" className="ml-2 block text-sm text-gray-900">
                    Allow Anonymous
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full md:w-auto mb-[2px]"
                  isLoading={isGenerating}
                  loadingText="Generating Link..."
                >
                  Generate Link
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        {/* Chart & Analysis Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border-none">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <h3 className="text-brand-100 font-medium text-sm uppercase tracking-wider mb-1">Overall Love Score</h3>
                <div className="text-5xl font-bold mb-2">
                  {(() => {
                    const rated = aggregates.filter(a => a.count > 0);
                    return rated.length > 0
                      ? (rated.reduce((acc, curr) => acc + curr.average, 0) / rated.length).toFixed(1)
                      : "0.0";
                  })()}
                </div>
                <div className="text-brand-100 text-xs">out of 10</div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-6 h-full flex items-center justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {requests.reduce((acc, r) => acc + r.responses.length, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Evaluations</div>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {requests.filter(r => r.active).length}
                  </div>
                  <div className="text-sm text-gray-500">Active Links</div>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {aggregates.filter(a => a.count > 0).length}
                  </div>
                  <div className="text-sm text-gray-500">Traits Rated</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Trait Analysis</h3>
            </CardHeader>
            <CardContent>
              {requests.flatMap(r => r.responses).length > 0 ? (
                <div className="space-y-8">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={aggregates}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="traitName" tick={{ fill: '#4b5563', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9ca3af' }} />
                        <Radar
                          name="Average Score"
                          dataKey="average"
                          stroke="#e11d48"
                          fill="#e11d48"
                          fillOpacity={0.3}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#e11d48', fontWeight: 600 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                    <div>
                      <h4 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-4 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Top Strengths
                      </h4>
                      <div className="space-y-3">
                        {[...aggregates]
                          .filter(a => a.count > 0)
                          .sort((a, b) => b.average - a.average)
                          .slice(0, 3)
                          .map((trait) => (
                            <div key={trait.traitId} className="flex justify-between items-center group">
                              <span className="text-gray-700 font-medium">{trait.traitName}</span>
                              <div className="flex items-center">
                                <div className="w-24 h-2 bg-gray-100 rounded-full mr-3 overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${(trait.average / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-8 text-right">{trait.average}</span>
                              </div>
                            </div>
                          ))}
                        {aggregates.filter(a => a.count > 0).length === 0 && (
                          <p className="text-sm text-gray-400 italic">No rated traits yet.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-4 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                        Areas for Growth
                      </h4>
                      <div className="space-y-3">
                        {[...aggregates]
                          .filter(a => a.count > 0)
                          .sort((a, b) => a.average - b.average)
                          .slice(0, 3)
                          .map((trait) => (
                            <div key={trait.traitId} className="flex justify-between items-center group">
                              <span className="text-gray-700 font-medium">{trait.traitName}</span>
                              <div className="flex items-center">
                                <div className="w-24 h-2 bg-gray-100 rounded-full mr-3 overflow-hidden">
                                  <div
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${(trait.average / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-8 text-right">{trait.average}</span>
                              </div>
                            </div>
                          ))}
                        {aggregates.filter(a => a.count > 0).length === 0 && (
                          <p className="text-sm text-gray-400 italic">No rated traits yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No evaluations received yet.</p>
                  <p className="text-sm">Share a link to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Links List Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Links</h3>
          <div className="space-y-4">
            {requests.length === 0 && (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500 text-sm">
                No active links. Create one to start receiving feedback.
              </div>
            )}
            {requests.map((req) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{req.label}</h4>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Expires in {Math.ceil((req.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                      </div>
                    </div>
                    <div className="bg-brand-50 text-brand-700 px-2 py-1 rounded-full text-xs font-medium">
                      {req.responses.length} Responses
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                    <Button variant="outline" onClick={() => copyLink(req.id)} className="flex-1 text-sm h-10">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>

                  {/* Recent comments preview */}
                  {req.responses.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {req.responses.slice(0, 2).map((res, idx) => (
                        res.comment && (
                          <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded italic">
                            "{res.comment}"
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};