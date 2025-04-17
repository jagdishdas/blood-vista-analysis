
import { CBCFormData, CBCAnalysis, CBCResult } from "../types/cbc.types";

// Calculate percentage deviation from the normal range
const calculateDeviation = (value: number, min: number, max: number): number => {
  if (value < min) {
    return ((value - min) / min) * 100;
  } else if (value > max) {
    return ((value - max) / max) * 100;
  }
  return 0;
};

// Get status based on value comparison with reference range
const getStatus = (value: number, min: number, max: number): 'normal' | 'low' | 'high' => {
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'normal';
};

// Generate interpretation for each parameter - simplify for common understanding
const generateInterpretation = (parameter: string, status: 'normal' | 'low' | 'high', deviation: number): { en: string; ur: string } => {
  // Simplified interpretations with everyday language
  
  const interpretations: Record<string, { en: { normal: string; low: string; high: string }; ur: { normal: string; low: string; high: string } }> = {
    wbc: {
      en: {
        normal: "Your white blood cell count is normal, which means your immune system is working properly.",
        low: "Your white blood cell count is low. This might make it harder for your body to fight infections. Common causes include certain medications or infections.",
        high: "Your white blood cell count is high, which usually means your body is fighting an infection or inflammation."
      },
      ur: {
        normal: "آپ کے سفید خون کے خلیات کی تعداد معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کا مدافعتی نظام صحیح طریقے سے کام کر رہا ہے۔",
        low: "آپ کے سفید خون کے خلیات کی تعداد کم ہے۔ اس سے آپ کے جسم کو انفیکشن سے لڑنا مشکل ہو سکتا ہے۔ عام وجوہات میں کچھ ادویات یا انفیکشن شامل ہیں۔",
        high: "آپ کے سفید خون کے خلیات کی تعداد زیادہ ہے، جس کا عام طور پر مطلب ہے کہ آپ کا جسم کسی انفیکشن یا سوزش سے لڑ رہا ہے۔"
      }
    },
    rbc: {
      en: {
        normal: "Your red blood cell count is normal, which means your body is getting enough oxygen.",
        low: "Your red blood cell count is low. This might make you feel tired or short of breath. Common causes include iron deficiency or blood loss.",
        high: "Your red blood cell count is high. This could be due to dehydration or a condition that causes your body to make too many red blood cells."
      },
      ur: {
        normal: "آپ کے سرخ خون کے خلیات کی تعداد معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کے جسم کو کافی آکسیجن مل رہی ہے۔",
        low: "آپ کے سرخ خون کے خلیات کی تعداد کم ہے۔ اس سے آپ کو تھکاوٹ یا سانس کی تکلیف محسوس ہو سکتی ہے۔ عام وجوہات میں آئرن کی کمی یا خون کا ضیاع شامل ہے۔",
        high: "آپ کے سرخ خون کے خلیات کی تعداد زیادہ ہے۔ یہ پانی کی کمی یا ایسی حالت کی وجہ سے ہو سکتا ہے جس سے آپ کا جسم بہت زیادہ سرخ خون کے خلیات بناتا ہے۔"
      }
    },
    hemoglobin: {
      en: {
        normal: "Your hemoglobin level is normal, which means your blood is carrying oxygen properly.",
        low: "Your hemoglobin level is low, which might make you feel tired or weak. This is often due to iron deficiency or blood loss.",
        high: "Your hemoglobin level is high. This could be due to dehydration or a condition that affects your red blood cells."
      },
      ur: {
        normal: "آپ کے ہیموگلوبن کی سطح معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کا خون صحیح طریقے سے آکسیجن لے جا رہا ہے۔",
        low: "آپ کے ہیموگلوبن کی سطح کم ہے، جس سے آپ کو تھکاوٹ یا کمزوری محسوس ہو سکتی ہے۔ یہ اکثر آئرن کی کمی یا خون کے ضیاع کی وجہ سے ہوتا ہے۔",
        high: "آپ کے ہیموگلوبن کی سطح زیادہ ہے۔ یہ پانی کی کمی یا ایسی حالت کی وجہ سے ہو سکتا ہے جو آپ کے سرخ خون کے خلیات کو متاثر کرتی ہے۔"
      }
    },
    hematocrit: {
      en: {
        normal: "Your hematocrit is normal, which means you have a good balance of red blood cells in your blood.",
        low: "Your hematocrit is low, which might indicate anemia or blood loss. This can make you feel tired.",
        high: "Your hematocrit is high. This could be due to dehydration or a condition that causes your body to make too many red blood cells."
      },
      ur: {
        normal: "آپ کا ہیماٹوکرٹ معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کے خون میں سرخ خون کے خلیات کا اچھا توازن ہے۔",
        low: "آپ کا ہیماٹوکرٹ کم ہے، جو خون کی کمی یا خون کے ضیاع کی نشاندہی کر سکتا ہے۔ اس سے آپ کو تھکاوٹ محسوس ہو سکتی ہے۔",
        high: "آپ کا ہیماٹوکرٹ زیادہ ہے۔ یہ پانی کی کمی یا ایسی حالت کی وجہ سے ہو سکتا ہے جس سے آپ کا جسم بہت زیادہ سرخ خون کے خلیات بناتا ہے۔"
      }
    },
    platelets: {
      en: {
        normal: "Your platelet count is normal, which means your blood can clot properly when needed.",
        low: "Your platelet count is low, which might mean you bruise or bleed more easily. This could be due to certain medications or conditions.",
        high: "Your platelet count is high. This could be due to inflammation, infection, or certain blood disorders."
      },
      ur: {
        normal: "آپ کی پلیٹلیٹس کی تعداد معمول کے مطابق ہے، جس کا مطلب ہے کہ آپ کا خون ضرورت پڑنے پر صحیح طریقے سے جم سکتا ہے۔",
        low: "آپ کی پلیٹلیٹس کی تعداد کم ہے، جس کا مطلب ہو سکتا ہے کہ آپ کو آسانی سے چوٹ لگ سکتی ہے یا خون بہہ سکتا ہے۔ یہ کچھ ادویات یا حالات کی وجہ سے ہو سکتا ہے۔",
        high: "آپ کی پلیٹلیٹس کی تعداد زیادہ ہے۔ یہ سوزش، انفیکشن، یا کچھ خون کی خرابیوں کی وجہ سے ہو سکتا ہے۔"
      }
    },
    mcv: {
      en: {
        normal: "The size of your red blood cells is normal.",
        low: "Your red blood cells are smaller than normal. This is often due to iron deficiency or certain genetic conditions.",
        high: "Your red blood cells are larger than normal. This could be due to vitamin B12 or folate deficiency."
      },
      ur: {
        normal: "آپ کے سرخ خون کے خلیات کا سائز معمول کے مطابق ہے۔",
        low: "آپ کے سرخ خون کے خلیات معمول سے چھوٹے ہیں۔ یہ اکثر آئرن کی کمی یا کچھ جینیاتی حالات کی وجہ سے ہوتا ہے۔",
        high: "آپ کے سرخ خون کے خلیات معمول سے بڑے ہیں۔ یہ وٹامن بی 12 یا فولیٹ کی کمی کی وجہ سے ہو سکتا ہے۔"
      }
    },
    mch: {
      en: {
        normal: "The amount of hemoglobin in your red blood cells is normal.",
        low: "Your red blood cells contain less hemoglobin than normal. This is often related to iron deficiency.",
        high: "Your red blood cells contain more hemoglobin than normal. This is often seen with larger red blood cells."
      },
      ur: {
        normal: "آپ کے سرخ خون کے خلیات میں ہیموگلوبن کی مقدار معمول کے مطابق ہے۔",
        low: "آپ کے سرخ خون کے خلیات میں معمول سے کم ہیموگلوبن ہے۔ یہ اکثر آئرن کی کمی سے متعلق ہوتا ہے۔",
        high: "آپ کے سرخ خون کے خلیات میں معمول سے زیادہ ہیموگلوبن ہے۔ یہ اکثر بڑے سرخ خون کے خلیات کے ساتھ دیکھا جاتا ہے۔"
      }
    },
    mchc: {
      en: {
        normal: "The concentration of hemoglobin in your red blood cells is normal.",
        low: "The concentration of hemoglobin in your red blood cells is lower than normal. This often happens with iron deficiency.",
        high: "The concentration of hemoglobin in your red blood cells is higher than normal. This might indicate a problem with your red blood cells."
      },
      ur: {
        normal: "آپ کے سرخ خون کے خلیات میں ہیموگلوبن کی مقدار معمول کے مطابق ہے۔",
        low: "آپ کے سرخ خون کے خلیات میں ہیموگلوبن کی مقدار معمول سے کم ہے۔ یہ اکثر آئرن کی کمی کے ساتھ ہوتا ہے۔",
        high: "آپ کے سرخ خون کے خلیات میں ہیموگلوبن کی مقدار معمول سے زیادہ ہے۔ یہ آپ کے سرخ خون کے خلیات میں کسی مسئلے کی نشاندہی کر سکتا ہے۔"
      }
    },
    neutrophils: {
      en: {
        normal: "Your neutrophil count is normal. These are white blood cells that help fight bacterial infections.",
        low: "Your neutrophil count is low. These are white blood cells that fight bacterial infections. Low levels can increase your risk of infections.",
        high: "Your neutrophil count is high. This usually means your body is fighting a bacterial infection or inflammation."
      },
      ur: {
        normal: "آپ کے نیوٹروفل کی تعداد معمول کے مطابق ہے۔ یہ سفید خون کے خلیات ہیں جو بیکٹیریل انفیکشن سے لڑنے میں مدد کرتے ہیں۔",
        low: "آپ کے نیوٹروفل کی تعداد کم ہے۔ یہ سفید خون کے خلیات ہیں جو بیکٹیریل انفیکشن سے لڑتے ہیں۔ کم سطح انفیکشن کے خطرے کو بڑھا سکتی ہے۔",
        high: "آپ کے نیوٹروفل کی تعداد زیادہ ہے۔ اس کا عام طور پر مطلب ہے کہ آپ کا جسم بیکٹیریل انفیکشن یا سوزش سے لڑ رہا ہے۔"
      }
    },
    lymphocytes: {
      en: {
        normal: "Your lymphocyte count is normal. These are white blood cells that help fight viral infections.",
        low: "Your lymphocyte count is low. These are white blood cells that fight viral infections. This could be due to infections, stress, or certain medications.",
        high: "Your lymphocyte count is high. This usually means your body is fighting a viral infection."
      },
      ur: {
        normal: "آپ کے لمفوسائٹ کی تعداد معمول کے مطابق ہے۔ یہ سفید خون کے خلیات ہیں جو وائرل انفیکشن سے لڑنے میں مدد کرتے ہیں۔",
        low: "آپ کے لمفوسائٹ کی تعداد کم ہے۔ یہ سفید خون کے خلیات ہیں جو وائرل انفیکشن سے لڑتے ہیں۔ یہ انفیکشن، تناؤ، یا کچھ ادویات کی وجہ سے ہو سکتا ہے۔",
        high: "آپ کے لمفوسائٹ کی تعداد زیادہ ہے۔ اس کا عام طور پر مطلب ہے کہ آپ کا جسم وائرل انفیکشن سے لڑ رہا ہے۔"
      }
    },
    monocytes: {
      en: {
        normal: "Your monocyte count is normal. These are white blood cells that help clean up infection sites.",
        low: "Your monocyte count is low. This is rarely a concern on its own.",
        high: "Your monocyte count is high. This might mean you have a chronic infection or inflammation."
      },
      ur: {
        normal: "آپ کے مونوسائٹ کی تعداد معمول کے مطابق ہے۔ یہ سفید خون کے خلیات ہیں جو انفیکشن کے مقامات کو صاف کرنے میں مدد کرتے ہیں۔",
        low: "آپ کے مونوسائٹ کی تعداد کم ہے۔ یہ اکیلے شاذ ہی تشویش کا باعث ہوتا ہے۔",
        high: "آپ کے مونوسائٹ کی تعداد زیادہ ہے۔ اس کا مطلب ہو سکتا ہے کہ آپ کو کوئی دائمی انفیکشن یا سوزش ہے۔"
      }
    },
    eosinophils: {
      en: {
        normal: "Your eosinophil count is normal. These are white blood cells that help with allergic responses and fighting parasites.",
        low: "Your eosinophil count is low. This usually isn't a concern.",
        high: "Your eosinophil count is high. This might be due to allergies, asthma, or parasitic infections."
      },
      ur: {
        normal: "آپ کے ایوسینوفل کی تعداد معمول کے مطابق ہے۔ یہ سفید خون کے خلیات ہیں جو الرجک ردعمل اور پیراسائٹس سے لڑنے میں مدد کرتے ہیں۔",
        low: "آپ کے ایوسینوفل کی تعداد کم ہے۔ یہ عام طور پر تشویش کا باعث نہیں ہوتا۔",
        high: "آپ کے ایوسینوفل کی تعداد زیادہ ہے۔ یہ الرجی، دمہ، یا پیراسیٹک انفیکشن کی وجہ سے ہو سکتا ہے۔"
      }
    },
    basophils: {
      en: {
        normal: "Your basophil count is normal. These are rare white blood cells that play a role in allergic responses.",
        low: "Your basophil count is low. This usually isn't a concern.",
        high: "Your basophil count is high. This is rare and might be related to allergic reactions or certain blood disorders."
      },
      ur: {
        normal: "آپ کے بیسوفل کی تعداد معمول کے مطابق ہے۔ یہ نایاب سفید خون کے خلیات ہیں جو الرجک ردعمل میں کردار ادا کرتے ہیں۔",
        low: "آپ کے بیسوفل کی تعداد کم ہے۔ یہ عام طور پر تشویش کا باعث نہیں ہوتا۔",
        high: "آپ کے بیسوفل کی تعداد زیادہ ہے۔ یہ نایاب ہے اور الرجک ردعمل یا کچھ خون کی خرابیوں سے متعلق ہو سکتا ہے۔"
      }
    }
  };

  // Default interpretation if specific parameter is not found
  const defaultInterp = {
    en: {
      normal: `Your ${parameter} level is normal.`,
      low: `Your ${parameter} level is lower than normal.`,
      high: `Your ${parameter} level is higher than normal.`
    },
    ur: {
      normal: `آپ کی ${parameter} کی سطح معمول کے مطابق ہے۔`,
      low: `آپ کی ${parameter} کی سطح معمول سے کم ہے۔`,
      high: `آپ کی ${parameter} کی سطح معمول سے زیادہ ہے۔`
    }
  };

  const interp = interpretations[parameter] || defaultInterp;
  
  return {
    en: interp.en[status],
    ur: interp.ur[status]
  };
};

