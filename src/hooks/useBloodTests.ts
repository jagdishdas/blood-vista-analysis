/**
 * BLOOD TEST PERSISTENCE HOOK
 * React hook for saving and retrieving blood tests
 */

import { useState, useEffect } from 'react';
import {
    saveBloodTest,
    getBloodTestHistory,
    getBloodTestById,
    getParameterTrend,
    deleteBloodTest
} from '@/services/bloodTestService';
import { MedicalResult } from '@/medical-core/types';
import { Database } from '@/integrations/supabase/types';

type BloodTest = Database['public']['Tables']['blood_tests']['Row'];

export function useBloodTests() {
    const [history, setHistory] = useState<BloodTest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        try {
            setIsLoading(true);
            const data = await getBloodTestHistory();
            setHistory(data as BloodTest[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    }

    async function saveTest(
        testType: string,
        testDate: string,
        results: MedicalResult[],
        overallRisk: 'low' | 'moderate' | 'high' | 'critical',
        summaryEn: string,
        summaryUr: string,
        relationshipFlags: string[],
        labName?: string
    ) {
        try {
            setError(null);
            const savedTest = await saveBloodTest(
                testType,
                testDate,
                results,
                overallRisk,
                summaryEn,
                summaryUr,
                relationshipFlags,
                labName
            );

            // Refresh history
            await loadHistory();

            return savedTest;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save test';
            setError(message);
            throw new Error(message);
        }
    }

    async function getTest(testId: string) {
        try {
            setError(null);
            return await getBloodTestById(testId);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to get test';
            setError(message);
            throw new Error(message);
        }
    }

    async function getTrend(parameterId: string, limit = 5) {
        try {
            setError(null);
            return await getParameterTrend(parameterId, limit);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to get trend';
            setError(message);
            return [];
        }
    }

    async function removeTest(testId: string) {
        try {
            setError(null);
            await deleteBloodTest(testId);
            await loadHistory();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete test';
            setError(message);
            throw new Error(message);
        }
    }

    return {
        history,
        isLoading,
        error,
        saveTest,
        getTest,
        getTrend,
        removeTest,
        refreshHistory: loadHistory
    };
}
