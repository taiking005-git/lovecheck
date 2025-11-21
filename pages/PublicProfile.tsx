import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { EvaluationRequest, AggregatedScore, User } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Users, Heart, ArrowLeft } from 'lucide-react';

export const PublicProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [requests, setRequests] = useState<EvaluationRequest[]>([]);
    const [aggregates, setAggregates] = useState<AggregatedScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadData(userId);
        }
    }, [userId]);

    const loadData = async (uid: string) => {
        setLoading(true);
        try {
            const [user, reqs] = await Promise.all([
                db.getUserProfile(uid),
                db.getUserRequests(uid)
            ]);

            setProfileUser(user);
            setRequests(reqs);

            const allResponses = reqs.flatMap(r => r.responses);
            const aggs = db.calculateAggregates(allResponses);
            setAggregates(aggs);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <Heart className="h-12 w-12 text-brand-300 mb-4" />
                <div className="text-gray-400">Loading profile...</div>
            </div>
        </div>
    );

    if (!profileUser) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                <p className="text-gray-500 mb-6">The user profile you are looking for does not exist.</p>
                <Link to="/" className="text-brand-600 hover:text-brand-700 font-medium">Return Home</Link>
            </div>
        </div>
    );

    const ratedAggregates = aggregates.filter(a => a.count > 0);
    const overallScore = ratedAggregates.length > 0
        ? (ratedAggregates.reduce((acc, curr) => acc + curr.average, 0) / ratedAggregates.length).toFixed(1)
        : "0.0";

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
                        {profileUser.name}'s Love Profile
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A 1 Corinthians 13 evaluation based on feedback from friends and family.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Overall Score Card */}
                    <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>

                        <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
                            <h3 className="text-brand-100 font-medium text-sm uppercase tracking-wider mb-2">Overall Love Score</h3>
                            <div className="text-6xl font-bold mb-2 tracking-tight">
                                {overallScore}
                            </div>
                            <div className="text-brand-100 text-sm font-medium opacity-80">out of 10</div>

                            <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-brand-50">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-xl">{requests.reduce((acc, r) => acc + r.responses.length, 0)}</span>
                                    <span className="text-xs opacity-70">Evaluations</span>
                                </div>
                                <div className="w-px h-8 bg-brand-400 opacity-50"></div>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-xl">{ratedAggregates.length}</span>
                                    <span className="text-xs opacity-70">Traits Rated</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analysis Section */}
                    <Card className="overflow-hidden shadow-lg border-gray-100">
                        <CardHeader className="bg-white border-b border-gray-50 pb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-brand-500" />
                                Trait Analysis
                            </h3>
                        </CardHeader>
                        <CardContent className="p-6">
                            {requests.flatMap(r => r.responses).length > 0 ? (
                                <div className="space-y-10">
                                    {/* Radar Chart */}
                                    <div className="h-[400px] w-full -ml-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={aggregates}>
                                                <PolarGrid stroke="#f3f4f6" />
                                                <PolarAngleAxis
                                                    dataKey="traitName"
                                                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
                                                />
                                                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                                <Radar
                                                    name="Average Score"
                                                    dataKey="average"
                                                    stroke="#e11d48"
                                                    strokeWidth={3}
                                                    fill="#e11d48"
                                                    fillOpacity={0.2}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                    itemStyle={{ color: '#e11d48', fontWeight: 600 }}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Strengths & Weaknesses Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                        <div className="bg-green-50/50 rounded-xl p-6 border border-green-100">
                                            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wide mb-5 flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                Top Strengths
                                            </h4>
                                            <div className="space-y-4">
                                                {[...aggregates]
                                                    .filter(a => a.count > 0)
                                                    .sort((a, b) => b.average - a.average)
                                                    .slice(0, 3)
                                                    .map((trait) => (
                                                        <div key={trait.traitId} className="group">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-gray-700 font-medium text-sm">{trait.traitName}</span>
                                                                <span className="text-sm font-bold text-gray-900">{trait.average}</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-green-100">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 ease-out"
                                                                    style={{ width: `${(trait.average / 10) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {ratedAggregates.length === 0 && (
                                                    <p className="text-sm text-gray-400 italic text-center py-4">No rated traits yet.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
                                            <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-5 flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                                                Areas for Growth
                                            </h4>
                                            <div className="space-y-4">
                                                {[...aggregates]
                                                    .filter(a => a.count > 0)
                                                    .sort((a, b) => a.average - b.average)
                                                    .slice(0, 3)
                                                    .map((trait) => (
                                                        <div key={trait.traitId} className="group">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-gray-700 font-medium text-sm">{trait.traitName}</span>
                                                                <span className="text-sm font-bold text-gray-900">{trait.average}</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-amber-100">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
                                                                    style={{ width: `${(trait.average / 10) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {ratedAggregates.length === 0 && (
                                                    <p className="text-sm text-gray-400 italic text-center py-4">No rated traits yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-16">
                                    <Users className="mx-auto h-16 w-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-gray-500">No evaluations received yet.</p>
                                    <p className="text-sm mt-1">Check back later!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 text-center">
                    <Link to="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Create your own LoveCheck profile
                    </Link>
                </div>
            </div>
        </div>
    );
};
