/**
 * MEDICAL ANALYZER ADAPTER
 * Bridges the old analyzer interface with the new validation engine
 */

import { validateParameter, analyzeRelationships, type MedicalResult, type PatientContext } from '@/medical-core/validation-engine';
import { getInterpretation, getRecommendations } from '@/lib/content/medical-content';
import { getRelationshipInterpretation } from './relationship-interpreter';
import type { CBCFormData, CBCAnalysis, CBCResult } from '@/types/cbc.types';
import type { BloodTestFormData, BloodTestAnalysis, BloodTestResult } from '@/types/blood-test.types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Convert MedicalResult to CBCResult (backward compatibility)
 */
function medicalResultToCBCResult(
    medicalResult: MedicalResult,
    parameter: any
): CBCResult {
    const interpretation = getInterpretation(medicalResult.parameterId, medicalResult.status);

    // Map status back to old format
    const statusMap: Record<string, 'normal' | 'low' | 'high'> = {
        'NORMAL': 'normal',
        'LOW': 'low',
        'HIGH': 'high',
        'CRITICAL_LOW': 'low',
        'CRITICAL_HIGH': 'high'
    };

    return {
        parameter,
        status: statusMap[medicalResult.status] || 'normal',
        deviation: medicalResult.deviation,
        interpretation
    };
}

/**
 * Convert MedicalResult to BloodTestResult (backward compatibility)
 */
function medicalResultToBloodTestResult(
    medicalResult: MedicalResult,
    parameter: any
): BloodTestResult {
    const interpretation = getInterpretation(medicalResult.parameterId, medicalResult.status);
    const recommendations = getRecommendations(medicalResult.parameterId, medicalResult.status);

    // Map status back to old format
    const statusMap: Record<string, 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high'> = {
        'NORMAL': 'normal',
        'LOW': 'low',
        'HIGH': 'high',
        'CRITICAL_LOW': 'critical-low',
        'CRITICAL_HIGH': 'critical-high'
    };

    return {
        parameter,
        status: statusMap[medicalResult.status] || 'normal',
        deviation: medicalResult.deviation,
        riskLevel: medicalResult.riskLevel,
        interpretation,
        recommendations: {
            en: recommendations.map(r => r.en),
            ur: recommendations.map(r => r.ur)
        }
    };
}

/**
 * Analyze CBC using new validation engine with AI enhancement
 */
export async function analyzeCBC(data: CBCFormData): Promise<CBCAnalysis> {
    const context: PatientContext = {
        age: data.patientAge || 30,
        gender: (data.patientGender as 'male' | 'female') || 'male'
    };

    // Validate each parameter
    const medicalResults: MedicalResult[] = data.parameters
        .filter(param => param.value !== '')
        .map(param => {
            const value = parseFloat(param.value);
            return validateParameter(
                param.id,
                value,
                param.unit,
                param.referenceRange,
                context
            );
        });

    // Analyze relationships
    const relationshipFlags = analyzeRelationships(medicalResults);

    // Convert to old format
    const results: CBCResult[] = medicalResults.map((mr, idx) =>
        medicalResultToCBCResult(mr, data.parameters[idx])
    );

    // Generate summary
    const abnormalResults = results.filter(r => r.status !== 'normal');
    const criticalResults = medicalResults.filter(r => r.flags.includes('CRITICAL'));

    // Generate rule-based summary as fallback
    let summaryEn = '';
    let summaryUr = '';

    if (criticalResults.length > 0) {
        summaryEn = `CRITICAL ALERT: ${criticalResults.length} parameters show critical values requiring immediate medical attention. Please contact your healthcare provider immediately.`;
        summaryUr = `تشویشناک انتباہ: ${criticalResults.length} پیرامیٹرز میں تشویشناک قدریں ہیں جن کے لیے فوری طبی توجہ درکار ہے۔ براہ کرم فوری طور پر اپنے صحت کی دیکھ بھال فراہم کنندہ سے رابطہ کریں۔`;
    } else if (abnormalResults.length === 0) {
        summaryEn = "Good news! All your blood test results are within normal ranges. This suggests your blood cells and related components are at healthy levels.";
        summaryUr = "اچھی خبر! آپ کے خون کے ٹیسٹ کے تمام نتائج معمول کی حدود میں ہیں۔ اس سے پتہ چلتا ہے کہ آپ کے خون کے خلیات اور متعلقہ اجزاء صحت مند سطح پر ہیں۔";
    } else {
        const lowCount = abnormalResults.filter(r => r.status === 'low').length;
        const highCount = abnormalResults.filter(r => r.status === 'high').length;
        summaryEn = `Your blood test results show ${abnormalResults.length} values that are outside the normal range (${lowCount} low and ${highCount} high). `;
        summaryUr = `آپ کے خون کے ٹیسٹ کے نتائج ${abnormalResults.length} قدروں کو دکھاتے ہیں جو معمول کی حد سے باہر ہیں (${lowCount} کم اور ${highCount} زیادہ)۔ `;

        // Add relationship findings
        relationshipFlags.forEach(flag => {
            const relInterpretation = getRelationshipInterpretation(flag);
            if (relInterpretation) {
                summaryEn += relInterpretation.en + ' ';
                summaryUr += relInterpretation.ur + ' ';
            }
        });

        summaryEn += "Please discuss these results with your healthcare provider to understand what they mean for your overall health.";
        summaryUr += "براہ کرم ان نتائج کے بارے میں اپنے ہیلتھ کیئر فراہم کنندہ سے بات کریں تاکہ آپ سمجھ سکیں کہ ان کا آپ کی مجموعی صحت کے لیے کیا مطلب ہے۔";
    }

    // Try AI enhancement (if available)
    try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('blood-analysis-enhance', {
            body: {
                testType: 'cbc',
                results: medicalResults,
                relationshipFlags,
                patientContext: {
                    age: data.patientAge || 30,
                    gender: data.patientGender as 'male' | 'female' || 'male'
                }
            }
        });

        if (!aiError && aiData?.enhancedSummary?.en) {
            summaryEn = aiData.enhancedSummary.en;
            summaryUr = aiData.enhancedSummary.ur || summaryUr;
            console.log('✓ AI enhancement successful (provider: ' + aiData.provider + ')');
        } else if (aiError) {
            console.warn('AI enhancement error:', aiError);
        }
    } catch (error) {
        // Silently fall back to rule-based summary
        console.warn('AI enhancement failed, using rule-based summary:', error);
    }

    return {
        summary: { en: summaryEn, ur: summaryUr },
        results
    };
}

