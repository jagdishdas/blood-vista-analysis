/**
 * AI CONTEXT ASSEMBLER
 * Backend service to assemble comprehensive context for AI
 */

import { supabase } from '@/integrations/supabase/client';
import { getUserProfile, calculateAge } from './profileService';
import { getBloodTestHistory, getParameterTrend } from './bloodTestService';
import { MedicalResult } from '@/medical-core/types';

export interface AIContext {
    userProfile: {
        age: number;
        sex: string;
        conditions: string[];
        isPregnant: boolean;
        medications: string[];
    } | null;
    currentTest: {
        results: MedicalResult[];
        overallRisk: string;
        hasCritical: boolean;
    } | null;
    history: {
        testCount: number;
        lastTestDate: string | null;
        trends: Array<{
            parameterId: string;
            direction: 'improving' | 'stable' | 'worsening';
            percentChange: number;
        }>;
    } | null;
}

/**
 * Assemble comprehensive AI context from database
 */
export async function assembleAIContext(
    currentResults?: MedicalResult[],
    overallRisk?: 'low' | 'moderate' | 'high' | 'critical'
): Promise<AIContext> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            userProfile: null,
            currentTest: currentResults ? {
                results: currentResults,
                overallRisk: overallRisk || 'low',
                hasCritical: currentResults.some(r => r.flags.includes('CRITICAL'))
            } : null,
            history: null
        };
    }

    // Get user profile
    const profile = await getUserProfile();
    const userProfile = profile ? {
        age: calculateAge(profile.date_of_birth),
        sex: profile.sex,
        conditions: profile.chronic_conditions || [],
        isPregnant: profile.pregnancy_status,
        medications: profile.current_medications || []
    } : null;

    // Get test history
    const history = await getBloodTestHistory(5);

    // Calculate trends for current parameters
    const trends: Array<{
        parameterId: string;
        direction: 'improving' | 'stable' | 'worsening';
        percentChange: number;
    }> = [];

    if (currentResults && currentResults.length > 0) {
        for (const result of currentResults) {
            const paramHistory = await getParameterTrend(result.parameterId, 2);

            if (paramHistory && paramHistory.length >= 2) {
                const current = paramHistory[0].value;
                const previous = paramHistory[1].value;
                const percentChange = ((current - previous) / previous) * 100;

                let direction: 'improving' | 'stable' | 'worsening' = 'stable';
                if (Math.abs(percentChange) > 5) {
                    // Context-dependent: for most parameters, lower is better
                    // This is simplified - should be parameter-specific
                    direction = percentChange < 0 ? 'improving' : 'worsening';
                }

                trends.push({
                    parameterId: result.parameterId,
                    direction,
                    percentChange
                });
            }
        }
    }

    return {
        userProfile,
        currentTest: currentResults ? {
            results: currentResults,
            overallRisk: overallRisk || 'low',
            hasCritical: currentResults.some(r => r.flags.includes('CRITICAL'))
        } : null,
        history: {
            testCount: history.length,
            lastTestDate: history.length > 0 ? history[0].test_date : null,
            trends
        }
    };
}

/**
 * Generate AI system prompt with full context
 */
export function generateContextualPrompt(context: AIContext, basePrompt: string): string {
    let prompt = basePrompt + '\n\n';

    // Add user context
    if (context.userProfile) {
        prompt += `[USER PROFILE - CRITICAL CONTEXT]\n`;
        prompt += `- Age: ${context.userProfile.age} years\n`;
        prompt += `- Sex: ${context.userProfile.sex}\n`;

        if (context.userProfile.isPregnant) {
            prompt += `- Pregnancy Status: ACTIVE (adjust reference ranges accordingly)\n`;
        }

        if (context.userProfile.conditions.length > 0) {
            prompt += `- Chronic Conditions: ${context.userProfile.conditions.join(', ')}\n`;
        }

        if (context.userProfile.medications.length > 0) {
            prompt += `- Current Medications: ${context.userProfile.medications.join(', ')}\n`;
        }
        prompt += '\n';
    }

    // Add current test results
    if (context.currentTest) {
        prompt += `[CURRENT TEST RESULTS - VALIDATED]\n`;

        context.currentTest.results.forEach(result => {
            const critical = result.flags.includes('CRITICAL') ? ' ⚠️ CRITICAL' : '';
            prompt += `- ${result.parameterId}: ${result.value} ${result.unit} (Status: ${result.status}${critical}, Risk: ${result.riskLevel})\n`;
        });

        if (context.currentTest.hasCritical) {
            prompt += '\n⚠️ CRITICAL VALUES DETECTED - Immediate medical consultation required\n';
        }
        prompt += '\n';
    }

    // Add longitudinal context
    if (context.history && context.history.trends.length > 0) {
        prompt += `[LONGITUDINAL TRENDS]\n`;

        context.history.trends.forEach(trend => {
            const arrow = trend.direction === 'improving' ? '↓' :
                trend.direction === 'worsening' ? '↑' : '→';
            prompt += `- ${trend.parameterId}: ${arrow} ${trend.percentChange.toFixed(1)}% (${trend.direction})\n`;
        });
        prompt += '\n';
    }

    // Add safety rules
    prompt += `[SAFETY RULES - MANDATORY]\n`;
    prompt += `1. ALWAYS acknowledge user's age and sex in your interpretation\n`;
    prompt += `2. If CRITICAL values present, MUST recommend immediate medical attention\n`;
    prompt += `3. Consider trends - improving trends are encouraging, worsening require action\n`;
    prompt += `4. NEVER contradict validated status (if status=HIGH, don't say "normal")\n`;
    prompt += `5. Reference user's conditions when relevant\n`;
    prompt += `6. For pregnant users, note that some values naturally change\n\n`;

    return prompt;
}
