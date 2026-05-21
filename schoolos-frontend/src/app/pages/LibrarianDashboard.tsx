import React from 'react';
import { useLibrarianDashboard } from '../hooks/useLibrarianDashboard';
import { StatCard } from '../components/shared/StatCard';
import { DashboardSkeleton } from '../components/shared/DashboardSkeleton';
import { SectionError } from '../components/shared/SectionError';
import { LiveBadge } from '../components/shared/LiveBadge';
import { ProgressBar } from '../components/shared/ProgressBar';
import { formatCurrency } from '../utils/formatters';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, Cell
} from 'recharts';

export default function LibrarianDashboard() {
    const {
        stats, circulationTrend, overdueBreakdown, overdueItems, activity, lowStock, topBooks,
        loading, error
    } = useLibrarianDashboard();

    if (loading) return <DashboardSkeleton sections={4} cardsPerSection={4} />;
    if (error) return <div className="p-6"><SectionError message={error} /></div>;
    if (!stats) return <div className="p-6">No data available</div>;

    return (
        <div className="p-4 md:p-8 bg-[var(--bg)] min-h-screen space-y-8 font-['DM_Sans']">
            {/* Header & Primary Question */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Library Dashboard</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        Are there overdue books and what titles are running low on stock?
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LiveBadge text="Live Data" />
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Today's Circulation"
                    value={stats.issuedToday + stats.returnedToday}
                    subValue={`${stats.issuedToday} Issued • ${stats.returnedToday} Returned`}
                    trend={stats.issuedToday + stats.returnedToday > 15 ? 'up' : 'down'}
                    trendValue="vs yesterday"
                    type="number"
                    icon={<span className="text-2xl">🔄</span>}
                />
                <StatCard
                    title="Currently Issued"
                    value={stats.currentlyIssued}
                    subValue={`${stats.overdueCount} overdue`}
                    trend="up"
                    trendValue="Active checkouts"
                    type="number"
                    icon={<span className="text-2xl">📖</span>}
                />
                <StatCard
                    title="Overdue Action"
                    value={stats.overdueCount}
                    subValue={`Potential Fines: ${formatCurrency(stats.potentialFines)}`}
                    trend="down"
                    trendValue="Needs follow-up"
                    type="number"
                    icon={<span className="text-2xl">⚠️</span>}
                />
                <StatCard
                    title="Inventory Alert"
                    value={stats.lowStockTitles}
                    subValue={`${stats.outOfStockTitles} out of stock`}
                    trend="down"
                    trendValue="Titles need restock"
                    type="number"
                    icon={<span className="text-2xl">📉</span>}
                />
            </div>

            {/* Charts Section 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Circulation Trend */}
                <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Circulation Trend (30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={circulationTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Area type="monotone" dataKey="issues" name="Issued" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorIssues)" />
                                <Area type="monotone" dataKey="returns" name="Returned" stroke="var(--info)" strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Overdue Breakdown */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Overdue Aging</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overdueBreakdown} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text)', fontWeight: 500 }} width={80} />
                                <Tooltip 
                                    cursor={{ fill: 'var(--bg)' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                                />
                                <Bar dataKey="count" name="Books" radius={[0, 4, 4, 0]}>
                                    {overdueBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === overdueBreakdown.length - 1 ? 'var(--danger)' : index === overdueBreakdown.length - 2 ? 'var(--amber)' : 'var(--primary)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Low Stock & Out of Stock */}
                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Inventory Alerts</h3>
                        <button className="text-sm text-[var(--primary)] font-medium hover:underline">View All</button>
                    </div>
                    <div className="flex-1 space-y-4">
                        {lowStock.map(book => (
                            <div key={book.id} className="flex justify-between items-center pb-3 border-b border-[var(--border)] last:border-0 last:pb-0">
                                <div className="flex-1 truncate pr-4">
                                    <p className="font-semibold text-sm text-[var(--text)] truncate">{book.title}</p>
                                    <p className="text-xs text-[var(--muted)] truncate">{book.author} • {book.category}</p>
                                </div>
                                <div className="text-right flex-shrink-0 w-16">
                                    <p className={`font-bold text-lg ${book.available === 0 ? 'text-[var(--danger)]' : 'text-[var(--amber)]'}`}>
                                        {book.available}
                                    </p>
                                    <p className="text-[10px] text-[var(--muted)]">of {book.total}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overdue Items List */}
                <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Overdue Returns</h3>
                        <button className="text-sm text-[var(--primary)] font-medium hover:underline">Send Reminders</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[var(--muted)] uppercase bg-[var(--bg)] border-y border-[var(--border)]">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Book Title</th>
                                    <th className="px-4 py-3 font-medium">Member</th>
                                    <th className="px-4 py-3 font-medium">Overdue By</th>
                                    <th className="px-4 py-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {overdueItems.slice(0, 5).map(item => (
                                    <tr key={item.id} className="hover:bg-[var(--bg)] transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[var(--text)]">{item.bookTitle}</p>
                                            <p className="text-xs text-[var(--muted)]">Issued: {new Date(item.issueDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[var(--text)]">{item.memberName}</p>
                                            <p className="text-xs text-[var(--muted)]">{item.department}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${item.daysOverdue > 14 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {item.daysOverdue} days
                                            </span>
                                            {item.fine > 0 && <p className="text-xs text-[var(--danger)] mt-1">Fine: {formatCurrency(item.fine)}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-[var(--primary)] font-medium hover:underline">Remind</button>
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
