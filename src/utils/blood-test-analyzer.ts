
import { BloodTestFormData, BloodTestAnalysis, BloodTestResult } from '@/types/blood-test.types';
import { getBloodTestReferenceRange } from './blood-test-reference-ranges';

// Calculate status including critical levels
const getBloodTestStatus = (
  value: number, 
  min: number, 
  max: number, 
  parameterId: string
): 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high' => {
  // Critical thresholds for specific parameters
  const criticalThresholds: Record<string, { criticalLow?: number; criticalHigh?: number }> = {
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
    freeT3: { criticalLow: 1.0, criticalHigh: 8.0 }
  };

  const critical = criticalThresholds[parameterId];
  
  if (critical?.criticalLow && value < critical.criticalLow) return 'critical-low';
  if (critical?.criticalHigh && value > critical.criticalHigh) return 'critical-high';
  
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'normal';
};

// Calculate risk level based on deviation and parameter type
const calculateRiskLevel = (
  status: string, 
  deviation: number, 
  parameterId: string
): 'low' | 'moderate' | 'high' | 'critical' => {
  if (status.includes('critical')) return 'critical';
  
  const highRiskParameters = ['ldlCholesterol', 'triglycerides', 'hba1c', 'fastingGlucose'];
  const moderateDeviationThreshold = highRiskParameters.includes(parameterId) ? 20 : 30;
  const highDeviationThreshold = highRiskParameters.includes(parameterId) ? 40 : 60;
  
  const absDeviation = Math.abs(deviation);
  
  if (absDeviation < moderateDeviationThreshold) return 'low';
  if (absDeviation < highDeviationThreshold) return 'moderate';
  return 'high';
};

