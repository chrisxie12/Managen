import React from 'react';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { StatCard } from '../components/shared/StatCard';
import { DashboardSkeleton } from '../components/shared/DashboardSkeleton';
import { SectionError } from '../components/shared/SectionError';
import { LiveBadge } from '../components/shared/LiveBadge';
import { ProgressBar } from '../components/shared/ProgressBar';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function TeacherDashboard() {
    const {
        stats, timetable, performance, homework, exams, attendance,
        loading, error
    } = useTeacherDashboard();

    if (loading) return <DashboardSkeleton sections={3} cardsPerSection={4} />;
    if (error) return <div className="p-6"><SectionError message={error} /></div>;
    if (!stats) return <div className="p-6">No data available</div>;

    const nextClass = timetable.find(t => t.status === 'NOW') || timetable.find(t => t.status === 'UPCOMING');

    return (
        <div className="p-4 md:p-8 bg-[var(--bg)] min-h-screen space-y-8 font-['DM_Sans']">
            {/* Header & Primary Question */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">My Classes & Tasks</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        What is my next class and what tasks need my immediate attention?
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LiveBadge text="Live Data" />
                </div>
            </div>

            {/* Next Class Alert Banner */}
            {nextClass && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${nextClass.status === 'NOW' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${nextClass.status === 'NOW' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {nextClass.status === 'NOW' ? '▶️' : '⏳'}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold uppercase tracking-wider ${nextClass.status === 'NOW' ? 'text-green-800' : 'text-blue-800'}`}>
                                {nextClass.status === 'NOW' ? 'Happening Now' : 'Up Next'} • {nextClass.time}
                            </p>
                            <h2 className={`text-lg font-bold ${nextClass.status === 'NOW' ? 'text-green-900' : 'text-blue-900'}`}>
                                {nextClass.subject} ({nextClass.classSection})
                            </h2>
                            <p className={`text-sm ${nextClass.status === 'NOW' ? 'text-green-700' : 'text-blue-700'}`}>
                                Room: {nextClass.room}
                            </p>
                        </div>
                    </div>
                    {nextClass.status === 'NOW' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
                            Take Attendance
                        </button>
                    )}
                </div>
            )}

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Attendance Marked"
                    value={`${stats.markedToday}/${stats.totalClassesToday}`}
                    subValue="Classes today"
                    trend={stats.markedToday === stats.totalClassesToday ? 'up' : 'neutral'}
                    trendValue={stats.markedToday === stats.totalClassesToday ? 'All done' : 'Pending'}
                    type="number"
                    icon={<span className="text-2xl">📝</span>}
                />
                <StatCard
                    title="Pending Evaluations"
                    value={stats.pendingEvaluations}
                    subValue="Homework submissions"
                    trend="down"
                    trendValue="Needs action"
                    type="number"
                    icon={<span className="text-2xl">📚</span>}
                />
                <StatCard
                    title="Students Taught"
                    value={stats.totalStudentsInMyClasses}
                    subValue={`Across ${stats.classCount} classes`}
                    trend="neutral"
                    trendValue="Active"
                    type="number"
                    icon={<span className="text-2xl">🧑‍🎓</span>}
                />
                <StatCard
                    title="Overdue Submissions"
                    value={stats.overdueSubmissions}
                    subValue="Students to follow up"
                    trend="down"
                    trendValue="Review needed"
                    type="number"
                    icon={<span className="text-2xl">⏰</span>}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Timetable & Homework */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Today's Timetable */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Today's Schedule</h3>
                        </div>
                        <div className="space-y-3">
                            {timetable.map(t => (
                                <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border ${t.status === 'NOW' ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-mono text-[var(--muted)] w-24">{t.time}</div>
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">{t.subject} <span className="text-[var(--muted)] font-normal text-sm">({t.classSection})</span></p>
                                            <p className="text-xs text-[var(--muted)]">Room {t.room}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {t.status === 'DONE' && <span className="text-xs font-semibold text-[var(--muted)] bg-gray-100 px-2 py-1 rounded">Completed</span>}
                                        {t.status === 'NOW' && <span className="text-xs font-semibold text-[var(--primary)] bg-green-100 px-2 py-1 rounded flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span> In Progress</span>}
                                        {t.status === 'UPCOMING' && <span className="text-xs font-semibold text-[var(--info)] bg-blue-50 px-2 py-1 rounded">Upcoming</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Class Performance Chart */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Class Performance Averages</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="className" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                    <Tooltip 
                                        cursor={{ fill: 'var(--bg)' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                        formatter={(value: number) => [`${value}%`, 'Avg Score']}
                                    />
                                    <Bar dataKey="avgScore" name="Avg Score" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: Homework & Exams */}
                <div className="space-y-6">
                    {/* Active Homework */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Homework Tracking</h3>
                            <button className="text-[var(--primary)] text-xs font-medium hover:underline">+ New</button>
                        </div>
                        <div className="space-y-4">
                            {homework.map(hw => (
                                <div key={hw.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-[var(--text)]">{hw.class} - {hw.subject}</span>
                                        <span className="text-[var(--muted)]">{hw.submitted}/{hw.total}</span>
                                    </div>
                                    <ProgressBar progress={(hw.submitted / hw.total) * 100} color="var(--primary)" size="sm" />
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-[var(--danger)]">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                                        <button className="text-xs text-[var(--primary)] font-medium hover:underline">Grade</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Exams */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Upcoming Assessments</h3>
                        <div className="space-y-3">
                            {exams.map(exam => (
                                <div key={exam.id} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)]">
                                    <p className="font-semibold text-sm text-[var(--text)]">{exam.name}</p>
                                    <p className="text-xs text-[var(--muted)] mb-2">{exam.class} • {exam.subject}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{new Date(exam.date).toLocaleDateString()}</span>
                                        <button className="text-xs text-[var(--primary)] font-medium hover:underline">View Details</button>
                                    </div>
                                </div>
                            ))}
                            {exams.length === 0 && <p className="text-sm text-[var(--muted)] text-center py-4">No upcoming exams</p>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