/**
 * Analyze Blood Test using new validation engine with AI enhancement
 */
export async function analyzeBloodTest(data: BloodTestFormData): Promise<BloodTestAnalysis> {
    const context: PatientContext = {
        age: data.patientAge || 30,
        gender: (data.patientGender as 'male' | 'female') || 'male'
    };

    // Validate each parameter
    const medicalResults: MedicalResult[] = data.parameters
        .filter(param => param.value !== '')
        .map(param => {
            const value = parseFloat(param.value);
            return validateParameter(
                param.id,
                value,
                param.unit,
                param.referenceRange,
                context
            );
        });

    // Analyze relationships
    const relationshipFlags = analyzeRelationships(medicalResults);

    // Convert to old format
    const results: BloodTestResult[] = medicalResults.map((mr, idx) =>
        medicalResultToBloodTestResult(mr, data.parameters[idx])
    );

    // Calculate overall risk
    const riskLevels = medicalResults.map(r => r.riskLevel);
    const overallRisk = riskLevels.includes('critical') ? 'critical' :
        riskLevels.includes('high') ? 'high' :
            riskLevels.includes('moderate') ? 'moderate' : 'low';

    // Generate summary
    const abnormalResults = results.filter(r => r.status !== 'normal');
    const criticalResults = medicalResults.filter(r => r.flags.includes('CRITICAL'));

    // Generate rule-based summary as fallback
    let summaryEn = '';
    let summaryUr = '';

    if (criticalResults.length > 0) {
        summaryEn = `CRITICAL ALERT: ${criticalResults.length} parameters show critical values requiring immediate medical attention. Please contact your healthcare provider immediately.`;
        summaryUr = `تشویشناک انتباہ: ${criticalResults.length} پیرامیٹرز میں تشویشناک قدریں ہیں جن کے لیے فوری طبی توجہ درکار ہے۔ براہ کرم فوری طور پر اپنے صحت کی دیکھ بھال فراہم کنندہ سے رابطہ کریں۔`;
    } else if (abnormalResults.length === 0) {
        summaryEn = `Excellent! All your test results are within normal ranges, indicating good health in this area.`;
        summaryUr = `بہترین! آپ کے تمام ٹیسٹ کے نتائج معمول کی حدود میں ہیں، جو اس علاقے میں اچھی صحت کی نشاندہی کرتے ہیں۔`;
    } else {
        summaryEn = `Your test results show ${abnormalResults.length} parameters outside normal ranges. Review the detailed analysis below and consult your healthcare provider for guidance.`;
        summaryUr = `آپ کے ٹیسٹ کے نتائج ${abnormalResults.length} پیرامیٹرز کو معمول کی حدود سے باہر دکھاتے ہیں۔ نیچے تفصیلی تجزیہ دیکھیں اور رہنمائی کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔`;
    }

    // Try AI enhancement (if available)
    try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('blood-analysis-enhance', {
            body: {
                testType: data.testType,
                results: medicalResults,
                relationshipFlags,
                patientContext: {
                    age: data.patientAge || 30,
                    gender: data.patientGender as 'male' | 'female' || 'male'
                }
            }
        });

        if (!aiError && aiData?.enhancedSummary?.en) {
            summaryEn = aiData.enhancedSummary.en;
            summaryUr = aiData.enhancedSummary.ur || summaryUr;
            console.log('✓ AI enhancement successful (provider: ' + aiData.provider + ')');
        } else if (aiError) {
            console.warn('AI enhancement error:', aiError);
        }
    } catch (error) {
        // Silently fall back to rule-based summary
        console.warn('AI enhancement failed, using rule-based summary:', error);
    }

    return {
        testType: data.testType,
        summary: { en: summaryEn, ur: summaryUr },
        overallRisk,
        results,
        relatedConditions: { en: [], ur: [] } // Can be enhanced later
    };
}
