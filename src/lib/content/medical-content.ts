/**
 * MEDICAL CONTENT STORE
 * All human-readable medical interpretations and recommendations.
 * Separated from validation logic for easy updates and translation.
 */

import { MedicalStatus } from '@/medical-core/constants';

export interface BilingualText {
    en: string;
    ur: string;
}

/**
 * Interpretations mapped by parameter ID and status
 */
export const INTERPRETATIONS: Record<string, Record<MedicalStatus, BilingualText>> = {
    // CBC PARAMETERS
    hemoglobin: {
        NORMAL: {
            en: "Your hemoglobin level is normal, which means your blood is carrying oxygen properly.",
            ur: "آپ کے ہیموگلوبن کی سطح معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کا خون صحیح طریقے سے آکسیجن لے جا رہا ہے۔"
        },
        LOW: {
            en: "Your hemoglobin level is low, which might make you feel tired or weak. This is often due to iron deficiency or blood loss.",
            ur: "آپ کے ہیموگلوبن کی سطح کم ہے، جس سے آپ کو تھکاوٹ یا کمزوری محسوس ہو سکتی ہے۔ یہ اکثر آئرن کی کمی یا خون کے ضیاع کی وجہ سے ہوتا ہے۔"
        },
        HIGH: {
            en: "Your hemoglobin level is high. This could be due to dehydration or a condition that affects your red blood cells.",
            ur: "آپ کے ہیموگلوبن کی سطح زیادہ ہے۔ یہ پانی کی کمی یا ایسی حالت کی وجہ سے ہو سکتا ہے جو آپ کے سرخ خون کے خلیات کو متاثر کرتی ہے۔"
        },
        CRITICAL_LOW: {
            en: "IMPORTANT: Your hemoglobin is very low. This needs medical attention soon as you might feel very tired, dizzy, or short of breath.",
            ur: "اہم: آپ کا ہیموگلوبن بہت کم ہے۔ اس کے لیے جلد طبی توجہ کی ضرورت ہے کیونکہ آپ کو بہت تھکاوٹ، چکر آنا، یا سانس کی تکلیف محسوس ہو سکتی ہے۔"
        },
        CRITICAL_HIGH: {
            en: "IMPORTANT: Your hemoglobin is critically high. Immediate medical evaluation needed.",
            ur: "اہم: آپ کا ہیموگلوبن انتہائی بلند ہے۔ فوری طبی جانچ ضروری ہے۔"
        }
    },

    wbc: {
        NORMAL: {
            en: "Your white blood cell count is normal, which means your immune system is working properly.",
            ur: "آپ کے سفید خون کے خلیات کی تعداد معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کا مدافعتی نظام صحیح طریقے سے کام کر رہا ہے۔"
        },
        LOW: {
            en: "Your white blood cell count is low. This might make it harder for your body to fight infections. Common causes include certain medications or infections.",
            ur: "آپ کے سفید خون کے خلیات کی تعداد کم ہے۔ اس سے آپ کے جسم کو انفیکشن سے لڑنا مشکل ہو سکتا ہے۔ عام وجوہات میں کچھ ادویات یا انفیکشن شامل ہیں۔"
        },
        HIGH: {
            en: "Your white blood cell count is high, which usually means your body is fighting an infection or inflammation.",
            ur: "آپ کے سفید خون کے خلیات کی تعداد زیادہ ہے، جس کا عام طور پر مطلب ہے کہ آپ کا جسم کسی انفیکشن یا سوزش سے لڑ رہا ہے۔"
        },
        CRITICAL_LOW: {
            en: "IMPORTANT: Your white blood cell count is very low. This means your body may have trouble fighting infections. Contact your doctor soon.",
            ur: "اہم: آپ کے سفید خون کے خلیات کی تعداد بہت کم ہے۔ اس کا مطلب ہے کہ آپ کے جسم کو انفیکشن سے لڑنے میں مشکل ہو سکتی ہے۔ جلد اپنے ڈاکٹر سے رابطہ کریں۔"
        },
        CRITICAL_HIGH: {
            en: "IMPORTANT: Your white blood cell count is very high. Contact your doctor soon as this could indicate a serious infection or blood disorder.",
            ur: "اہم: آپ کے سفید خون کے خلیات کی تعداد بہت زیادہ ہے۔ جلد اپنے ڈاکٹر سے رابطہ کریں کیونکہ یہ سنگین انفیکشن یا خون کی خرابی کی نشاندہی کر سکتا ہے۔"
        }
    },

    platelets: {
        NORMAL: {
            en: "Your platelet count is normal, which means your blood can clot properly when needed.",
            ur: "آپ کی پلیٹلیٹس کی تعداد معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کا خون ضرورت پڑنے پر صحیح طریقے سے جم سکتا ہے۔"
        },
        LOW: {
            en: "Your platelet count is low, which might mean you bruise or bleed more easily. This could be due to certain medications or conditions.",
            ur: "آپ کی پلیٹلیٹس کی تعداد کم ہے، جس کا مطلب ہو سکتا ہے کہ آپ کو آسانی سے چوٹ لگ سکتی ہے یا خون بہہ سکتا ہے۔ یہ کچھ ادویات یا حالات کی وجہ سے ہو سکتا ہے۔"
        },
        HIGH: {
            en: "Your platelet count is high. This could be due to inflammation, infection, or certain blood disorders.",
            ur: "آپ کی پلیٹلیٹس کی تعداد زیادہ ہے۔ یہ سوزش، انفیکشن، یا کچھ خون کی خرابیوں کی وجہ سے ہو سکتا ہے۔"
        },
        CRITICAL_LOW: {
            en: "IMPORTANT: Your platelet count is very low. This increases your risk of serious bleeding. Contact your doctor soon.",
            ur: "اہم: آپ کی پلیٹلیٹس کی تعداد بہت کم ہے۔ اس سے سنگین خون بہنے کا خطرہ بڑھ جاتا ہے۔ جلد اپنے ڈاکٹر سے رابطہ کریں۔"
        },
        CRITICAL_HIGH: {
            en: "Your platelet count is very high. Medical evaluation recommended.",
            ur: "آپ کی پلیٹلیٹس کی تعداد بہت زیادہ ہے۔ طبی جانچ کی سفارش کی جاتی ہے۔"
        }
    },

    // LIPID PROFILE
    totalCholesterol: {
        NORMAL: {
            en: "Your total cholesterol is at healthy levels, reducing cardiovascular disease risk.",
            ur: "آپ کا کل کولیسٹرول صحت مند سطح پر ہے، جو دل کی بیماری کا خطرہ کم کرتا ہے۔"
        },
        LOW: {
            en: "Your total cholesterol is low, which is generally good for heart health.",
            ur: "آپ کا کل کولیسٹرول کم ہے، جو عام طور پر دل کی صحت کے لیے اچھا ہے۔"
        },
        HIGH: {
            en: "Your total cholesterol is elevated, increasing heart disease risk. Lifestyle modifications recommended.",
            ur: "آپ کا کل کولیسٹرول بلند ہے، دل کی بیماری کا خطرہ بڑھاتا ہے۔ طرز زندگی میں تبدیلیاں تجویز کی جاتی ہیں۔"
        },
        CRITICAL_LOW: {
            en: "Your total cholesterol is very low. Medical evaluation recommended.",
            ur: "آپ کا کل کولیسٹرول بہت کم ہے۔ طبی جانچ کی سفارش کی جاتی ہے۔"
        },
        CRITICAL_HIGH: {
            en: "Your total cholesterol is critically high. Immediate medical evaluation and treatment needed.",
            ur: "آپ کا کل کولیسٹرول انتہائی بلند ہے۔ فوری طبی جانچ اور علاج ضروری ہے۔"
        }
    },

    // GLUCOSE
    fastingGlucose: {
        NORMAL: {
            en: "Your fasting glucose is normal, indicating good blood sugar control.",
            ur: "آپ کا خالی پیٹ گلوکوز معمول کے مطابق ہے، خون میں شکر کا اچھا کنٹرول ظاہر کرتا ہے۔"
        },
        LOW: {
            en: "Your fasting glucose is low, may cause dizziness or weakness. Consult your doctor.",
            ur: "آپ کا خالی پیٹ گلوکوز کم ہے، چکر یا کمزوری ہو سکتی ہے۔ ڈاکٹر سے مشورہ کریں۔"
        },
        HIGH: {
            en: "Your fasting glucose is elevated, suggesting prediabetes or diabetes. Dietary changes needed.",
            ur: "آپ کا خالی پیٹ گلوکوز بلند ہے، پری ڈایبیٹیز یا ڈایبیٹیز کی نشاندہی کرتا ہے۔ غذائی تبدیلیاں ضروری۔"
        },
        CRITICAL_LOW: {
            en: "Your glucose is dangerously low. Risk of severe hypoglycemia. Seek immediate medical help.",
            ur: "آپ کا گلوکوز خطرناک حد تک کم ہے۔ شدید ہائپوگلیسیمیا کا خطرہ۔ فوری طبی مدد لیں۔"
        },
        CRITICAL_HIGH: {
            en: "Your fasting glucose is critically high. Immediate diabetes management required.",
            ur: "آپ کا خالی پیٹ گلوکوز انتہائی بلند ہے۔ فوری ڈایبیٹیز کا انتظام ضروری ہے۔"
        }
    }
};