// Analyze relationships between parameters to identify potential conditions
const analyzeRelationships = (results: CBCResult[]): { en: string; ur: string }[] => {
  const findings: { en: string; ur: string }[] = [];
  
  // Get results by parameter ID for easier access
  const resultMap = results.reduce((map, result) => {
    map[result.parameter.id] = result;
    return map;
  }, {} as Record<string, CBCResult>);
  
  // Check for anemia patterns - simplified explanations
  if (resultMap.hemoglobin && resultMap.hemoglobin.status === 'low') {
    // Microcytic anemia (Iron deficiency)
    if (resultMap.mcv && resultMap.mcv.status === 'low') {
      findings.push({
        en: "Your results show low hemoglobin with smaller-than-normal red blood cells. This pattern often points to iron deficiency, which is a common cause of anemia. It may cause fatigue and weakness.",
        ur: "آپ کے نتائج کم ہیموگلوبن اور معمول سے چھوٹے سرخ خون کے خلیات دکھاتے ہیں۔ یہ پیٹرن اکثر آئرن کی کمی کی طرف اشارہ کرتا ہے، جو خون کی کمی کی ایک عام وجہ ہے۔ اس سے تھکاوٹ اور کمزوری ہو سکتی ہے۔"
      });
    }
    
    // Macrocytic anemia (B12/Folate deficiency)
    if (resultMap.mcv && resultMap.mcv.status === 'high') {
      findings.push({
        en: "Your results show low hemoglobin with larger-than-normal red blood cells. This pattern often suggests a vitamin B12 or folate deficiency. This type of anemia can cause fatigue and sometimes nerve problems.",
        ur: "آپ کے نتائج کم ہیموگلوبن اور معمول سے بڑے سرخ خون کے خلیات دکھاتے ہیں۔ یہ پیٹرن اکثر وٹامن بی12 یا فولیٹ کی کمی کی طرف اشارہ کرتا ہے۔ اس قسم کی خون کی کمی سے تھکاوٹ اور کبھی کبھار اعصابی مسائل ہو سکتے ہیں۔"
      });
    }
    
    // Normocytic anemia (Chronic disease)
    if (resultMap.mcv && resultMap.mcv.status === 'normal') {
      findings.push({
        en: "Your results show low hemoglobin with normal-sized red blood cells. This pattern can be seen with chronic health conditions, recent blood loss, or kidney problems.",
        ur: "آپ کے نتائج کم ہیموگلوبن اور معمول کے سائز کے سرخ خون کے خلیات دکھاتے ہیں۔ یہ پیٹرن دائمی صحت کی خرابیوں، حالیہ خون کے ضیاع، یا گردے کے مسائل کے ساتھ دیکھا جا سکتا ہے۔"
      });
    }
  }
  
  // Check for infection or inflammation - simplified explanations
  if (resultMap.wbc && resultMap.wbc.status === 'high') {
    if (resultMap.neutrophils && resultMap.neutrophils.status === 'high') {
      findings.push({
        en: "Your high white blood cell count, particularly neutrophils, suggests your body may be fighting a bacterial infection or inflammation.",
        ur: "آپ کے سفید خون کے خلیات کی زیادہ تعداد، خاص طور پر نیوٹروفلز، بتاتی ہے کہ آپ کا جسم بیکٹیریل انفیکشن یا سوزش سے لڑ رہا ہو سکتا ہے۔"
      });
    }
    
    if (resultMap.lymphocytes && resultMap.lymphocytes.status === 'high') {
      findings.push({
        en: "Your high white blood cell count, particularly lymphocytes, suggests your body may be fighting a viral infection.",
        ur: "آپ کے سفید خون کے خلیات کی زیادہ تعداد، خاص طور پر لمفوسائٹس، بتاتی ہے کہ آپ کا جسم وائرل انفیکشن سے لڑ رہا ہو سکتا ہے۔"
      });
    }
    
    if (resultMap.eosinophils && resultMap.eosinophils.status === 'high') {
      findings.push({
        en: "Your high eosinophil count suggests you might have allergies, asthma, or a parasitic infection.",
        ur: "آپ کے ایوسینوفلز کی زیادہ تعداد بتاتی ہے کہ آپ کو الرجی، دمہ، یا پیراسیٹک انفیکشن ہو سکتا ہے۔"
      });
    }
  }
  
  // Check for potential bleeding disorder
  if (resultMap.platelets && resultMap.platelets.status === 'low') {
    findings.push({
      en: "Your low platelet count means you might bruise or bleed more easily than normal. Talk to your doctor if you notice unusual bruising or bleeding.",
      ur: "آپ کی پلیٹلیٹس کی کم تعداد کا مطلب ہے کہ آپ کو معمول سے زیادہ آسانی سے چوٹ لگ سکتی ہے یا خون بہہ سکتا ہے۔ اگر آپ کو غیر معمولی چوٹ یا خون بہنا نظر آتا ہے تو اپنے ڈاکٹر سے بات کریں۔"
    });
  }
  
  // Check for polycythemia
  if (resultMap.rbc && resultMap.rbc.status === 'high' && 
      resultMap.hemoglobin && resultMap.hemoglobin.status === 'high' && 
      resultMap.hematocrit && resultMap.hematocrit.status === 'high') {
    findings.push({
      en: "Your results show high levels of red blood cells, hemoglobin, and hematocrit. This could be due to dehydration or a condition that causes your body to make too many red blood cells.",
      ur: "آپ کے نتائج سرخ خون کے خلیات، ہیموگلوبن، اور ہیماٹوکرٹ کی زیادہ سطح دکھاتے ہیں۔ یہ پانی کی کمی یا ایسی حالت کی وجہ سے ہو سکتا ہے جس سے آپ کا جسم بہت زیادہ سرخ خون کے خلیات بناتا ہے۔"
    });
  }
  
  return findings;
};

