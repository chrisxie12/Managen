import React from 'react';
import { useAccountantDashboard } from '../hooks/useAccountantDashboard';
import { StatCard } from '../components/shared/StatCard';
import { DashboardSkeleton } from '../components/shared/DashboardSkeleton';
import { SectionError } from '../components/shared/SectionError';
import { LiveBadge } from '../components/shared/LiveBadge';
import { ProgressBar } from '../components/shared/ProgressBar';
import { formatCurrency } from '../utils/formatters';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function AccountantDashboard() {
    const {
        stats, feeTrend, paymentModes, incomeExpense, feeStatusDetail, classCollection,
        loading, error
    } = useAccountantDashboard();

    if (loading) return <DashboardSkeleton sections={4} cardsPerSection={4} />;
    if (error) return <div className="p-6"><SectionError message={error} /></div>;
    if (!stats) return <div className="p-6">No data available</div>;

    const COLORS = ['#1a6b4a', '#3b82f6', '#f59e0b', '#8b5cf6'];

    return (
        <div className="p-4 md:p-8 bg-[var(--bg)] min-h-screen space-y-8 font-['DM_Sans']">
            {/* Header & Primary Question */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Finance Overview</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        What is our current cash flow and are we hitting fee collection targets?
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LiveBadge text="Live Sync" />
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Collected Today"
                    value={formatCurrency(stats.todayAmount)}
                    subValue={`${stats.todayCount} transactions`}
                    trend={stats.todayAmount > 2000 ? 'up' : 'down'}
                    trendValue="vs yesterday"
                    type="currency"
                    icon={<span className="text-2xl">💵</span>}
                />
                <StatCard
                    title="Term Collection"
                    value={formatCurrency(stats.termAmount)}
                    subValue={`Target: ${formatCurrency(stats.target)}`}
                    trend="neutral"
                    trendValue={`${stats.percent}% of target`}
                    type="currency"
                    icon={<span className="text-2xl">🏦</span>}
                    sparklineData={feeTrend.map(f => f.collected)}
                />
                <StatCard
                    title="Outstanding Fees"
                    value={formatCurrency(stats.outstandingAmount)}
                    subValue={`${stats.defaulterCount} students owe fees`}
                    trend="down"
                    trendValue="Needs attention"
                    type="currency"
                    icon={<span className="text-2xl">⚠️</span>}
                />
                <StatCard
                    title="Net Balance"
                    value={formatCurrency(stats.netBalance)}
                    subValue={`In: ${formatCurrency(stats.incomeAmount)} | Out: ${formatCurrency(stats.expenseAmount)}`}
                    trend={stats.netBalance > 0 ? 'up' : 'down'}
                    trendValue="This month"
                    type="currency"
                    icon={<span className="text-2xl">⚖️</span>}
                />
            </div>

            {/* Charts Section 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Cash Flow (Income vs Expense)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={incomeExpense} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} tickFormatter={(val) => `GHS${val/1000}k`} />
                                <Tooltip 
                                    cursor={{ fill: 'var(--bg)' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="income" name="Income" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Collection Trend */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Fee Collection Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={feeTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--faint)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--faint)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} tickFormatter={(val) => `GHS${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px' }} />
                                <Area type="step" dataKey="target" name="Target" stroke="var(--faint)" strokeWidth={2} fillOpacity={1} fill="url(#colorTarget)" />
                                <Bar dataKey="collected" name="Collected" fill="var(--primary)" barSize={20} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fee Status Detail */}
                {feeStatusDetail && (
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Overall Fee Status</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-[var(--text)]">Fully Paid</span>
                                    <span className="font-medium text-[var(--text)]">{formatCurrency(feeStatusDetail.fullyPaid.amount)}</span>
                                </div>
                                <ProgressBar progress={feeStatusDetail.fullyPaid.percent} color="var(--primary)" size="md" />
                                <p className="text-xs text-[var(--muted)] mt-1">{feeStatusDetail.fullyPaid.count} students</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-[var(--text)]">Partially Paid</span>
                                    <span className="font-medium text-[var(--text)]">{formatCurrency(feeStatusDetail.partiallyPaid.amountCollected)}</span>
                                </div>
                                <ProgressBar progress={50} color="var(--amber)" size="md" />
                                <p className="text-xs text-[var(--muted)] mt-1">{feeStatusDetail.partiallyPaid.count} students • {formatCurrency(feeStatusDetail.partiallyPaid.amountRemaining)} remaining</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-[var(--text)]">Not Paid</span>
                                    <span className="font-medium text-[var(--text)]">{formatCurrency(feeStatusDetail.notPaid.amount)}</span>
                                </div>
                                <ProgressBar progress={100} color="var(--danger)" size="md" />
                                <p className="text-xs text-[var(--muted)] mt-1">{feeStatusDetail.notPaid.count} students</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Modes */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Payment Methods</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentModes}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {paymentModes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: '8px' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Class Collection Target */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Class Targets</h3>
                        <button className="text-sm text-[var(--primary)] font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[var(--muted)] uppercase bg-[var(--bg)] border-y border-[var(--border)]">
                                <tr>
                                    <th className="px-3 py-2 font-medium">Class</th>
                                    <th className="px-3 py-2 font-medium">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {classCollection.map(cls => (
                                    <tr key={cls.id}>
                                        <td className="px-3 py-2 font-medium text-[var(--text)] whitespace-nowrap">{cls.className}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <ProgressBar progress={cls.percent} color={cls.percent >= 80 ? 'var(--primary)' : 'var(--amber)'} size="sm" />
                                                </div>
                                                <span className="text-xs text-[var(--muted)] font-mono">{cls.percent}%</span>
                                            </div>
                                        </td>
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