// Generate detailed interpretations for each parameter
const generateBloodTestInterpretation = (
  parameterId: string, 
  status: string, 
  testType: 'lipid' | 'glucose' | 'thyroid'
): { en: string; ur: string } => {
  
  const interpretations: Record<string, Record<string, { en: string; ur: string }>> = {
    // LIPID PROFILE INTERPRETATIONS
    totalCholesterol: {
      normal: {
        en: "Your total cholesterol is within healthy limits. This reduces your risk of heart disease and stroke.",
        ur: "آپ کا کل کولیسٹرول صحت مند حدود میں ہے۔ اس سے دل کی بیماری اور فالج کا خطرہ کم ہوتا ہے۔"
      },
      low: {
        en: "Your total cholesterol is low, which is generally good for heart health. However, very low levels may sometimes indicate other health issues.",
        ur: "آپ کا کل کولیسٹرول کم ہے، جو عام طور پر دل کی صحت کے لیے اچھا ہے۔ تاہم، بہت کم سطح کبھی کبھار دیگر صحت کے مسائل کی نشاندہی کر سکتی ہے۔"
      },
      high: {
        en: "Your total cholesterol is elevated, increasing your risk of heart disease and stroke. Dietary changes and exercise can help lower it.",
        ur: "آپ کا کل کولیسٹرول بلند ہے، جو دل کی بیماری اور فالج کا خطرہ بڑھاتا ہے۔ غذائی تبدیلیاں اور ورزش اسے کم کرنے میں مدد کر سکتی ہے۔"
      },
      'critical-high': {
        en: "CRITICAL: Your total cholesterol is dangerously high. This significantly increases cardiovascular risks. Immediate medical attention is needed.",
        ur: "تشویشناک: آپ کا کل کولیسٹرول خطرناک حد تک بلند ہے۔ اس سے دل کی بیماریوں کا خطرہ نمایاں طور پر بڑھ جاتا ہے۔ فوری طبی توجہ کی ضرورت ہے۔"
      }
    },
    
    ldlCholesterol: {
      normal: {
        en: "Your LDL (bad) cholesterol is at optimal levels, which is excellent for heart health and reduces arterial plaque buildup.",
        ur: "آپ کا ایل ڈی ایل (برا) کولیسٹرول بہترین سطح پر ہے، جو دل کی صحت کے لیے بہترین ہے اور شریانوں میں تختی جمنے کو کم کرتا ہے۔"
      },
      high: {
        en: "Your LDL cholesterol is high, which can lead to arterial plaque buildup and increase heart disease risk. Consider dietary changes and physical activity.",
        ur: "آپ کا ایل ڈی ایل کولیسٹرول زیادہ ہے، جو شریانوں میں تختی کا باعث بن سکتا ہے اور دل کی بیماری کا خطرہ بڑھا سکتا ہے۔ غذائی تبدیلیاں اور جسمانی سرگرمی پر غور کریں۔"
      },
      'critical-high': {
        en: "CRITICAL: Your LDL cholesterol is extremely high, posing serious cardiovascular risks. Immediate medical intervention may be required.",
        ur: "تشویشناک: آپ کا ایل ڈی ایل کولیسٹرول انتہائی زیادہ ہے، جو سنگین دل کی بیماریوں کا خطرہ ہے۔ فوری طبی مداخلت کی ضرورت ہو سکتی ہے۔"
      }
    },
    
    hdlCholesterol: {
      normal: {
        en: "Your HDL (good) cholesterol is at healthy levels, which helps protect against heart disease by removing bad cholesterol from arteries.",
        ur: "آپ کا ایچ ڈی ایل (اچھا) کولیسٹرول صحت مند سطح پر ہے، جو شریانوں سے برے کولیسٹرول کو ہٹا کر دل کی بیماری سے بچاتا ہے۔"
      },
      low: {
        en: "Your HDL cholesterol is low, which may increase heart disease risk. Regular exercise and healthy fats can help increase HDL levels.",
        ur: "آپ کا ایچ ڈی ایل کولیسٹرول کم ہے، جو دل کی بیماری کا خطرہ بڑھا سکتا ہے۔ باقاعدگی سے ورزش اور صحت مند چکنائی ایچ ڈی ایل کی سطح بڑھانے میں مدد کر سکتی ہے۔"
      },
      'critical-low': {
        en: "CRITICAL: Your HDL cholesterol is dangerously low, significantly increasing cardiovascular risk. Immediate lifestyle changes and medical consultation needed.",
        ur: "تشویشناک: آپ کا ایچ ڈی ایل کولیسٹرول خطرناک حد تک کم ہے، جو دل کی بیماریوں کا خطرہ نمایاں طور پر بڑھاتا ہے۔ فوری طرز زندگی میں تبدیلی اور طبی مشورہ ضروری ہے۔"
      }
    },
    
    triglycerides: {
      normal: {
        en: "Your triglyceride levels are normal, which is good for heart health and reduces the risk of pancreatitis.",
        ur: "آپ کی ٹرائگلیسرائیڈ کی سطح معمول کے مطابق ہے، جو دل کی صحت کے لیے اچھا ہے اور لبلبے کی سوزش کا خطرہ کم کرتا ہے۔"
      },
      high: {
        en: "Your triglycerides are elevated, which increases risk of heart disease and pancreatitis. Reducing sugar and refined carbs can help.",
        ur: "آپ کی ٹرائگلیسرائیڈ بلند ہے، جو دل کی بیماری اور لبلبے کی سوزش کا خطرہ بڑھاتا ہے۔ چینی اور ریفائنڈ کاربوہائیڈریٹس کم کرنا مدد کر سکتا ہے۔"
      },
      'critical-high': {
        en: "CRITICAL: Your triglycerides are extremely high, posing serious risks of pancreatitis and cardiovascular disease. Immediate medical attention required.",
        ur: "تشویشناک: آپ کی ٹرائگلیسرائیڈ انتہائی زیادہ ہے، جو لبلبے کی سوزش اور دل کی بیماریوں کا سنگین خطرہ ہے۔ فوری طبی توجہ ضروری ہے۔"
      }
    },

    // GLUCOSE TEST INTERPRETATIONS
    fastingGlucose: {
      normal: {
        en: "Your fasting glucose is normal, indicating good blood sugar control and low diabetes risk.",
        ur: "آپ کا خالی پیٹ گلوکوز معمول کے مطابق ہے، جو اچھے خون میں شکر کے کنٹرول اور ذیابیطس کے کم خطرے کی نشاندہی کرتا ہے۔"
      },
      low: {
        en: "Your fasting glucose is low (hypoglycemia), which may cause dizziness, weakness, or confusion. Monitor symptoms and consult your doctor.",
        ur: "آپ کا خالی پیٹ گلوکوز کم ہے (ہائپوگلائسیمیا)، جو چکر آنا، کمزوری، یا بے ہوشی کا باعث بن سکتا ہے۔ علامات پر نظر رکھیں اور اپنے ڈاکٹر سے مشورہ کریں۔"
      },
      high: {
        en: "Your fasting glucose is elevated, suggesting pre-diabetes or diabetes. Lifestyle changes and medical follow-up are recommended.",
        ur: "آپ کا خالی پیٹ گلوکوز بلند ہے، جو پری ڈایبیٹیز یا ذیابیطس کی تجویز کرتا ہے۔ طرز زندگی میں تبدیلی اور طبی پیروی کی سفارش کی جاتی ہے۔"
      },
      'critical-low': {
        en: "CRITICAL: Severely low blood glucose. This can be life-threatening. Seek immediate medical attention or consume quick-acting carbohydrates.",
        ur: "تشویشناک: خون میں گلوکوز انتہائی کم ہے۔ یہ جان کے لیے خطرناک ہو سکتا ہے۔ فوری طبی مدد حاصل کریں یا فوری طور پر کام کرنے والے کاربوہائیڈریٹس استعمال کریں۔"
      },
      'critical-high': {
        en: "CRITICAL: Dangerously high blood glucose levels. This may indicate diabetic emergency. Seek immediate medical care.",
        ur: "تشویشناک: خون میں گلوکوز خطرناک حد تک زیادہ ہے۔ یہ ذیابیطس کی ایمرجنسی کی نشاندہی کر سکتا ہے۔ فوری طبی مدد حاصل کریں۔"
      }
    },
    
    hba1c: {
      normal: {
        en: "Your HbA1c is normal, indicating excellent long-term blood sugar control over the past 2-3 months.",
        ur: "آپ کا HbA1c معمول کے مطابق ہے، جو پچھلے 2-3 مہینوں میں بہترین طویل مدتی خون میں شکر کے کنٹرول کی نشاندہی کرتا ہے۔"
      },
      high: {
        en: "Your HbA1c is elevated, indicating poor blood sugar control over recent months. This increases diabetes complications risk.",
        ur: "آپ کا HbA1c بلند ہے، جو حالیہ مہینوں میں خراب خون میں شکر کے کنٹرول کی نشاندہی کرتا ہے۔ اس سے ذیابیطس کی پیچیدگیوں کا خطرہ بڑھتا ہے۔"
      },
      'critical-high': {
        en: "CRITICAL: Your HbA1c is dangerously high, indicating very poor diabetes control and high risk of serious complications.",
        ur: "تشویشناک: آپ کا HbA1c خطرناک حد تک بلند ہے، جو ذیابیطس کے بہت خراب کنٹرول اور سنگین پیچیدگیوں کے زیادہ خطرے کی نشاندہی کرتا ہے۔"
      }
    },

    // THYROID FUNCTION INTERPRETATIONS  
    tsh: {
      normal: {
        en: "Your TSH level is normal, indicating healthy thyroid function and proper hormone regulation.",
        ur: "آپ کا TSH کی سطح معمول کے مطابق ہے، جو صحت مند تھائرائیڈ کے کام اور مناسب ہارمون کی تنظیم کی نشاندہی کرتا ہے۔"
      },
      low: {
        en: "Your TSH is low, which may indicate an overactive thyroid (hyperthyroidism). This can cause rapid heartbeat, weight loss, and anxiety.",
        ur: "آپ کا TSH کم ہے، جو زیادہ فعال تھائرائیڈ (ہائپرتھائرائیڈزم) کی نشاندہی کر سکتا ہے۔ اس سے تیز دل کی دھڑکن، وزن کمی، اور بے چینی ہو سکتی ہے۔"
      },
      high: {
        en: "Your TSH is elevated, suggesting an underactive thyroid (hypothyroidism). This can cause fatigue, weight gain, and cold sensitivity.",
        ur: "آپ کا TSH بلند ہے، جو کم فعال تھائرائیڈ (ہائپوتھائرائیڈزم) کی تجویز کرتا ہے۔ اس سے تھکاوٹ، وزن بڑھنا، اور سردی کی حساسیت ہو سکتی ہے۔"
      },
      'critical-low': {
        en: "CRITICAL: TSH is severely suppressed, indicating severe hyperthyroidism. This can cause dangerous heart rhythm problems. Seek immediate care.",
        ur: "تشویشناک: TSH انتہائی دبا ہوا ہے، جو شدید ہائپرتھائرائیڈزم کی نشاندہی کرتا ہے۔ اس سے خطرناک دل کی تال کے مسائل ہو سکتے ہیں۔ فوری مدد حاصل کریں۔"
      },
      'critical-high': {
        en: "CRITICAL: TSH is extremely high, indicating severe hypothyroidism. This can affect heart function and mental state. Immediate medical attention needed.",
        ur: "تشویشناک: TSH انتہائی زیادہ ہے، جو شدید ہائپوتھائرائیڈزم کی نشاندہی کرتا ہے۔ اس سے دل کا کام اور ذہنی حالت متاثر ہو سکتی ہے۔ فوری طبی توجہ ضروری ہے۔"
      }
    },
    
    freeT4: {
      normal: {
        en: "Your Free T4 level is normal, indicating adequate thyroid hormone production for your body's metabolism.",
        ur: "آپ کا Free T4 کی سطح معمول کے مطابق ہے، جو آپ کے جسم کے میٹابولزم کے لیے مناسب تھائرائیڈ ہارمون کی پیداوار کی نشاندہی کرتا ہے۔"
      },
      low: {
        en: "Your Free T4 is low, which may cause symptoms like fatigue, weight gain, hair loss, and feeling cold.",
        ur: "آپ کا Free T4 کم ہے، جو تھکاوٹ، وزن بڑھنا، بالوں کا گرنا، اور سردی محسوس کرنے جیسی علامات کا باعث بن سکتا ہے۔"
      },
      high: {
        en: "Your Free T4 is elevated, which may cause symptoms like rapid heartbeat, weight loss, nervousness, and heat intolerance.",
        ur: "آپ کا Free T4 بلند ہے، جو تیز دل کی دھڑکن، وزن کمی، گھبراہٹ، اور گرمی کی عدم برداشت جیسی علامات کا باعث بن سکتا ہے۔"
      }
    }
  };

  const paramInterpretations = interpretations[parameterId];
  if (!paramInterpretations || !paramInterpretations[status]) {
    return {
      en: `Your ${parameterId} level is ${status}.`,
      ur: `آپ کی ${parameterId} کی سطح ${status} ہے۔`
    };
  }

  return paramInterpretations[status];
};

