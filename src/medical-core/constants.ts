/**
 * MEDICAL-GRADE CONSTANTS
 * This file contains all critical medical thresholds and reference ranges.
 * Changes to these values should be audited and approved by medical professionals.
 */

// Critical thresholds for CBC parameters
export const CBC_CRITICAL_THRESHOLDS = {
    hemoglobin: {
        criticalLow: 7.0,
        criticalHigh: 20.0,
    },
    wbc: {
        criticalLow: 2.0,
        criticalHigh: 30.0,
    },
    platelets: {
        criticalLow: 30.0,
        criticalHigh: 1000.0,
    },
    rbc: {
        criticalLow: 2.5,
        criticalHigh: 7.0,
    },
} as const;

// Critical thresholds for other blood test parameters
export const BLOOD_TEST_CRITICAL_THRESHOLDS = {
    // Glucose critical levels
    fastingGlucose: { criticalLow: 50, criticalHigh: 250 },
    randomGlucose: { criticalLow: 50, criticalHigh: 300 },
    hba1c: { criticalHigh: 10.0 },

    // Lipid critical levels
    totalCholesterol: { criticalHigh: 300 },
    ldlCholesterol: { criticalHigh: 190 },
    hdlCholesterol: { criticalLow: 25 },
    triglycerides: { criticalHigh: 500 },

    // Thyroid critical levels
    tsh: { criticalLow: 0.1, criticalHigh: 10.0 },
    freeT4: { criticalLow: 0.4, criticalHigh: 3.0 },
    freeT3: { criticalLow: 1.0, criticalHigh: 8.0 },

    // Liver critical levels
    alt: { criticalHigh: 200 },
    ast: { criticalHigh: 200 },
    totalBilirubin: { criticalHigh: 5.0 },

    // Kidney critical levels
    creatinine: { criticalHigh: 3.0 },
    bun: { criticalHigh: 100 },
    egfr: { criticalLow: 30 },

    // Cardiac critical levels
    troponinI: { criticalHigh: 0.4 },
    troponinT: { criticalHigh: 0.1 },

    // Inflammatory critical levels
    crp: { criticalHigh: 50 },
    esr: { criticalHigh: 100 },

    // Electrolytes critical levels
    sodium: { criticalLow: 125, criticalHigh: 155 },
    potassium: { criticalLow: 2.5, criticalHigh: 6.0 },
    calcium: { criticalLow: 7.0, criticalHigh: 12.0 },

    // Coagulation critical levels
    pt: { criticalHigh: 25 },
    inr: { criticalHigh: 4.0 },
    aptt: { criticalHigh: 60 },
} as const;

// Plausibility limits (biologically impossible values)
export const PLAUSIBILITY_LIMITS = {
    hemoglobin: { min: 1.0, max: 25.0 },
    wbc: { min: 0.1, max: 100.0 },
    platelets: { min: 1.0, max: 2000.0 },
    glucose: { min: 10, max: 600 },
    totalCholesterol: { min: 50, max: 500 },
} as const;

// Value types for medical flags
export type MedicalFlag =
    | 'IMPLAUSIBLE'
    | 'URGENT'
    | 'CRITICAL'
    | 'RELATIONSHIP_ANEMIA'
    | 'RELATIONSHIP_INFECTION'
    | 'RELATIONSHIP_BLEEDING'
    | 'RELATIONSHIP_POLYCYTHEMIA';

// Status codes (deterministic, no ambiguity)
export type MedicalStatus =
    | 'NORMAL'
    | 'LOW'
    | 'HIGH'
    | 'CRITICAL_LOW'
    | 'CRITICAL_HIGH';