/**
 * Recommendations mapped by parameter ID and status
 */
export const RECOMMENDATIONS: Record<string, Record<string, BilingualText[]>> = {
    hemoglobin: {
        LOW: [
            { en: "Increase iron-rich foods (red meat, spinach, lentils)", ur: "آئرن سے بھرپور غذا بڑھائیں (سرخ گوشت، پالک، دال)" },
            { en: "Take iron supplements as recommended by your doctor", ur: "ڈاکٹر کی سفارش کے مطابق آئرن سپلیمنٹس لیں" },
            { en: "Consult your doctor to identify the cause", ur: "وجہ کی شناخت کے لیے اپنے ڈاکٹر سے مشورہ کریں" }
        ],
        CRITICAL_LOW: [
            { en: "Seek immediate medical attention", ur: "فوری طبی توجہ حاصل کریں" },
            { en: "Blood transfusion may be required", ur: "خون کی منتقلی کی ضرورت ہو سکتی ہے" },
            { en: "Do not delay - this requires urgent care", ur: "تاخیر نہ کریں - اس کے لیے فوری کیئر کی ضرورت ہے" }
        ]
    },

    platelets: {
        LOW: [
            { en: "Avoid activities that may cause injury or bleeding", ur: "ایسی سرگرمیوں سے بچیں جو چوٹ یا خون بہنے کا سبب بن سکتی ہیں" },
            { en: "Inform your doctor about any unusual bruising", ur: "کسی بھی غیر معمولی چوٹ کے بارے میں اپنے ڈاکٹر کو مطلع کریں" },
            { en: "Avoid medications that affect platelet function", ur: "ایسی ادویات سے بچیں جو پلیٹلیٹ فنکشن کو متاثر کرتی ہیں" }
        ],
        CRITICAL_LOW: [
            { en: "Seek emergency medical care immediately", ur: "فوری طور پر ایمرجنسی طبی کیئر لیں" },
            { en: "Avoid any activities that could cause bleeding", ur: "کسی بھی سرگرمی سے بچیں جو خون بہنے کا سبب بن سکتی ہے" },
            { en: "Platelet transfusion may be needed", ur: "پلیٹلیٹ ٹرانسفیوژن کی ضرورت ہو سکتی ہے" }
        ]
    },

    totalCholesterol: {
        HIGH: [
            { en: "Adopt Mediterranean diet rich in olive oil and fish", ur: "زیتون کے تیل اور مچھلی سے بھرپور میڈیٹیرینین غذا اپنائیں" },
            { en: "Exercise 30 minutes daily", ur: "روزانہ 30 منٹ ورزش کریں" },
            { en: "Limit trans fats and processed foods", ur: "ٹرانس فیٹس اور پروسیسڈ فوڈ محدود کریں" }
        ]
    },

    fastingGlucose: {
        HIGH: [
            { en: "Adopt low glycemic index diet", ur: "کم گلائسیمک انڈیکس والی غذا اپنائیں" },
            { en: "Exercise regularly to improve insulin sensitivity", ur: "انسولین حساسیت بہتر بنانے کے لیے باقاعدگی سے ورزش کریں" },
            { en: "Monitor blood sugar levels at home", ur: "گھر میں خون میں شکر کی نگرانی کریں" }
        ],
        LOW: [
            { en: "Eat small frequent meals", ur: "چھوٹے بار بار کھانا کھائیں" },
            { en: "Always carry fast-acting sugar", ur: "ہمیشہ تیز اثر والی شکر ساتھ رکھیں" },
            { en: "Check medications causing low blood sugar", ur: "کم بلڈ شوگر کرنے والی ادویات چیک کریں" }
        ]
    }
};

