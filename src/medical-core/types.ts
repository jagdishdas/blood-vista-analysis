/**
 * MEDICAL-GRADE TYPE DEFINITIONS
 * These types represent validated medical data structures.
 */

import { MedicalFlag, MedicalStatus } from './constants';

/**
 * Core validated medical result (NO UI STRINGS)
 * This is the "source of truth" returned by the validation engine.
 */
export interface MedicalResult {
    parameterId: string;
    value: number;
    unit: string;
    referenceRange: {
        min: number;
        max: number;
    };
    status: MedicalStatus;
    deviation: number; // Percentage deviation from normal
    flags: MedicalFlag[];
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

/**
 * Patient context for medical validation
 */
export interface PatientContext {
    age: number;
    ageInMonths?: number;
    gender: 'male' | 'female';
    conditions?: string[]; // Pre-existing conditions
}

/**
 * Complete validated analysis result
 */
export interface ValidatedAnalysis {
    testType: string;
    overallRisk: 'low' | 'moderate' | 'high' | 'critical';
    results: MedicalResult[];
    relationshipFlags: MedicalFlag[]; // Cross-parameter relationships
    timestamp: number;
}

/**
 * Content reference (points to interpretation/recommendation text)
 */
export interface ContentReference {
    parameterId: string;
    status: MedicalStatus;
    contentKey: string; // e.g., "HEMOGLOBIN_LOW"
}
