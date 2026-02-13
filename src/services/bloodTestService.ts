/**
 * BLOOD TEST DATABASE SERVICE
 * Handles all database operations for blood test persistence
 */

import { supabase } from '@/integrations/supabase/client';
import { MedicalResult, ValidatedAnalysis } from '@/medical-core/types';
import { getInterpretation } from '@/lib/content/medical-content';
import { Database } from '@/integrations/supabase/types';

type BloodTest = Database['public']['Tables']['blood_tests']['Insert'];
type TestParameter = Database['public']['Tables']['test_parameters']['Insert'];

/**
 * Save a complete blood test analysis to the database
 */
export async function saveBloodTest(
    testType: string,
    testDate: string,
    results: MedicalResult[],
    overallRisk: 'low' | 'moderate' | 'high' | 'critical',
    summaryEn: string,
    summaryUr: string,
    relationshipFlags: string[],
    labName?: string
) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User must be authenticated to save blood tests');
    }

    // Check if user has critical values
    const hasCriticalValues = results.some(r => r.flags.includes('CRITICAL'));

    // Insert blood test record
    const { data: bloodTest, error: testError } = await supabase
        .from('blood_tests')
        .insert({
            user_id: user.id,
            test_type: testType,
            test_date: testDate,
            lab_name: labName,
            overall_risk: overallRisk,
            has_critical_values: hasCriticalValues,
            summary_en: summaryEn,
            summary_ur: summaryUr,
            relationship_flags: relationshipFlags
        })
        .select()
        .single();

    if (testError) {
        console.error('Error saving blood test:', testError);
        throw testError;
    }

    // Insert test parameters
    const parameters: TestParameter[] = results.map(result => {
        const interpretation = getInterpretation(result.parameterId, result.status);

        return {
            test_id: bloodTest.id,
            parameter_id: result.parameterId,
            parameter_name_en: result.parameterId, // You can enhance this with proper names
            parameter_name_ur: null,
            value: result.value,
            unit: result.unit,
            ref_min: result.referenceRange.min,
            ref_max: result.referenceRange.max,
            status: result.status,
            deviation: result.deviation,
            risk_level: result.riskLevel,
            flags: result.flags,
            interpretation_en: interpretation.en,
            interpretation_ur: interpretation.ur
        };
    });

    const { error: paramsError } = await supabase
        .from('test_parameters')
        .insert(parameters);

    if (paramsError) {
        console.error('Error saving test parameters:', paramsError);
        throw paramsError;
    }

    return bloodTest;
}

/**
 * Retrieve user's blood test history
 */
export async function getBloodTestHistory(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('blood_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching blood test history:', error);
        return [];
    }

    return data;
}

/**
 * Get specific blood test with all parameters
 */
export async function getBloodTestById(testId: string) {
    const { data: test, error: testError } = await supabase
        .from('blood_tests')
        .select('*')
        .eq('id', testId)
        .single();

    if (testError) {
        console.error('Error fetching blood test:', testError);
        throw testError;
    }

    const { data: parameters, error: paramsError } = await supabase
        .from('test_parameters')
        .select('*')
        .eq('test_id', testId);

    if (paramsError) {
        console.error('Error fetching test parameters:', paramsError);
        throw paramsError;
    }

    return { test, parameters };
}

/**
 * Get parameter trend (longitudinal analysis)
 */
export async function getParameterTrend(parameterId: string, limit = 5) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('test_parameters')
        .select(`
      value,
      unit,
      status,
      created_at,
      blood_tests!inner(test_date, user_id)
    `)
        .eq('parameter_id', parameterId)
        .eq('blood_tests.user_id', user.id)
        .order('blood_tests.test_date', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching parameter trend:', error);
        return [];
    }

    return data;
}

/**
 * Calculate trend for a parameter
 */
export async function calculateParameterTrend(
    parameterId: string,
    currentValue: number,
    currentDate: string
) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase.rpc('calculate_trend', {
        p_user_id: user.id,
        p_parameter_id: parameterId,
        p_current_value: currentValue,
        p_current_date: currentDate
    });

    if (error) {
        console.error('Error calculating trend:', error);
        return null;
    }

    return data;
}

/**
 * Delete a blood test
 */
export async function deleteBloodTest(testId: string) {
    const { error } = await supabase
        .from('blood_tests')
        .delete()
        .eq('id', testId);

    if (error) {
        console.error('Error deleting blood test:', error);
        throw error;
    }
}