// Generate recommendations based on test results
const generateRecommendations = (
  parameterId: string,
  status: string,
  testType: 'lipid' | 'glucose' | 'thyroid'
): { en: string[]; ur: string[] } => {
  
  const recommendations: Record<string, Record<string, { en: string[]; ur: string[] }>> = {
    // LIPID RECOMMENDATIONS
    totalCholesterol: {
      high: {
        en: [
          "Follow a heart-healthy diet low in saturated and trans fats",
          "Increase physical activity to at least 150 minutes per week",
          "Maintain a healthy weight",
          "Consider consulting a dietitian for personalized meal planning"
        ],
        ur: [
          "سیر شدہ اور ٹرانس چکنائی کم والی دل کے لیے صحت مند خوراک اپنائیں",
          "ہفتے میں کم از کم 150 منٹ جسمانی سرگرمی بڑھائیں",
          "صحت مند وزن برقرار رکھیں",
          "ذاتی کھانے کی منصوبہ بندی کے لیے غذائی ماہر سے مشورہ کرنے پر غور کریں"
        ]
      }
    },
    
    ldlCholesterol: {
      high: {
        en: [
          "Reduce saturated fat intake to less than 7% of total calories",
          "Include soluble fiber foods like oats, beans, and fruits",
          "Add plant sterols and stanols to your diet",
          "Consider omega-3 fatty acids from fish or supplements"
        ],
        ur: [
          "کل کیلوریز کے 7٪ سے کم سیر شدہ چکنائی کا استعمال کریں",
          "جئی، پھلیاں، اور پھلوں جیسے حل پذیر فائبر والے کھانے شامل کریں",
          "اپنی خوراک میں پلانٹ سٹیرولز اور سٹینولز شامل کریں",
          "مچھلی یا سپلیمنٹس سے اومیگا 3 فیٹی ایسڈ پر غور کریں"
        ]
      }
    },
    
    // GLUCOSE RECOMMENDATIONS
    fastingGlucose: {
      high: {
        en: [
          "Follow a balanced diet with controlled carbohydrate portions",
          "Engage in regular physical activity, especially after meals",
          "Monitor blood glucose levels as recommended by your doctor",
          "Maintain a healthy weight through diet and exercise"
        ],
        ur: [
          "کنٹرولڈ کاربوہائیڈریٹ حصوں کے ساتھ متوازن خوراک اپنائیں",
          "خاص طور پر کھانے کے بعد باقاعدگی سے جسمانی سرگرمی میں مشغول ہوں",
          "اپنے ڈاکٹر کی سفارش کے مطابق خون میں گلوکوز کی سطح کی نگرانی کریں",
          "خوراک اور ورزش کے ذریعے صحت مند وزن برقرار رکھیں"
        ]
      }
    },
    
    // THYROID RECOMMENDATIONS
    tsh: {
      high: {
        en: [
          "Follow up with an endocrinologist for proper evaluation",
          "Ensure adequate iodine intake through iodized salt or supplements",
          "Monitor symptoms like fatigue, weight gain, and cold intolerance",
          "Consider selenium supplements if recommended by your doctor"
        ],
        ur: [
          "مناسب تشخیص کے لیے اینڈوکرائنولوجسٹ سے فالو اپ کریں",
          "آیوڈین والے نمک یا سپلیمنٹس کے ذریعے مناسب آیوڈین کا استعمال یقینی بنائیں",
          "تھکاوٹ، وزن بڑھنا، اور سردی کی عدم برداشت جیسی علامات کی نگرانی کریں",
          "اگر آپ کے ڈاکٹر نے سفارش کی ہو تو سیلینیم سپلیمنٹس پر غور کریں"
        ]
      }
    }
  };

  const paramRecommendations = recommendations[parameterId];
  if (!paramRecommendations || !paramRecommendations[status]) {
    return {
      en: ["Consult with your healthcare provider for personalized recommendations"],
      ur: ["ذاتی سفارشات کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں"]
    };
  }

  return paramRecommendations[status];
};

