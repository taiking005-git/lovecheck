import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { CORE_TRAITS, RELATIONSHIP_TYPES } from '../constants';
import { EvaluationRequest, EvaluatorResponse, Rating } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { v4 as uuidv4 } from 'uuid';

export const Evaluate: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestData, setRequestData] = useState<{ request: EvaluationRequest, userName: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchReq = async () => {
      if (!requestId) return;
      try {
        const data = await db.getPublicRequestInfo(requestId);

        console.log(data);
        if (!data) throw new Error("Invalid evaluation link or link expired.");
        setRequestData(data);

        // Initialize ratings to 5 (middle)
        const initialRatings: Record<string, number> = {};
        CORE_TRAITS.forEach(t => initialRatings[t.id] = 5);
        setRatings(initialRatings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReq();
  }, [requestId]);

  const handleRatingChange = (traitId: string, value: number) => {
    setRatings(prev => ({ ...prev, [traitId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId || !requestData) return;
    setSubmitting(true);

    try {
      const formattedRatings: Rating[] = Object.entries(ratings).map(([id, score]) => ({
        traitId: id,
        score: score as number
      }));

      const response: EvaluatorResponse = {
        id: uuidv4(),
        evaluatorName: isAnonymous ? 'Anonymous' : name,
        relationship,
        isAnonymous,
        ratings: formattedRatings,
        comment: comment.trim() || undefined,
        createdAt: Date.now()
      };

      await db.submitEvaluation(requestId, response);
      setSuccess(true);
    } catch (err) {
      setError("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-red-600 text-xl font-bold mb-2">Link Error</h2>
        <p className="text-gray-600">{error}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-brand-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center transform transition-all">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-8">
          Your feedback for {requestData?.userName} has been securely recorded. They will see the results aggregated with others to protect your privacy if you chose anonymity.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Evaluate {requestData?.userName}
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Help {requestData?.userName} grow by providing honest feedback on these biblical traits of love (1 Corinthians 13).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity Section */}
          <Card>
            <CardContent className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Your Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Your Name (Optional if Anonymous)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAnonymous}
                  required={!isAnonymous}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white"
                  >
                    <option value="" disabled>Select a relationship</option>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {requestData?.request.allowAnonymous && (
                <div className="flex items-center mt-2">
                  <input
                    id="anon_eval"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setName('Anonymous');
                      else setName('');
                    }}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anon_eval" className="ml-2 block text-sm text-gray-700">
                    Submit Anonymously
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Traits Section */}
          <div className="space-y-4">
            {CORE_TRAITS.map((trait) => (
              <Card key={trait.id} className="overflow-visible">
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-lg font-bold text-gray-900">{trait.name}</h4>
                      <span className="text-xs font-mono text-gray-400">{trait.verseReference}</span>
                    </div>
                    <p className="text-sm text-gray-500">{requestData?.userName + " " + trait.description}</p>
                  </div>

                  <div className="relative pt-6 pb-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={ratings[trait.id] || 5}
                      onChange={(e) => handleRatingChange(trait.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Rarely (1)</span>
                      <span className="font-bold text-brand-600 text-base">{ratings[trait.id]}</span>
                      <span>Always (10)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comments Section */}
          <Card>
            <CardContent>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Comments</h3>
              <textarea
                rows={4}
                className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border"
                placeholder="Any specific examples or words of encouragement?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end pb-12">
            <Button type="submit" className="w-full md:w-auto px-8 py-4 text-lg" isLoading={submitting}>
              Submit Evaluation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};