/**
 * MEDICAL VALIDATION HOOK
 * React hook to access validated medical results and inject context into AI
 */

import { useState, useCallback } from 'react';
import { ValidatedAnalysis, MedicalResult } from '@/medical-core/types';

interface UseMedicalValidationReturn {
    validatedResults: MedicalResult[] | null;
    setValidatedResults: (results: MedicalResult[]) => void;
    getMedicalContext: () => any;
    hasCriticalValues: boolean;
    criticalResults: MedicalResult[];
}

/**
 * Hook to manage validated medical results and create context for AI
 */
export function useMedicalValidation(): UseMedicalValidationReturn {
    const [validatedResults, setResults] = useState<MedicalResult[] | null>(null);

    const setValidatedResults = useCallback((results: MedicalResult[]) => {
        setResults(results);
    }, []);

    const getMedicalContext = useCallback(() => {
        if (!validatedResults || validatedResults.length === 0) {
            return null;
        }

        return {
            results: validatedResults.map(result => ({
                parameterId: result.parameterId,
                value: result.value,
                unit: result.unit,
                status: result.status,
                flags: result.flags,
                riskLevel: result.riskLevel
            }))
        };
    }, [validatedResults]);

    const criticalResults = validatedResults
        ? validatedResults.filter(r => r.flags.includes('CRITICAL'))
        : [];

    const hasCriticalValues = criticalResults.length > 0;

    return {
        validatedResults,
        setValidatedResults,
        getMedicalContext,
        hasCriticalValues,
        criticalResults
    };
}
