import React from 'react';
import { useParentDashboard } from '../hooks/useParentDashboard';
import { StatCard } from '../components/shared/StatCard';
import { DashboardSkeleton } from '../components/shared/DashboardSkeleton';
import { SectionError } from '../components/shared/SectionError';
import { AvatarInitials } from '../components/shared/AvatarInitials';
import { ProgressBar } from '../components/shared/ProgressBar';
import { formatCurrency } from '../utils/formatters';

export default function ParentDashboard() {
    const {
        children, selectedChildId, setSelectedChildId,
        summary, weekSummary, attendance, fees, results, homework, exams, notices,
        loading, error
    } = useParentDashboard();

    if (error) return <div className="p-6"><SectionError message={error} /></div>;
    
    // Header for parent has the child switcher
    return (
        <div className="p-4 md:p-8 bg-[var(--bg)] min-h-screen space-y-8 font-['DM_Sans']">
            {/* Header & Primary Question */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Parent Portal</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        Is my child performing well and are there any pending dues?
                    </p>
                </div>
                {/* Child Switcher */}
                {children.length > 0 && (
                    <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1 shadow-sm">
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(child.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${
                                    selectedChildId === child.id 
                                    ? 'bg-[var(--primary)] text-white shadow' 
                                    : 'text-[var(--muted)] hover:bg-[var(--bg)]'
                                }`}
                            >
                                <AvatarInitials initials={child.initials} size="sm" />
                                {child.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <DashboardSkeleton sections={3} cardsPerSection={4} />
            ) : !summary ? (
                <div className="p-6 text-center text-[var(--muted)]">No data available for this child.</div>
            ) : (
                <>
                    {/* Action Needed Alerts */}
                    {(summary.amountDue > 0 || summary.overdueHomework > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summary.amountDue > 0 && (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start justify-between">
                                    <div>
                                        <h3 className="text-red-800 font-bold mb-1">Fees Due Soon</h3>
                                        <p className="text-red-700 text-sm">
                                            {formatCurrency(summary.amountDue)} is due in {summary.daysUntilDeadline} days.
                                        </p>
                                    </div>
                                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
                                        Pay Now
                                    </button>
                                </div>
                            )}
                            {summary.overdueHomework > 0 && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start justify-between">
                                    <div>
                                        <h3 className="text-amber-800 font-bold mb-1">Overdue Homework</h3>
                                        <p className="text-amber-700 text-sm">
                                            Your child has {summary.overdueHomework} overdue assignment(s).
                                        </p>
                                    </div>
                                    <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600">
                                        View Details
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard
                            title="Academic Performance"
                            value={`${summary.lastExamScore}%`}
                            subValue={`Rank: ${summary.rank}/${summary.total}`}
                            trend="up"
                            trendValue={`Grade: ${summary.grade}`}
                            type="percentage"
                            icon={<span className="text-2xl">🏆</span>}
                        />
                        <StatCard
                            title="Attendance"
                            value={`${summary.attendancePercent}%`}
                            subValue={`${summary.presentDays} days present`}
                            trend={summary.attendancePercent >= 90 ? 'up' : 'down'}
                            trendValue="This term"
                            type="percentage"
                            icon={<span className="text-2xl">📅</span>}
                        />
                        <StatCard
                            title="Pending Homework"
                            value={summary.pendingHomework}
                            subValue="Active assignments"
                            trend="neutral"
                            trendValue="Due this week"
                            type="number"
                            icon={<span className="text-2xl">📚</span>}
                        />
                        <StatCard
                            title="Fee Balance"
                            value={formatCurrency(fees?.outstanding || 0)}
                            subValue="Remaining this term"
                            trend={(fees?.outstanding || 0) === 0 ? 'up' : 'down'}
                            trendValue={(fees?.outstanding || 0) === 0 ? 'Cleared' : 'Pending'}
                            type="currency"
                            icon={<span className="text-2xl">💳</span>}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Weekly Overview */}
                            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">This Week's Overview</h3>
                                <div className="flex gap-2">
                                    {weekSummary.map(day => (
                                        <div key={day.day} className={`flex-1 flex flex-col items-center justify-between p-3 rounded-lg border ${day.day === new Date().toLocaleDateString('en-US', {weekday: 'short'}) ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
                                            <span className="text-xs font-semibold text-[var(--muted)] uppercase">{day.day}</span>
                                            
                                            <div className="my-3 flex flex-col gap-1 items-center">
                                                {day.status === 'present' && <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>}
                                                {day.status === 'absent' && <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">✗</span>}
                                                {day.status === 'late' && <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">L</span>}
                                                
                                                {day.hasExam && <span className="w-2 h-2 rounded-full bg-[var(--danger)]" title="Exam Day" />}
                                                {day.hasHomework && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" title="Homework Due" />}
                                            </div>
                                            <span className="text-[10px] text-[var(--muted)] text-center">{day.classes} classes</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-4 text-xs text-[var(--muted)] justify-center">
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--danger)]" /> Exam</div>
                                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Homework Due</div>
                                </div>
                            </div>

                            {/* Recent Academic Results */}
                            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Latest Exam Results</h3>
                                    <button className="text-sm text-[var(--primary)] font-medium hover:underline">View Report Card</button>
                                </div>
                                {results && (
                                    <div className="space-y-4">
                                        <div className="flex gap-4 mb-6 p-4 bg-[var(--bg)] rounded-lg">
                                            <div className="flex-1 text-center border-r border-[var(--border)]">
                                                <p className="text-xs text-[var(--muted)]">Average</p>
                                                <p className="text-xl font-bold text-[var(--text)]">{results.summary.avg}%</p>
                                            </div>
                                            <div className="flex-1 text-center border-r border-[var(--border)]">
                                                <p className="text-xs text-[var(--muted)]">Grade</p>
                                                <p className="text-xl font-bold text-[var(--primary)]">{results.summary.grade}</p>
                                            </div>
                                            <div className="flex-1 text-center">
                                                <p className="text-xs text-[var(--muted)]">Rank</p>
                                                <p className="text-xl font-bold text-[var(--text)]">{results.summary.rank}/{results.summary.total}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {results.subjects.map(sub => (
                                                <div key={sub.name} className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                                                    <span className="text-sm text-[var(--text)] font-medium">{sub.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-[var(--text)]">{sub.score}%</span>
                                                        <span className={`text-xs font-bold w-6 text-center ${sub.grade === 'A' ? 'text-green-600' : sub.grade === 'B' ? 'text-blue-600' : 'text-amber-600'}`}>
                                                            {sub.grade}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            
                            {/* Homework & Upcoming */}
                            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Pending Homework</h3>
                                <div className="space-y-3">
                                    {homework.map(hw => (
                                        <div key={hw.id} className={`p-3 rounded-lg border ${hw.status === 'Overdue' ? 'border-red-200 bg-red-50' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm text-[var(--text)]">{hw.subject}</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${hw.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {hw.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[var(--muted)]">Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                    {homework.length === 0 && <p className="text-sm text-[var(--muted)]">No pending homework.</p>}
                                </div>
                            </div>

                            {/* Upcoming Exams */}
                            <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Upcoming Exams</h3>
                                <div className="space-y-3">
                                    {exams.map(exam => (
                                        <div key={exam.id} className="p-3 border border-[var(--border)] rounded-lg">
                                            <p className="font-semibold text-sm text-[var(--text)]">{exam.subject}</p>
                                            <p className="text-xs text-[var(--muted)] mb-2">{exam.name} • {new Date(exam.date).toLocaleDateString()}</p>
                                            <div className="text-xs text-[var(--primary)] bg-[var(--primary-light)] p-2 rounded flex items-start gap-2">
                                                <span>💡</span>
                                                <span>{exam.tip}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {exams.length === 0 && <p className="text-sm text-[var(--muted)]">No upcoming exams.</p>}
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
