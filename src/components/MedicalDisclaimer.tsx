import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MedicalDisclaimerProps {
    language?: string;
    variant?: 'default' | 'compact' | 'inline';
    className?: string;
}

const MedicalDisclaimer = ({
    language = 'en',
    variant = 'default',
    className = ''
}: MedicalDisclaimerProps) => {
    const disclaimers = {
        en: {
            title: 'Important Medical Disclaimer',
            default: 'BloodVista provides educational information and preliminary analysis of blood test results. This tool is NOT a replacement for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions. Results shown are automated interpretations based on general medical guidelines and may not account for individual health circumstances, medications, or medical history. In case of critical values or concerning results, seek immediate medical attention.',
            compact: 'This analysis is for educational purposes only and does not replace professional medical advice. Consult your healthcare provider for medical decisions.',
            inline: 'For educational purposes only. Not a substitute for professional medical advice.'
        },
        ur: {
            title: 'اہم طبی اعلان',
            default: 'بلڈ وسٹا تعلیمی معلومات اور خون کے ٹیسٹ کے نتائج کا ابتدائی تجزیہ فراہم کرتا ہے۔ یہ ٹول پیشہ ورانہ طبی مشورے، تشخیص، یا علاج کا متبادل نہیں ہے۔ طبی فیصلوں کے لیے ہمیشہ اہل صحت کی دیکھ بھال کرنے والے پیشہ ور افراد سے مشورہ کریں۔ دکھائے گئے نتائج عام طبی رہنما خطوط کی بنیاد پر خودکار تشریحات ہیں اور انفرادی صحت کے حالات، ادویات، یا طبی تاریخ کو مدنظر نہیں رکھتے۔ تشویشناک قدروں یا پریشان کن نتائج کی صورت میں، فوری طبی توجہ حاصل کریں۔',
            compact: 'یہ تجزیہ صرف تعلیمی مقاصد کے لیے ہے اور پیشہ ورانہ طبی مشورے کی جگہ نہیں لیتا۔ طبی فیصلوں کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔',
            inline: 'صرف تعلیمی مقاصد کے لیے۔ پیشہ ورانہ طبی مشورے کا متبادل نہیں۔'
        }
    };

    const content = disclaimers[language as keyof typeof disclaimers] || disclaimers.en;
    const text = variant === 'default' ? content.default :
        variant === 'compact' ? content.compact :
            content.inline;

    if (variant === 'inline') {
        return (
            <p className={`text-xs text-muted-foreground italic ${className}`}>
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {text}
            </p>
        );
    }

    return (
        <Alert variant="default" className={`border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 ${className}`}>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
                {variant === 'default' && (
                    <strong className="block mb-1 text-amber-950 dark:text-amber-50">
                        {content.title}
                    </strong>
                )}
                {text}
            </AlertDescription>
        </Alert>
    );
};

export default MedicalDisclaimer;
