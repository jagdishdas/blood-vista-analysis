/**
 * MEDICAL VALIDATION ENGINE
 * Pure deterministic logic - NO strings, NO UI concerns
 */

import {
    CBC_CRITICAL_THRESHOLDS,
    BLOOD_TEST_CRITICAL_THRESHOLDS,
    PLAUSIBILITY_LIMITS,
    MedicalFlag,
    MedicalStatus
} from './constants';
import { MedicalResult, PatientContext } from './types';

/**
 * Calculate deviation from normal range
 */
export function calculateDeviation(value: number, min: number, max: number): number {
    if (value < min) {
        return ((value - min) / min) * 100;
    } else if (value > max) {
        return ((value - max) / max) * 100;
    }
    return 0;
}

/**
 * Determine status based on value and thresholds
 */
export function determineStatus(
    value: number,
    min: number,
    max: number,
    parameterId: string
): MedicalStatus {
    // Check critical thresholds first
    const cbcThreshold = CBC_CRITICAL_THRESHOLDS[parameterId as keyof typeof CBC_CRITICAL_THRESHOLDS];
    const bloodThreshold = BLOOD_TEST_CRITICAL_THRESHOLDS[parameterId as keyof typeof BLOOD_TEST_CRITICAL_THRESHOLDS];

    const threshold = cbcThreshold || bloodThreshold;

    if (threshold) {
        if ('criticalLow' in threshold && value < threshold.criticalLow) {
            return 'CRITICAL_LOW';
        }
        if ('criticalHigh' in threshold && value > threshold.criticalHigh) {
            return 'CRITICAL_HIGH';
        }
    }

    // Standard range check
    if (value < min) return 'LOW';
    if (value > max) return 'HIGH';
    return 'NORMAL';
}

/**
 * Check for implausible values
 */
export function checkPlausibility(parameterId: string, value: number): boolean {
    const limits = PLAUSIBILITY_LIMITS[parameterId as keyof typeof PLAUSIBILITY_LIMITS];
    if (!limits) return true; // No limits defined = assume plausible

    return value >= limits.min && value <= limits.max;
}

/**
 * Calculate risk level based on status and deviation
 */
export function calculateRiskLevel(
    status: MedicalStatus,
    deviation: number,
    parameterId: string
): 'low' | 'moderate' | 'high' | 'critical' {
    if (status.includes('CRITICAL')) return 'critical';

    // High-risk parameters (cardiovascular, metabolic)
    const highRiskParameters = [
        'ldlCholesterol', 'triglycerides', 'hba1c', 'fastingGlucose',
        'troponinI', 'troponinT', 'creatinine', 'bun'
    ];

    const moderateThreshold = highRiskParameters.includes(parameterId) ? 20 : 30;

    if (Math.abs(deviation) > 50) return 'high';
    if (Math.abs(deviation) > moderateThreshold) return 'moderate';
    return 'low';
}

/**
 * Identify specific medical flags for a result
 */
export function identifyFlags(
    parameterId: string,
    value: number,
    status: MedicalStatus
): MedicalFlag[] {
    const flags: MedicalFlag[] = [];

    // Check plausibility
    if (!checkPlausibility(parameterId, value)) {
        flags.push('IMPLAUSIBLE');
    }

    // Critical status
    if (status.includes('CRITICAL')) {
        flags.push('CRITICAL');
        flags.push('URGENT');
    }

    return flags;
}

/**
 * Validate a single blood test parameter
 */
export function validateParameter(
    parameterId: string,
    value: number,
    unit: string,
    referenceRange: { min: number; max: number },
    context?: PatientContext
): MedicalResult {
    const status = determineStatus(value, referenceRange.min, referenceRange.max, parameterId);
    const deviation = calculateDeviation(value, referenceRange.min, referenceRange.max);
    const riskLevel = calculateRiskLevel(status, deviation, parameterId);
    const flags = identifyFlags(parameterId, value, status);

    return {
        parameterId,
        value,
        unit,
        referenceRange,
        status,
        deviation,
        flags,
        riskLevel,
    };
}

/**
 * Analyze relationships between parameters (e.g., anemia patterns)
 */
export function analyzeRelationships(results: MedicalResult[]): MedicalFlag[] {
    const relationshipFlags: MedicalFlag[] = [];
    const resultMap = new Map(results.map(r => [r.parameterId, r]));

    // Anemia patterns
    const hb = resultMap.get('hemoglobin');
    const mcv = resultMap.get('mcv');

    if (hb && hb.status === 'LOW' && mcv) {
        relationshipFlags.push('RELATIONSHIP_ANEMIA');
    }

    // Infection patterns
    const wbc = resultMap.get('wbc');
    const neutrophils = resultMap.get('neutrophils');

    if (wbc && wbc.status === 'HIGH' && neutrophils && neutrophils.status === 'HIGH') {
        relationshipFlags.push('RELATIONSHIP_INFECTION');
    }

    // Bleeding disorder
    const platelets = resultMap.get('platelets');

    if (platelets && platelets.status === 'LOW') {
        relationshipFlags.push('RELATIONSHIP_BLEEDING');
    }

    // Polycythemia
    const rbc = resultMap.get('rbc');
    const hematocrit = resultMap.get('hematocrit');

    if (hb && hb.status === 'HIGH' &&
        rbc && rbc.status === 'HIGH' &&
        hematocrit && hematocrit.status === 'HIGH') {
        relationshipFlags.push('RELATIONSHIP_POLYCYTHEMIA');
    }

    return relationshipFlags;
}
