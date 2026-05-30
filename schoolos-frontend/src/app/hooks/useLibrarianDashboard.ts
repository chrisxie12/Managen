import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface LibrarianStats {
    issuedToday: number;
    returnedToday: number;
    currentlyIssued: number;
    overdueCount: number;
    potentialFines: number;
    totalBooks: number;
    availableBooks: number;
    lowStockTitles: number;
    outOfStockTitles: number;
}

export interface CirculationTrend {
    date: string;
    issues: number;
    returns: number;
}

export interface OverdueBreakdown {
    category: string;
    count: number;
}

export interface OverdueItem {
    id: string;
    memberName: string;
    memberType: string;
    bookTitle: string;
    department: string;
    issueDate: string;
    daysOverdue: number;
    fine: number;
}

export interface LibraryActivity {
    id: string;
    type: 'issue' | 'return';
    memberName: string;
    bookTitle: string;
    timestamp: string;
}

export interface LowStockBook {
    id: string;
    title: string;
    author: string;
    category: string;
    available: number;
    total: number;
}

export interface TopBook {
    id: string;
    rank: number;
    title: string;
    author: string;
    issueCount: number;
    category: string;
    available: boolean;
}

export function useLibrarianDashboard() {
    const [stats, setStats] = useState<LibrarianStats | null>(null);
    const [circulationTrend, setCirculationTrend] = useState<CirculationTrend[]>([]);
    const [overdueBreakdown, setOverdueBreakdown] = useState<OverdueBreakdown[]>([]);
    const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([]);
    const [activity, setActivity] = useState<LibraryActivity[]>([]);
    const [lowStock, setLowStock] = useState<LowStockBook[]>([]);
    const [topBooks, setTopBooks] = useState<TopBook[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    statsRes, circRes, breakRes, overdueRes, actRes, lowRes, topRes
                ] = await Promise.all([
                    api.get<any>('/api/school/library/dashboard/stats'),
                    api.get<any>('/api/school/library/circulation-trend'),
                    api.get<any>('/api/school/library/overdue-breakdown'),
                    api.get<any>('/api/school/library/overdue?limit=10'),
                    api.get<any>('/api/school/library/activity?limit=10'),
                    api.get<any>('/api/school/library/low-stock?limit=8'),
                    api.get<any>('/api/school/library/top-books?limit=6')
                ]);

                // dashboard.js returns { data: <actual_value> }
                setStats(statsRes.data || null);
                setCirculationTrend(circRes.data || []);
                setOverdueBreakdown(breakRes.data || []);
                setOverdueItems(overdueRes.data || []);
                setActivity(actRes.data || []);
                setLowStock(lowRes.data || []);
                setTopBooks(topRes.data || []);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching librarian dashboard:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        stats, circulationTrend, overdueBreakdown, overdueItems, activity, lowStock, topBooks,
        loading, error
    };
}