// Check for critical values that require immediate medical attention
const checkForCriticalValues = (results: CBCResult[]): { en: string; ur: string }[] => {
  const criticalAlerts: { en: string; ur: string }[] = [];
  
  for (const result of results) {
    const { parameter, status, deviation } = result;
    
    // Critical thresholds for common parameters - with simplified explanations
    switch (parameter.id) {
      case 'hemoglobin':
        if (status === 'low' && parseFloat(parameter.value) < 7.0) {
          criticalAlerts.push({
            en: "IMPORTANT: Your hemoglobin is very low. This needs medical attention soon as you might feel very tired, dizzy, or short of breath.",
            ur: "اہم: آپ کا ہیموگلوبن بہت کم ہے۔ اس کے لیے جلد طبی توجہ کی ضرورت ہے کیونکہ آپ کو بہت تھکاوٹ، چکر آنا، یا سانس کی تکلیف محسوس ہو سکتی ہے۔"
          });
        }
        break;
      
      case 'wbc':
        if (status === 'low' && parseFloat(parameter.value) < 2.0) {
          criticalAlerts.push({
            en: "IMPORTANT: Your white blood cell count is very low. This means your body may have trouble fighting infections. Contact your doctor soon.",
            ur: "اہم: آپ کے سفید خون کے خلیات کی تعداد بہت کم ہے۔ اس کا مطلب ہے کہ آپ کے جسم کو انفیکشن سے لڑنے میں مشکل ہو سکتی ہے۔ جلد اپنے ڈاکٹر سے رابطہ کریں۔"
          });
        } else if (status === 'high' && parseFloat(parameter.value) > 30.0) {
          criticalAlerts.push({
            en: "IMPORTANT: Your white blood cell count is very high. Contact your doctor soon as this could indicate a serious infection or blood disorder.",
            ur: "اہم: آپ کے سفید خون کے خلیات کی تعداد بہت زیادہ ہے۔ جلد اپنے ڈاکٹر سے رابطہ کریں کیونکہ یہ سنگین انفیکشن یا خون کی خرابی کی نشاندہی کر سکتا ہے۔"
          });
        }
        break;
      
      case 'platelets':
        if (status === 'low' && parseFloat(parameter.value) < 30.0) {
          criticalAlerts.push({
            en: "IMPORTANT: Your platelet count is very low. This increases your risk of serious bleeding. Contact your doctor soon.",
            ur: "اہم: آپ کی پلیٹلیٹس کی تعداد بہت کم ہے۔ اس سے سنگین خون بہنے کا خطرہ بڑھ جاتا ہے۔ جلد اپنے ڈاکٹر سے رابطہ کریں۔"
          });
        }
        break;
    }
  }
  
  return criticalAlerts;
};