/**
 * Relationship-based interpretations
 */
export const RELATIONSHIP_INTERPRETATIONS: Record<string, BilingualText> = {
    RELATIONSHIP_ANEMIA: {
        en: "Your results show a pattern consistent with anemia. Multiple parameters indicate low red blood cell levels or function.",
        ur: "آپ کے نتائج خون کی کمی کے مطابق پیٹرن دکھاتے ہیں۔ متعدد پیرامیٹرز کم سرخ خون کے خلیات کی سطح یا فنکشن کی نشاندہی کرتے ہیں۔"
    },
    RELATIONSHIP_INFECTION: {
        en: "Your results suggest your body may be fighting an infection. Elevated white blood cells indicate immune system activation.",
        ur: "آپ کے نتائج بتاتے ہیں کہ آپ کا جسم انفیکشن سے لڑ رہا ہو سکتا ہے۔ بلند سفید خون کے خلیات مدافعتی نظام کی سرگرمی کی نشاندہی کرتے ہیں۔"
    },
    RELATIONSHIP_BLEEDING: {
        en: "Low platelet count may increase bleeding risk. Be cautious with activities that could cause injury.",
        ur: "کم پلیٹلیٹ شمار خون بہنے کا خطرہ بڑھا سکتا ہے۔ ایسی سرگرمیوں سے محتاط رہیں جو چوٹ کا سبب بن سکتی ہیں۔"
    },
    RELATIONSHIP_POLYCYTHEMIA: {
        en: "Elevated red blood cell parameters may indicate polycythemia. Further evaluation recommended.",
        ur: "بلند سرخ خون کے خلیات کے پیرامیٹرز پولی سیتھیمیا کی نشاندہی کر سکتے ہیں۔ مزید جانچ کی سفارش کی جاتی ہے۔"
    }
};

/**
 * Get interpretation for a parameter and status
 */
export function getInterpretation(parameterId: string, status: MedicalStatus): BilingualText {
    const paramInterpretations = INTERPRETATIONS[parameterId];

    if (!paramInterpretations || !paramInterpretations[status]) {
        return {
            en: "Consult with your healthcare provider for interpretation of this result.",
            ur: "اس نتیجے کی تشریح کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔"
        };
    }

    return paramInterpretations[status];
}

/**
 * Get recommendations for a parameter and status
 */
export function getRecommendations(parameterId: string, status: MedicalStatus): BilingualText[] {
    const paramRecommendations = RECOMMENDATIONS[parameterId];

    if (!paramRecommendations || !paramRecommendations[status]) {
        return [{
            en: "Consult with your healthcare provider for personalized recommendations",
            ur: "ذاتی سفارشات کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں"
        }];
    }

    return paramRecommendations[status];
}

/**
 * Get relationship interpretation
 */
export function getRelationshipInterpretation(flag: string): BilingualText | null {
    return RELATIONSHIP_INTERPRETATIONS[flag] || null;
}