// Main analyzer function
export const analyzeBloodTest = (data: BloodTestFormData): BloodTestAnalysis => {
  const results: BloodTestResult[] = data.parameters
    .filter(param => param.value !== '')
    .map(param => {
      const value = parseFloat(param.value);
      const referenceRange = getBloodTestReferenceRange(
        data.testType as 'lipid' | 'glucose' | 'thyroid',
        param.id,
        data.patientGender as 'male' | 'female',
        data.patientAge || 30
      );
      
      const { min, max } = referenceRange;
      const status = getBloodTestStatus(value, min, max, param.id);
      const deviation = value < min ? ((value - min) / min) * 100 : 
                       value > max ? ((value - max) / max) * 100 : 0;
      const riskLevel = calculateRiskLevel(status, deviation, param.id);
      const interpretation = generateBloodTestInterpretation(param.id, status, data.testType as any);
      const recommendations = generateRecommendations(param.id, status, data.testType as any);

      return {
        parameter: param,
        status: status as any,
        deviation,
        riskLevel,
        interpretation,
        recommendations
      };
    });

  // Calculate overall risk
  const riskLevels = results.map(r => r.riskLevel);
  const overallRisk = riskLevels.includes('critical') ? 'critical' :
                     riskLevels.includes('high') ? 'high' :
                     riskLevels.includes('moderate') ? 'moderate' : 'low';

  // Generate summary and related conditions
  const summary = generateTestSummary(results, data.testType);
  const relatedConditions = identifyRelatedConditions(results, data.testType);

  return {
    testType: data.testType,
    summary,
    overallRisk,
    results,
    relatedConditions
  };
};

