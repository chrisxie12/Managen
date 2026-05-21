import React from 'react';
import { useHeadmasterDashboard } from '../hooks/useHeadmasterDashboard';
import { StatCard } from '../components/shared/StatCard';
import { DashboardSkeleton } from '../components/shared/DashboardSkeleton';
import { SectionError } from '../components/shared/SectionError';
import { CriticalBadge } from '../components/shared/CriticalBadge';
import { LiveBadge } from '../components/shared/LiveBadge';
import { MiniSparkline } from '../components/shared/MiniSparkline';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

export function HeadmasterDashboard() {
    const {
        stats, alerts, finances, attendanceTrend,
        feeStatus, studentTypes, classPerformance, activity,
        loading, error
    } = useHeadmasterDashboard();

    if (loading) return <DashboardSkeleton sections={4} cardsPerSection={4} />;
    if (error) return <div className="p-6"><SectionError message={error} /></div>;
    if (!stats) return <div className="p-6">No data available</div>;

    const COLORS = ['#1a6b4a', '#f59e0b', '#ef4444', '#3b82f6'];

    return (
        <div className="p-4 md:p-8 bg-[var(--bg)] min-h-screen space-y-8 font-['DM_Sans']">
            {/* Header & Primary Question */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">School Overview</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        Is the school financially stable and fully attended today?
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LiveBadge text="Live Data" />
                </div>
            </div>

            {/* Critical Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert, i) => (
                        <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CriticalBadge count={1} />
                                <span className="text-red-800 text-sm font-medium">{alert.message}</span>
                            </div>
                            {alert.actionUrl && (
                                <a href={alert.actionUrl} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                                    Take Action &rarr;
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Fees Collected"
                    value={formatCurrency(stats.feesCollected)}
                    subValue={`Target: ${formatCurrency(stats.feeTarget)}`}
                    trend={((stats.feesCollected / stats.feeTarget) * 100) > 50 ? 'up' : 'down'}
                    trendValue={Math.round((stats.feesCollected / stats.feeTarget) * 100) + '% of target'}
                    type="currency"
                    icon={<span className="text-2xl">💰</span>}
                    sparklineData={finances.map(f => f.collected)}
                />
                <StatCard
                    title="Today's Attendance"
                    value={`${stats.attendanceRate}%`}
                    subValue={`${stats.present} Present • ${stats.absent} Absent`}
                    trend={parseFloat(stats.attendanceRate) >= 90 ? 'up' : 'down'}
                    trendValue="vs yesterday"
                    type="percentage"
                    icon={<span className="text-2xl">👥</span>}
                    sparklineData={attendanceTrend.map(a => a.present)}
                />
                <StatCard
                    title="Total Students"
                    value={formatNumber(stats.totalStudents)}
                    subValue={`${stats.newThisTerm} new this term`}
                    trend="up"
                    trendValue="+2% term/term"
                    type="number"
                    icon={<span className="text-2xl">🎓</span>}
                />
                <StatCard
                    title="Staff Presence"
                    value={`${stats.activeStaff}`}
                    subValue={`${stats.staffOnLeave} on leave`}
                    trend="neutral"
                    trendValue="Optimal"
                    type="number"
                    icon={<span className="text-2xl">👨‍🏫</span>}
                />
            </div>

            {/* Charts Section 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Performance */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Financial Performance (30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={finances} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} tickFormatter={(val) => `GHS${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                    formatter={(value: number) => [formatCurrency(value), 'Collected']}
                                />
                                <Area type="monotone" dataKey="collected" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                                <Line type="monotone" dataKey="target" stroke="var(--faint)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Trend */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Attendance Trend (7 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <Tooltip 
                                    cursor={{ fill: 'var(--bg)' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="present" name="Present" fill="var(--primary)" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="late" name="Late" fill="var(--amber)" radius={[0, 0, 0, 0]} stackId="a" />
                                <Bar dataKey="absent" name="Absent" fill="var(--danger)" radius={[4, 4, 0, 0]} stackId="b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fee Status Breakdown */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Fee Status Breakdown</h3>
                    <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={feeStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {feeStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => `${val}%`} contentStyle={{ borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-[var(--text)]">{feeStatus[0]?.value || 0}%</span>
                                <span className="block text-xs text-[var(--muted)]">Paid</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {feeStatus.map((status, i) => (
                            <div key={status.name} className="flex items-center gap-1.5 text-sm text-[var(--text)]">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                {status.name} ({status.value}%)
                            </div>
                        ))}
                    </div>
                </div>

                {/* Class Performance Highlight */}
                <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Class Performance Highlights</h3>
                        <button className="text-sm text-[var(--primary)] font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[var(--muted)] uppercase bg-[var(--bg)] border-y border-[var(--border)]">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Class</th>
                                    <th className="px-4 py-3 font-medium">Avg Score</th>
                                    <th className="px-4 py-3 font-medium">Attendance</th>
                                    <th className="px-4 py-3 font-medium">Fees Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {classPerformance.slice(0, 4).map(cls => (
                                    <tr key={cls.id} className="hover:bg-[var(--bg)] transition-colors">
                                        <td className="px-4 py-3 font-medium text-[var(--text)]">{cls.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-mono ${cls.avgScore >= 70 ? 'text-[var(--primary)]' : 'text-[var(--amber)]'}`}>
                                                    {cls.avgScore}%
                                                </span>
                                                <MiniSparkline data={[50, 60, cls.avgScore]} width={40} height={16} color="currentColor" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[var(--text)]">{cls.attendancePercent}%</td>
                                        <td className="px-4 py-3 text-[var(--text)]">{cls.feesPaidPercent}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