// Generate summary based on overall findings - simplified for layperson understanding
const generateSummary = (results: CBCResult[]): { en: string; ur: string } => {
  const abnormalResults = results.filter(r => r.status !== 'normal');
  
  if (abnormalResults.length === 0) {
    return {
      en: "Good news! All your blood test results are within normal ranges. This suggests your blood cells and related components are at healthy levels.",
      ur: "اچھی خبر! آپ کے خون کے ٹیسٹ کے تمام نتائج معمول کی حدود میں ہیں۔ اس سے پتہ چلتا ہے کہ آپ کے خون کے خلیات اور متعلقہ اجزاء صحت مند سطح پر ہیں۔"
    };
  }
  
  // Count low and high values
  const lowCount = abnormalResults.filter(r => r.status === 'low').length;
  const highCount = abnormalResults.filter(r => r.status === 'high').length;
  
  // Analyze relationships between parameters
  const relationshipFindings = analyzeRelationships(results);
  
  // Check for critical values
  const criticalAlerts = checkForCriticalValues(results);
  
  // Create a friendly, easy-to-understand summary
  let enSummary = `Your blood test results show ${abnormalResults.length} values that are outside the normal range (${lowCount} low and ${highCount} high). `;
  let urSummary = `آپ کے خون کے ٹیسٹ کے نتائج ${abnormalResults.length} قدروں کو دکھاتے ہیں جو معمول کی حد سے باہر ہیں (${lowCount} کم اور ${highCount} زیادہ)۔ `;
  
  // Add critical alerts to the beginning if present
  if (criticalAlerts.length > 0) {
    enSummary = criticalAlerts.map(alert => alert.en).join(' ') + ' ' + enSummary;
    urSummary = criticalAlerts.map(alert => alert.ur).join(' ') + ' ' + urSummary;
  }
  
  // Add key relationship findings
  if (relationshipFindings.length > 0) {
    const enFindings = relationshipFindings.map(finding => finding.en).join(' ');
    const urFindings = relationshipFindings.map(finding => finding.ur).join(' ');
    enSummary += enFindings + ' ';
    urSummary += urFindings + ' ';
  }
  
  // Add general advice
  enSummary += "Please discuss these results with your healthcare provider to understand what they mean for your overall health.";
  urSummary += "براہ کرم ان نتائج کے بارے میں اپنے ہیلتھ کیئر فراہم کنندہ سے بات کریں تاکہ آپ سمجھ سکیں کہ ان کا آپ کی مجموعی صحت کے لیے کیا مطلب ہے۔";
  
  return {
    en: enSummary,
    ur: urSummary
  };
};

// Main analyzer function
export const analyzeCBC = (data: CBCFormData): CBCAnalysis => {
  const results: CBCResult[] = data.parameters
    .filter(param => param.value !== '') // Only analyze parameters with values
    .map(param => {
      const value = parseFloat(param.value);
      const { min, max } = param.referenceRange;
      const status = getStatus(value, min, max);
      const deviation = calculateDeviation(value, min, max);
      const interpretation = generateInterpretation(param.id, status, deviation);
      
      return {
        parameter: param,
        status,
        deviation,
        interpretation
      };
    });
  
  const summary = generateSummary(results);
  
  return {
    summary,
    results
  };
};
