import { useState, useEffect } from 'react';
import api from '../../services/api';

export interface AccountantStats {
    todayAmount: number;
    todayCount: number;
    termAmount: number;
    target: number;
    percent: number;
    outstandingAmount: number;
    defaulterCount: number;
    incomeAmount: number;
    expenseCount: number;
    expenseAmount: number;
    netBalance: number;
}

export interface FeeTrend {
    month: string;
    collected: number;
    target: number;
}

export interface PaymentMode {
    name: string;
    value: number;
}

export interface IncomeExpense {
    month: string;
    income: number;
    expense: number;
}

export interface FeeStatusDetail {
    fullyPaid: { count: number; amount: number; percent: number };
    partiallyPaid: { count: number; amountCollected: number; amountRemaining: number };
    notPaid: { count: number; amount: number };
}

export interface ClassCollection {
    id: string;
    className: string;
    collected: number;
    target: number;
    percent: number;
    defaulters: number;
}

export function useAccountantDashboard() {
    const [stats, setStats] = useState<AccountantStats | null>(null);
    const [feeTrend, setFeeTrend] = useState<FeeTrend[]>([]);
    const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
    const [incomeExpense, setIncomeExpense] = useState<IncomeExpense[]>([]);
    const [feeStatusDetail, setFeeStatusDetail] = useState<FeeStatusDetail | null>(null);
    const [classCollection, setClassCollection] = useState<ClassCollection[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    statsRes, trendRes, modesRes, incomeRes, detailRes, classRes
                ] = await Promise.all([
                    api.get('/school/accountant/dashboard/stats'),
                    api.get('/school/accountant/fee-trend'),
                    api.get('/school/accountant/payment-modes'),
                    api.get('/school/accountant/income-expense'),
                    api.get('/school/accountant/fee-status-detail'),
                    api.get('/school/accountant/class-collection')
                ]);

                setStats(statsRes.data?.data || null);
                setFeeTrend(trendRes.data?.data || []);
                setPaymentModes(modesRes.data?.data || []);
                setIncomeExpense(incomeRes.data?.data || []);
                setFeeStatusDetail(detailRes.data?.data || null);
                setClassCollection(classRes.data?.data || []);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching accountant dashboard:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { 
        stats, feeTrend, paymentModes, incomeExpense, feeStatusDetail, classCollection,
        loading, error 
    };
}