// Generate test-specific summary
const generateTestSummary = (results: BloodTestResult[], testType: string): { en: string; ur: string } => {
  const abnormalResults = results.filter(r => r.status !== 'normal');
  const criticalResults = results.filter(r => r.status.includes('critical'));
  
  if (criticalResults.length > 0) {
    return {
      en: `CRITICAL ALERT: ${criticalResults.length} parameters show critical values requiring immediate medical attention. Please contact your healthcare provider immediately.`,
      ur: `تشویشناک انتباہ: ${criticalResults.length} پیرامیٹرز میں تشویشناک قدریں ہیں جن کے لیے فوری طبی توجہ درکار ہے۔ براہ کرم فوری طور پر اپنے صحت کی دیکھ بھال فراہم کنندہ سے رابطہ کریں۔`
    };
  }
  
  if (abnormalResults.length === 0) {
    const testNames = {
      lipid: { en: "lipid profile", ur: "لپڈ پروفائل" },
      glucose: { en: "glucose tests", ur: "گلوکوز ٹیسٹس" },
      thyroid: { en: "thyroid function tests", ur: "تھائرائیڈ فنکشن ٹیسٹس" }
    };
    
    const testName = testNames[testType as keyof typeof testNames];
    return {
      en: `Excellent! All your ${testName.en} results are within normal ranges, indicating good health in this area.`,
      ur: `بہترین! آپ کے تمام ${testName.ur} کے نتائج معمول کی حدود میں ہیں، جو اس علاقے میں اچھی صحت کی نشاندہی کرتے ہیں۔`
    };
  }
  
  return {
    en: `Your test results show ${abnormalResults.length} parameters outside normal ranges. Review the detailed analysis below and consult your healthcare provider for guidance.`,
    ur: `آپ کے ٹیسٹ کے نتائج ${abnormalResults.length} پیرامیٹرز کو معمول کی حدود سے باہر دکھاتے ہیں۔ نیچے تفصیلی تجزیہ دیکھیں اور رہنمائی کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔`
  };
};

