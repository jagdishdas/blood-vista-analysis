/**
 * CRITICAL ALERT BANNER COMPONENT
 * Displays prominent warnings for critical medical values
 */

import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { MedicalResult } from '@/medical-core/types';

interface CriticalAlertBannerProps {
    criticalResults: MedicalResult[];
    language?: 'en' | 'ur';
}

export function CriticalAlertBanner({ criticalResults, language = 'en' }: CriticalAlertBannerProps) {
    if (criticalResults.length === 0) return null;

    const messages = {
        en: {
            title: '⚠️ CRITICAL ALERT - Immediate Action Required',
            description: 'Your test results show critical values that require immediate medical attention. Please contact your healthcare provider or visit an emergency department as soon as possible. Do not delay.',
            parameters: 'Critical parameters:'
        },
        ur: {
            title: '⚠️ تشویشناک انتباہ - فوری کارروائی ضروری',
            description: 'آپ کے ٹیسٹ کے نتائج میں تشویشناک قدریں ہیں جن کے لیے فوری طبی توجہ درکار ہے۔ براہ کرم جلد از جلد اپنے صحت کی دیکھ بھال فراہم کنندہ سے رابطہ کریں یا ایمرجنسی ڈیپارٹمنٹ میں جائیں۔ تاخیر نہ کریں۔',
            parameters: 'تشویشناک پیرامیٹرز:'
        }
    };

    const msg = messages[language];

    return (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">{msg.title}</AlertTitle>
            <AlertDescription className="mt-2">
                <p className="mb-2">{msg.description}</p>
                <p className="font-semibold">{msg.parameters}</p>
                <ul className="list-disc list-inside mt-1">
                    {criticalResults.map((result, index) => (
                        <li key={index} className="text-red-800 font-medium">
                            {result.parameterId}: {result.value} {result.unit}
                            {result.status === 'CRITICAL_LOW' && ' (Critically Low)'}
                            {result.status === 'CRITICAL_HIGH' && ' (Critically High)'}
                        </li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
