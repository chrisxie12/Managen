import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { StatCard } from '../components/shared/StatCard';
import { DashboardSkeleton } from '../components/shared/DashboardSkeleton';
import { SectionError } from '../components/shared/SectionError';
import { LiveBadge } from '../components/shared/LiveBadge';

export function StudentDashboard() {
    const {
        stats, timetable, results, homework, exams, materials, notices,
        loading, error
    } = useStudentDashboard();

    if (loading) return <DashboardSkeleton sections={3} cardsPerSection={3} />;
    if (error) return <div className="p-6"><SectionError message={error} /></div>;
    if (!stats) return <div className="p-6">No data available</div>;

    const nextClass = timetable.find(t => t.status === 'NOW') || timetable.find(t => t.status === 'UPCOMING');

    return (
        <div className="p-4 md:p-8 bg-[var(--bg)] min-h-screen space-y-8 font-['DM_Sans']">
            {/* Header & Primary Question */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Student Portal</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        What is my next class and what homework is due tomorrow?
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LiveBadge text="Live Data" />
                </div>
            </div>

            {/* Next Class Alert Banner */}
            {nextClass && (
                <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${nextClass.status === 'NOW' ? 'bg-[var(--primary-light)] border-[var(--primary)]' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${nextClass.status === 'NOW' ? 'bg-[var(--primary)] text-white' : 'bg-blue-200 text-blue-800'}`}>
                            {nextClass.status === 'NOW' ? '🎓' : '⏳'}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold uppercase tracking-wider ${nextClass.status === 'NOW' ? 'text-[var(--primary-dark)]' : 'text-blue-800'}`}>
                                {nextClass.status === 'NOW' ? 'Happening Now' : 'Up Next'} • {nextClass.time}
                            </p>
                            <h2 className={`text-lg font-bold ${nextClass.status === 'NOW' ? 'text-[var(--primary-dark)]' : 'text-blue-900'}`}>
                                {nextClass.subject}
                            </h2>
                            <p className={`text-sm ${nextClass.status === 'NOW' ? 'text-[var(--primary)]' : 'text-blue-700'}`}>
                                Room: {nextClass.roomNumber} • Teacher: {nextClass.teacherName}
                            </p>
                        </div>
                    </div>
                    {nextClass.status === 'NOW' && (
                        <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--primary-dark)] transition-colors">
                            Join Online
                        </button>
                    )}
                </div>
            )}

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Attendance"
                    value={`${stats.attendancePercent}%`}
                    subValue={`${stats.presentDays} days present`}
                    trend={stats.attendancePercent >= 90 ? 'up' : 'down'}
                    trendValue="This term"
                    type="percentage"
                    icon={<span className="text-2xl">📅</span>}
                />
                <StatCard
                    title="Pending Homework"
                    value={homework.filter(h => h.status === 'Pending' || h.status === 'Overdue').length}
                    subValue="Assignments due"
                    trend={homework.filter(h => h.status === 'Overdue').length > 0 ? 'down' : 'neutral'}
                    trendValue={homework.filter(h => h.status === 'Overdue').length > 0 ? 'Action required' : 'On track'}
                    type="number"
                    icon={<span className="text-2xl">📚</span>}
                />
                <StatCard
                    title="Upcoming Exams"
                    value={exams.length}
                    subValue="Next 14 days"
                    trend="neutral"
                    trendValue={exams[0] ? `Next in ${exams[0].daysUntil} days` : 'None scheduled'}
                    type="number"
                    icon={<span className="text-2xl">📝</span>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Timetable & Homework */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Today's Timetable */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Today's Schedule</h3>
                            <button className="text-[var(--primary)] text-sm font-medium hover:underline">Full Timetable</button>
                        </div>
                        <div className="space-y-3">
                            {timetable.map(t => (
                                <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border ${t.status === 'NOW' ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-mono text-[var(--muted)] w-16">{t.time}</div>
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">{t.subject}</p>
                                            <p className="text-xs text-[var(--muted)]">Room {t.roomNumber} • {t.teacherName}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {t.status === 'DONE' && <span className="text-xs font-semibold text-[var(--muted)] bg-gray-100 px-2 py-1 rounded">Completed</span>}
                                        {t.status === 'NOW' && <span className="text-xs font-semibold text-[var(--primary)] bg-green-100 px-2 py-1 rounded flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span> Now</span>}
                                        {t.status === 'UPCOMING' && <span className="text-xs font-semibold text-[var(--info)] bg-blue-50 px-2 py-1 rounded">Upcoming</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Homework */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Active Assignments</h3>
                        <div className="space-y-4">
                            {homework.map(hw => (
                                <div key={hw.id} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-[var(--text)]">{hw.subject}</h4>
                                            <p className="text-sm text-[var(--muted)]">{hw.description}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${hw.status === 'Overdue' ? 'bg-red-100 text-red-800' : hw.status === 'Evaluated' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {hw.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                                            <span>📅</span> Due: {new Date(hw.dueDate).toLocaleDateString()}
                                        </span>
                                        {hw.status === 'Pending' && (
                                            <button className="bg-[var(--primary)] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[var(--primary-dark)]">
                                                Submit Now
                                            </button>
                                        )}
                                        {hw.status === 'Evaluated' && (
                                            <span className="text-sm font-bold text-[var(--primary)]">Score: {hw.score}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {homework.length === 0 && <p className="text-sm text-[var(--muted)] text-center py-4">No active assignments. Great job!</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Results, Materials, Notices */}
                <div className="space-y-6">
                    {/* Recent Results */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Recent Results</h3>
                            <button className="text-[var(--primary)] text-sm font-medium hover:underline">All Grades</button>
                        </div>
                        <div className="space-y-3">
                            {results.map(res => (
                                <div key={res.id} className="flex items-center justify-between p-3 border-b border-[var(--border)] last:border-0 pb-3">
                                    <div>
                                        <p className="font-semibold text-sm text-[var(--text)]">{res.subject}</p>
                                        <p className="text-xs text-[var(--muted)]">{res.examName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[var(--text)]">{res.score}/{res.maxScore}</p>
                                        <p className={`text-xs font-bold ${res.grade === 'A' ? 'text-green-600' : res.grade === 'B' ? 'text-blue-600' : 'text-amber-600'}`}>
                                            Grade {res.grade}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {results.length === 0 && <p className="text-sm text-[var(--muted)] text-center">No recent results.</p>}
                        </div>
                    </div>

                    {/* Study Materials */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">New Study Materials</h3>
                        <div className="space-y-3">
                            {materials.map(mat => (
                                <div key={mat.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xs font-bold">
                                        {mat.type}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--text)] truncate">{mat.title}</p>
                                        <p className="text-xs text-[var(--muted)]">{mat.subject} • {mat.uploader}</p>
                                    </div>
                                    <button className="text-[var(--muted)] hover:text-[var(--primary)]">⬇️</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notices */}
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">School Notices</h3>
                        <div className="space-y-3">
                            {notices.map(notice => (
                                <div key={notice.id} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg)]">
                                    <p className="font-medium text-sm text-[var(--text)]">{notice.title}</p>
                                    <p className="text-xs text-[var(--muted)] mt-1">{new Date(notice.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