// Identify related medical conditions
const identifyRelatedConditions = (results: BloodTestResult[], testType: string): { en: string[]; ur: string[] } => {
  const conditions = { en: [] as string[], ur: [] as string[] };
  
  if (testType === 'lipid') {
    const highLDL = results.find(r => r.parameter.id === 'ldlCholesterol' && r.status === 'high');
    const lowHDL = results.find(r => r.parameter.id === 'hdlCholesterol' && r.status === 'low');
    const highTrig = results.find(r => r.parameter.id === 'triglycerides' && r.status === 'high');
    
    if (highLDL || lowHDL || highTrig) {
      conditions.en.push("Increased cardiovascular disease risk", "Potential metabolic syndrome");
      conditions.ur.push("دل کی بیماری کا بڑھا ہوا خطرہ", "ممکنہ میٹابولک سنڈروم");
    }
  }
  
  if (testType === 'glucose') {
    const highGlucose = results.find(r => r.parameter.id === 'fastingGlucose' && r.status === 'high');
    const highHbA1c = results.find(r => r.parameter.id === 'hba1c' && r.status === 'high');
    
    if (highGlucose || highHbA1c) {
      conditions.en.push("Pre-diabetes or diabetes mellitus", "Increased risk of diabetic complications");
      conditions.ur.push("پری ڈایبیٹیز یا ذیابیطس میلیٹس", "ذیابیطس کی پیچیدگیوں کا بڑھا ہوا خطرہ");
    }
  }
  
  if (testType === 'thyroid') {
    const abnormalTSH = results.find(r => r.parameter.id === 'tsh' && r.status !== 'normal');
    
    if (abnormalTSH) {
      if (abnormalTSH.status === 'high') {
        conditions.en.push("Hypothyroidism (underactive thyroid)", "Potential autoimmune thyroid disease");
        conditions.ur.push("ہائپوتھائرائیڈزم (کم فعال تھائرائیڈ)", "ممکنہ خود کار قوت مدافعت تھائرائیڈ کی بیماری");
      } else if (abnormalTSH.status === 'low') {
        conditions.en.push("Hyperthyroidism (overactive thyroid)", "Potential Graves' disease or thyroiditis");
        conditions.ur.push("ہائپرتھائرائیڈزم (زیادہ فعال تھائرائیڈ)", "ممکنہ گریوز ڈیزیز یا تھائرائیڈائٹس");
      }
    }
  }
  
  return conditions;
};
