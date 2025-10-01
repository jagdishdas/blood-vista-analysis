import { BloodTestFormData, BloodTestAnalysis, BloodTestResult } from '@/types/blood-test.types';
import { getBloodTestReferenceRange } from './blood-test-reference-ranges';

// Calculate status including critical levels for all test types
const getBloodTestStatus = (
  value: number, 
  min: number, 
  max: number, 
  parameterId: string
): 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high' => {
  // Critical thresholds for all test parameters
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
    aptt: { criticalHigh: 60 }
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
  
  const highRiskParameters = [
    'ldlCholesterol', 'triglycerides', 'hba1c', 'fastingGlucose',
    'troponinI', 'troponinT', 'creatinine', 'bun'
  ];
  const moderateDeviationThreshold = highRiskParameters.includes(parameterId) ? 20 : 30;
  
  if (Math.abs(deviation) > 50) return 'high';
  if (Math.abs(deviation) > moderateDeviationThreshold) return 'moderate';
  return 'low';
};

// Generate comprehensive interpretations for all test parameters
const generateBloodTestInterpretation = (
  parameterId: string, 
  status: string, 
  testType: 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation'
): { en: string; ur: string } => {
  
  const interpretations: Record<string, Record<string, { en: string; ur: string }>> = {
    // LIPID PROFILE INTERPRETATIONS
    totalCholesterol: {
      normal: { en: "Your total cholesterol is at healthy levels, reducing cardiovascular disease risk.", ur: "آپ کا کل کولیسٹرول صحت مند سطح پر ہے، جو دل کی بیماری کا خطرہ کم کرتا ہے۔" },
      high: { en: "Your total cholesterol is elevated, increasing heart disease risk. Lifestyle modifications recommended.", ur: "آپ کا کل کولیسٹرول بلند ہے، دل کی بیماری کا خطرہ بڑھاتا ہے۔ طرز زندگی میں تبدیلیاں تجویز کی جاتی ہیں۔" },
      'critical-high': { en: "Your total cholesterol is critically high. Immediate medical evaluation and treatment needed.", ur: "آپ کا کل کولیسٹرول انتہائی بلند ہے۔ فوری طبی جانچ اور علاج ضروری ہے۔" }
    },
    ldlCholesterol: {
      normal: { en: "Your LDL cholesterol (bad cholesterol) is at optimal levels, protecting your heart.", ur: "آپ کا ایل ڈی ایل کولیسٹرول (خراب کولیسٹرول) بہترین سطح پر ہے، آپ کے دل کی حفاظت کرتا ہے۔" },
      high: { en: "Your LDL cholesterol is high, increasing risk of plaque buildup in arteries. Dietary changes advised.", ur: "آپ کا ایل ڈی ایل کولیسٹرول بلند ہے، شریانوں میں پلاک جمع ہونے کا خطرہ بڑھاتا ہے۔ غذائی تبدیلیاں تجویز کی جاتی ہیں۔" },
      'critical-high': { en: "Your LDL cholesterol is dangerously high. Statin therapy strongly recommended.", ur: "آپ کا ایل ڈی ایل کولیسٹرول خطرناک حد تک بلند ہے۔ سٹیٹن تھراپی بہت ضروری ہے۔" }
    },
    hdlCholesterol: {
      normal: { en: "Your HDL cholesterol (good cholesterol) is at protective levels for your heart.", ur: "آپ کا ایچ ڈی ایل کولیسٹرول (اچھا کولیسٹرول) دل کی حفاظتی سطح پر ہے۔" },
      low: { en: "Your HDL cholesterol is low, reducing heart protection. Exercise and healthy fats can help.", ur: "آپ کا ایچ ڈی ایل کولیسٹرول کم ہے، دل کی حفاظت کم ہوتی ہے۔ ورزش اور صحت مند چکنائی مدد کر سکتی ہے۔" },
      'critical-low': { en: "Your HDL cholesterol is critically low, significantly increasing cardiovascular risk.", ur: "آپ کا ایچ ڈی ایل کولیسٹرول انتہائی کم ہے، دل کی بیماری کا خطرہ بہت بڑھ جاتا ہے۔" }
    },
    triglycerides: {
      normal: { en: "Your triglyceride levels are normal, indicating good fat metabolism.", ur: "آپ کی ٹرائگلیسرائیڈ کی سطح معمول کے مطابق ہے، اچھے چکنائی میٹابولزم کی نشاندہی کرتی ہے۔" },
      high: { en: "Your triglycerides are elevated, increasing risk of pancreatitis and heart disease. Reduce sugar intake.", ur: "آپ کی ٹرائگلیسرائیڈ بلند ہیں، لبلبے کی سوزش اور دل کی بیماری کا خطرہ بڑھاتی ہیں۔ شکر کم کریں۔" },
      'critical-high': { en: "Your triglycerides are dangerously high, posing severe risk of pancreatitis. Urgent treatment needed.", ur: "آپ کی ٹرائگلیسرائیڈ خطرناک حد تک بلند ہیں، لبلبے کی سوزش کا شدید خطرہ۔ فوری علاج ضروری۔" }
    },
    
    // GLUCOSE TEST INTERPRETATIONS
    fastingGlucose: {
      normal: { en: "Your fasting glucose is normal, indicating good blood sugar control.", ur: "آپ کا خالی پیٹ گلوکوز معمول کے مطابق ہے، خون میں شکر کا اچھا کنٹرول ظاہر کرتا ہے۔" },
      high: { en: "Your fasting glucose is elevated, suggesting prediabetes or diabetes. Dietary changes needed.", ur: "آپ کا خالی پیٹ گلوکوز بلند ہے، پری ڈایبیٹیز یا ڈایبیٹیز کی نشاندہی کرتا ہے۔ غذائی تبدیلیاں ضروری۔" },
      low: { en: "Your fasting glucose is low, may cause dizziness or weakness. Consult your doctor.", ur: "آپ کا خالی پیٹ گلوکوز کم ہے، چکر یا کمزوری ہو سکتی ہے۔ ڈاکٹر سے مشورہ کریں۔" },
      'critical-high': { en: "Your fasting glucose is critically high. Immediate diabetes management required.", ur: "آپ کا خالی پیٹ گلوکوز انتہائی بلند ہے۔ فوری ڈایبیٹیز کا انتظام ضروری ہے۔" },
      'critical-low': { en: "Your glucose is dangerously low. Risk of severe hypoglycemia. Seek immediate medical help.", ur: "آپ کا گلوکوز خطرناک حد تک کم ہے۔ شدید ہائپوگلیسیمیا کا خطرہ۔ فوری طبی مدد لیں۔" }
    },
    hba1c: {
      normal: { en: "Your HbA1c is normal, showing good long-term blood sugar control over past 3 months.", ur: "آپ کا HbA1c معمول کے مطابق ہے، گزشتہ 3 ماہ میں خون میں شکر کا اچھا طویل مدتی کنٹرول ظاہر کرتا ہے۔" },
      high: { en: "Your HbA1c indicates poor blood sugar control, increasing diabetes complications risk.", ur: "آپ کا HbA1c خون میں شکر کا خراب کنٹرول ظاہر کرتا ہے، ڈایبیٹیز کی پیچیدگیوں کا خطرہ بڑھاتا ہے۔" },
      'critical-high': { en: "Your HbA1c is critically elevated. Severe diabetes requiring intensive management.", ur: "آپ کا HbA1c انتہائی بلند ہے۔ شدید ڈایبیٹیز جس کے لیے گہری نگرانی ضروری ہے۔" }
    },
    
    // THYROID INTERPRETATIONS
    tsh: {
      normal: { en: "Your TSH level is normal, indicating healthy thyroid function.", ur: "آپ کی TSH کی سطح معمول کے مطابق ہے، صحت مند تھائرائیڈ فنکشن کی نشاندہی کرتی ہے۔" },
      high: { en: "Your TSH is elevated, suggesting hypothyroidism (underactive thyroid). May cause fatigue and weight gain.", ur: "آپ کی TSH بلند ہے، ہائپوتھائیرائیڈزم (کم فعال تھائرائیڈ) کی تجویز کرتی ہے۔ تھکاوٹ اور وزن بڑھنا ہو سکتا ہے۔" },
      low: { en: "Your TSH is low, suggesting hyperthyroidism (overactive thyroid). May cause anxiety and weight loss.", ur: "آپ کی TSH کم ہے، ہائپرتھائیرائیڈزم (زیادہ فعال تھائرائیڈ) کی تجویز کرتی ہے۔ بے چینی اور وزن کم ہونا ہو سکتا ہے۔" },
      'critical-low': { en: "Your TSH is severely suppressed. Risk of thyroid storm. Urgent endocrinology referral needed.", ur: "آپ کی TSH شدید طور پر دبی ہوئی ہے۔ تھائرائیڈ طوفان کا خطرہ۔ فوری اینڈوکرائنولوجی ریفرل ضروری۔" }
    },
    freeT4: {
      normal: { en: "Your Free T4 is normal, showing adequate thyroid hormone production.", ur: "آپ کی فری T4 معمول کے مطابق ہے، مناسب تھائرائیڈ ہارمون کی پیداوار ظاہر کرتی ہے۔" },
      high: { en: "Your Free T4 is elevated, confirming hyperthyroidism. Treatment required to prevent complications.", ur: "آپ کی فری T4 بلند ہے، ہائپرتھائیرائیڈزم کی تصدیق کرتی ہے۔ پیچیدگیوں سے بچنے کے لیے علاج ضروری۔" },
      low: { en: "Your Free T4 is low, confirming hypothyroidism. Thyroid hormone replacement may be needed.", ur: "آپ کی فری T4 کم ہے، ہائپوتھائیرائیڈزم کی تصدیق کرتی ہے۔ تھائرائیڈ ہارمون کی تبدیلی کی ضرورت ہو سکتی ہے۔" }
    },
    
    // LIVER FUNCTION INTERPRETATIONS
    alt: {
      normal: { en: "Your ALT level is normal, indicating healthy liver function.", ur: "آپ کی ALT کی سطح معمول کے مطابق ہے، صحت مند جگر کے فنکشن کی نشاندہی کرتی ہے۔" },
      high: { en: "Your ALT is elevated, suggesting liver inflammation or damage. Avoid alcohol and hepatotoxic drugs.", ur: "آپ کی ALT بلند ہے، جگر کی سوزش یا نقصان کی تجویز کرتی ہے۔ الکحل اور جگر کے لیے نقصان دہ ادویات سے بچیں۔" },
      'critical-high': { en: "Your ALT is critically elevated, indicating severe liver injury. Urgent hepatology evaluation needed.", ur: "آپ کی ALT انتہائی بلند ہے، شدید جگر کی چوٹ کی نشاندہی کرتی ہے۔ فوری ہیپیٹولوجی جانچ ضروری۔" }
    },
    ast: {
      normal: { en: "Your AST level is normal, indicating healthy liver and muscle function.", ur: "آپ کی AST کی سطح معمول کے مطابق ہے، صحت مند جگر اور پٹھوں کے فنکشن کی نشاندہی کرتی ہے۔" },
      high: { en: "Your AST is elevated. May indicate liver damage, muscle injury, or recent heart attack.", ur: "آپ کی AST بلند ہے۔ جگر کے نقصان، پٹھوں کی چوٹ، یا حالیہ دل کا دورہ ظاہر کر سکتی ہے۔" }
    },
    totalBilirubin: {
      normal: { en: "Your total bilirubin is normal, showing good liver detoxification.", ur: "آپ کا کل بلیروبن معمول کے مطابق ہے، اچھی جگر کی صفائی ظاہر کرتا ہے۔" },
      high: { en: "Your bilirubin is elevated, may cause jaundice. Indicates liver dysfunction or bile duct obstruction.", ur: "آپ کا بلیروبن بلند ہے، یرقان ہو سکتا ہے۔ جگر کی خرابی یا صفرا کی نالی میں رکاوٹ ظاہر کرتا ہے۔" },
      'critical-high': { en: "Your bilirubin is critically high. Risk of kernicterus. Immediate medical intervention required.", ur: "آپ کا بلیروبن انتہائی بلند ہے۔ دماغی نقصان کا خطرہ۔ فوری طبی مداخلت ضروری۔" }
    },
    albumin: {
      normal: { en: "Your albumin level is normal, showing good protein synthesis by liver.", ur: "آپ کی البیومن کی سطح معمول کے مطابق ہے، جگر کی طرف سے اچھی پروٹین کی ترکیب ظاہر کرتی ہے۔" },
      low: { en: "Your albumin is low, may indicate chronic liver disease, malnutrition, or kidney problems.", ur: "آپ کی البیومن کم ہے، دائمی جگر کی بیماری، غذائی کمی، یا گردے کے مسائل ظاہر کر سکتی ہے۔" }
    },
    
    // KIDNEY FUNCTION INTERPRETATIONS
    creatinine: {
      normal: { en: "Your creatinine level is normal, indicating good kidney function.", ur: "آپ کی کریٹینین کی سطح معمول کے مطابق ہے، اچھے گردے کے فنکشن کی نشاندہی کرتی ہے۔" },
      high: { en: "Your creatinine is elevated, suggesting reduced kidney function. Stay well hydrated.", ur: "آپ کی کریٹینین بلند ہے، گردوں کے کم فنکشن کی تجویز کرتی ہے۔ اچھی طرح ہائیڈریٹ رہیں۔" },
      'critical-high': { en: "Your creatinine is critically high, indicating severe kidney dysfunction. Dialysis may be needed.", ur: "آپ کی کریٹینین انتہائی بلند ہے، شدید گردوں کی خرابی ظاہر کرتی ہے۔ ڈائلیسس کی ضرورت ہو سکتی ہے۔" }
    },
    bun: {
      normal: { en: "Your BUN level is normal, showing proper kidney waste filtration.", ur: "آپ کی BUN کی سطح معمول کے مطابق ہے، گردوں کی مناسب فضلہ فلٹریشن ظاہر کرتی ہے۔" },
      high: { en: "Your BUN is elevated, may indicate dehydration or kidney problems. Increase water intake.", ur: "آپ کی BUN بلند ہے، پانی کی کمی یا گردوں کے مسائل ظاہر کر سکتی ہے۔ پانی کی مقدار بڑھائیں۔" }
    },
    egfr: {
      normal: { en: "Your eGFR is normal, indicating excellent kidney filtration function.", ur: "آپ کی eGFR معمول کے مطابق ہے، بہترین گردوں کی فلٹریشن فنکشن ظاہر کرتی ہے۔" },
      low: { en: "Your eGFR is low, indicating reduced kidney function. May progress to chronic kidney disease.", ur: "آپ کی eGFR کم ہے، کم گردے کے فنکشن کی نشاندہی کرتی ہے۔ دائمی گردے کی بیماری میں ترقی کر سکتی ہے۔" },
      'critical-low': { en: "Your eGFR is critically low, indicating kidney failure. Nephrologist referral urgent.", ur: "آپ کی eGFR انتہائی کم ہے، گردوں کی ناکامی ظاہر کرتی ہے۔ نیفرولوجسٹ ریفرل فوری ضروری۔" }
    },
    uricAcid: {
      normal: { en: "Your uric acid is normal, low risk of gout or kidney stones.", ur: "آپ کا یورک ایسڈ معمول کے مطابق ہے، گاؤٹ یا گردے کی پتھری کا کم خطرہ۔" },
      high: { en: "Your uric acid is high, increasing risk of gout and kidney stones. Reduce purine-rich foods.", ur: "آپ کا یورک ایسڈ بلند ہے، گاؤٹ اور گردے کی پتھری کا خطرہ بڑھاتا ہے۔ پیورین سے بھرپور غذا کم کریں۔" }
    },
    
    // CARDIAC MARKERS INTERPRETATIONS
    troponinI: {
      normal: { en: "Your Troponin I is normal, indicating no recent heart muscle damage.", ur: "آپ کی ٹروپونن I معمول کے مطابق ہے، حالیہ دل کے پٹھے کے نقصان کی عدم موجودگی ظاہر کرتی ہے۔" },
      high: { en: "Your Troponin I is elevated, indicating heart muscle damage. Possible heart attack.", ur: "آپ کی ٹروپونن I بلند ہے، دل کے پٹھے کے نقصان کی نشاندہی کرتی ہے۔ ممکنہ دل کا دورہ۔" },
      'critical-high': { en: "Your Troponin I is critically elevated. Active myocardial infarction. Emergency care NOW.", ur: "آپ کی ٹروپونن I انتہائی بلند ہے۔ فعال دل کا دورہ۔ فوری ایمرجنسی کیئر۔" }
    },
    troponinT: {
      normal: { en: "Your Troponin T is normal, no evidence of cardiac injury.", ur: "آپ کی ٹروپونن T معمول کے مطابق ہے، دل کی چوٹ کا کوئی ثبوت نہیں۔" },
      high: { en: "Your Troponin T is elevated, suggests heart muscle damage or recent heart attack.", ur: "آپ کی ٹروپونن T بلند ہے، دل کے پٹھے کے نقصان یا حالیہ دل کے دورے کی تجویز کرتی ہے۔" }
    },
    ntProBnp: {
      normal: { en: "Your NT-proBNP is normal, low risk of heart failure.", ur: "آپ کی NT-proBNP معمول کے مطابق ہے، دل کی ناکامی کا کم خطرہ۔" },
      high: { en: "Your NT-proBNP is elevated, indicating possible heart failure or heart strain.", ur: "آپ کی NT-proBNP بلند ہے، ممکنہ دل کی ناکامی یا دل پر دباؤ ظاہر کرتی ہے۔" }
    },
    
    // INFLAMMATORY MARKERS INTERPRETATIONS
    crp: {
      normal: { en: "Your CRP level is normal, indicating low inflammation in your body.", ur: "آپ کی CRP کی سطح معمول کے مطابق ہے، آپ کے جسم میں کم سوزش ظاہر کرتی ہے۔" },
      high: { en: "Your CRP is elevated, indicating inflammation. May be due to infection or chronic disease.", ur: "آپ کی CRP بلند ہے، سوزش ظاہر کرتی ہے۔ انفیکشن یا دائمی بیماری کی وجہ سے ہو سکتی ہے۔" },
      'critical-high': { en: "Your CRP is critically high, indicating severe infection or acute inflammation. Urgent evaluation needed.", ur: "آپ کی CRP انتہائی بلند ہے، شدید انفیکشن یا شدید سوزش ظاہر کرتی ہے۔ فوری جانچ ضروری۔" }
    },
    esr: {
      normal: { en: "Your ESR is normal, no significant inflammation detected.", ur: "آپ کی ESR معمول کے مطابق ہے، کوئی اہم سوزش نہیں ملی۔" },
      high: { en: "Your ESR is elevated, may indicate infection, autoimmune disease, or cancer.", ur: "آپ کی ESR بلند ہے، انفیکشن، خود کار قوت مدافعت کی بیماری، یا کینسر ظاہر کر سکتی ہے۔" }
    },
    ferritin: {
      normal: { en: "Your ferritin is normal, showing adequate iron stores.", ur: "آپ کی فیریٹن معمول کے مطابق ہے، مناسب آئرن ذخائر ظاہر کرتی ہے۔" },
      low: { en: "Your ferritin is low, indicating iron deficiency. May cause anemia and fatigue.", ur: "آپ کی فیریٹن کم ہے، آئرن کی کمی ظاہر کرتی ہے۔ خون کی کمی اور تھکاوٹ ہو سکتی ہے۔" },
      high: { en: "Your ferritin is high, may indicate inflammation, liver disease, or iron overload.", ur: "آپ کی فیریٹن بلند ہے، سوزش، جگر کی بیماری، یا آئرن کی زیادتی ظاہر کر سکتی ہے۔" }
    },
    
    // ELECTROLYTES INTERPRETATIONS
    sodium: {
      normal: { en: "Your sodium level is normal, maintaining proper fluid balance.", ur: "آپ کی سوڈیم کی سطح معمول کے مطابق ہے، مناسب سیال توازن برقرار رکھتی ہے۔" },
      low: { en: "Your sodium is low (hyponatremia), may cause confusion and seizures. Often due to excessive water intake or kidney problems.", ur: "آپ کی سوڈیم کم ہے (ہائپونیٹریمیا)، الجھن اور دورے پڑ سکتے ہیں۔ اکثر زیادہ پانی یا گردے کے مسائل کی وجہ سے۔" },
      high: { en: "Your sodium is high (hypernatremia), usually due to dehydration. Increase water intake.", ur: "آپ کی سوڈیم بلند ہے (ہائپرنیٹریمیا)، عام طور پر پانی کی کمی کی وجہ سے۔ پانی کی مقدار بڑھائیں۔" },
      'critical-low': { en: "Your sodium is critically low. Risk of brain swelling. Emergency treatment required.", ur: "آپ کی سوڈیم انتہائی کم ہے۔ دماغ میں سوجن کا خطرہ۔ ایمرجنسی علاج ضروری۔" },
      'critical-high': { en: "Your sodium is critically high. Severe dehydration. Immediate IV fluids needed.", ur: "آپ کی سوڈیم انتہائی بلند ہے۔ شدید پانی کی کمی۔ فوری IV سیال ضروری۔" }
    },
    potassium: {
      normal: { en: "Your potassium level is normal, supporting proper heart and muscle function.", ur: "آپ کی پوٹاشیم کی سطح معمول کے مطابق ہے، مناسب دل اور پٹھوں کے فنکشن کی مدد کرتی ہے۔" },
      low: { en: "Your potassium is low (hypokalemia), may cause muscle weakness and irregular heartbeat.", ur: "آپ کی پوٹاشیم کم ہے (ہائپوکالیمیا)، پٹھوں کی کمزوری اور بے قاعدہ دل کی دھڑکن ہو سکتی ہے۔" },
      high: { en: "Your potassium is high (hyperkalemia), dangerous for heart rhythm. Avoid potassium-rich foods.", ur: "آپ کی پوٹاشیم بلند ہے (ہائپرکالیمیا)، دل کی تال کے لیے خطرناک۔ پوٹاشیم سے بھرپور غذا سے بچیں۔" },
      'critical-low': { en: "Your potassium is critically low. Risk of cardiac arrest. Urgent potassium replacement needed.", ur: "آپ کی پوٹاشیم انتہائی کم ہے۔ دل کے رک جانے کا خطرہ۔ فوری پوٹاشیم کی تبدیلی ضروری۔" },
      'critical-high': { en: "Your potassium is critically high. Immediate risk of fatal arrhythmia. Emergency dialysis may be needed.", ur: "آپ کی پوٹاشیم انتہائی بلند ہے۔ مہلک عدم تال کا فوری خطرہ۔ ایمرجنسی ڈائلیسس کی ضرورت ہو سکتی ہے۔" }
    },
    calcium: {
      normal: { en: "Your calcium level is normal, supporting bone health and nerve function.", ur: "آپ کی کیلشیم کی سطح معمول کے مطابق ہے، ہڈیوں کی صحت اور اعصاب کے فنکشن کی مدد کرتی ہے۔" },
      low: { en: "Your calcium is low (hypocalcemia), may cause muscle cramps and tingling.", ur: "آپ کی کیلشیم کم ہے (ہائپوکیلسیمیا)، پٹھوں میں کھنچاؤ اور جھنجھناہٹ ہو سکتی ہے۔" },
      high: { en: "Your calcium is high (hypercalcemia), may indicate parathyroid issues or excess vitamin D.", ur: "آپ کی کیلشیم بلند ہے (ہائپرکیلسیمیا)، پیراتھائرائیڈ مسائل یا زیادہ وٹامن ڈی ظاہر کر سکتی ہے۔" }
    },
    
    // VITAMINS INTERPRETATIONS
    vitaminB12: {
      normal: { en: "Your vitamin B12 is normal, supporting healthy nerve and red blood cell function.", ur: "آپ کا وٹامن B12 معمول کے مطابق ہے، صحت مند اعصاب اور سرخ خون کے خلیات کے فنکشن کی مدد کرتا ہے۔" },
      low: { en: "Your vitamin B12 is low, may cause anemia, fatigue, and nerve damage. B12 supplementation recommended.", ur: "آپ کا وٹامن B12 کم ہے، خون کی کمی، تھکاوٹ، اور اعصاب کا نقصان ہو سکتا ہے۔ B12 سپلیمنٹ کی سفارش۔" }
    },
    vitaminD: {
      normal: { en: "Your vitamin D is at optimal levels, supporting bone health and immune function.", ur: "آپ کا وٹامن D بہترین سطح پر ہے، ہڈیوں کی صحت اور مدافعتی فنکشن کی مدد کرتا ہے۔" },
      low: { en: "Your vitamin D is deficient, may cause bone weakness and increased infection risk. Sun exposure and supplements help.", ur: "آپ کے وٹامن D میں کمی ہے، ہڈیوں کی کمزوری اور انفیکشن کا خطرہ بڑھ سکتا ہے۔ دھوپ اور سپلیمنٹس مدد کرتے ہیں۔" }
    },
    iron: {
      normal: { en: "Your serum iron is normal, adequate for red blood cell production.", ur: "آپ کا سیرم آئرن معمول کے مطابق ہے، سرخ خون کے خلیات کی پیداوار کے لیے کافی۔" },
      low: { en: "Your serum iron is low, may lead to iron deficiency anemia. Increase iron-rich foods.", ur: "آپ کا سیرم آئرن کم ہے، آئرن کی کمی سے خون کی کمی ہو سکتی ہے۔ آئرن سے بھرپور غذا بڑھائیں۔" },
      high: { en: "Your serum iron is high, may indicate iron overload or hemochromatosis.", ur: "آپ کا سیرم آئرن بلند ہے، آئرن کی زیادتی یا ہیموکرومیٹوسس ظاہر کر سکتا ہے۔" }
    },
    
    // HORMONAL INTERPRETATIONS
    testosterone: {
      normal: { en: "Your testosterone level is normal for your age and gender.", ur: "آپ کی ٹیسٹوسٹرون کی سطح آپ کی عمر اور جنس کے لیے معمول کے مطابق ہے۔" },
      low: { en: "Your testosterone is low, may cause fatigue, low libido, and muscle loss.", ur: "آپ کی ٹیسٹوسٹرون کم ہے، تھکاوٹ، کم جنسی خواہش، اور پٹھوں کا نقصان ہو سکتا ہے۔" },
      high: { en: "Your testosterone is elevated, may indicate PCOS in women or steroid use.", ur: "آپ کی ٹیسٹوسٹرون بلند ہے، خواتین میں PCOS یا سٹیرائیڈ استعمال ظاہر کر سکتی ہے۔" }
    },
    cortisol: {
      normal: { en: "Your morning cortisol is normal, showing healthy stress hormone regulation.", ur: "آپ کی صبح کی کورٹیسول معمول کے مطابق ہے، صحت مند تناؤ ہارمون کی تنظیم ظاہر کرتی ہے۔" },
      high: { en: "Your cortisol is elevated, may indicate Cushing's syndrome or chronic stress.", ur: "آپ کی کورٹیسول بلند ہے، کشنگ سنڈروم یا دائمی تناؤ ظاہر کر سکتی ہے۔" },
      low: { en: "Your cortisol is low, may indicate Addison's disease or adrenal insufficiency.", ur: "آپ کی کورٹیسول کم ہے، ایڈیسن کی بیماری یا ایڈرینل کی کمی ظاہر کر سکتی ہے۔" }
    },
    
    // TUMOR MARKERS INTERPRETATIONS
    psa: {
      normal: { en: "Your PSA level is normal, low risk of prostate problems.", ur: "آپ کی PSA کی سطح معمول کے مطابق ہے، پروسٹیٹ مسائل کا کم خطرہ۔" },
      high: { en: "Your PSA is elevated, may indicate prostate enlargement, infection, or cancer. Further testing needed.", ur: "آپ کی PSA بلند ہے، پروسٹیٹ میں بڑھوتری، انفیکشن، یا کینسر ظاہر کر سکتی ہے۔ مزید جانچ ضروری۔" }
    },
    cea: {
      normal: { en: "Your CEA is normal, low risk of colorectal cancer.", ur: "آپ کی CEA معمول کے مطابق ہے، بڑی آنت کے کینسر کا کم خطرہ۔" },
      high: { en: "Your CEA is elevated, may indicate colorectal, lung, or pancreatic cancer. Further investigation required.", ur: "آپ کی CEA بلند ہے، بڑی آنت، پھیپھڑے، یا لبلبے کے کینسر ظاہر کر سکتی ہے۔ مزید تحقیق ضروری۔" }
    },
    
    // COAGULATION INTERPRETATIONS
    pt: {
      normal: { en: "Your PT is normal, blood clotting function is adequate.", ur: "آپ کی PT معمول کے مطابق ہے، خون کے جمنے کا فنکشن کافی ہے۔" },
      high: { en: "Your PT is prolonged, may indicate bleeding risk or warfarin effect. Monitor closely.", ur: "آپ کی PT طویل ہے، خون بہنے کا خطرہ یا وارفرین کا اثر ظاہر کر سکتی ہے۔ قریب سے نگرانی کریں۔" }
    },
    inr: {
      normal: { en: "Your INR is in therapeutic range, appropriate anticoagulation.", ur: "آپ کی INR علاجی حد میں ہے، مناسب اینٹی کوایگولیشن۔" },
      high: { en: "Your INR is high, increased bleeding risk. Warfarin dose may need adjustment.", ur: "آپ کی INR بلند ہے، خون بہنے کا خطرہ بڑھا ہوا۔ وارفرین کی خوراک میں ایڈجسٹمنٹ کی ضرورت ہو سکتی ہے۔" },
      'critical-high': { en: "Your INR is critically high. Severe bleeding risk. Hold warfarin and seek immediate care.", ur: "آپ کی INR انتہائی بلند ہے۔ شدید خون بہنے کا خطرہ۔ وارفرین روکیں اور فوری کیئر لیں۔" }
    },
    dDimer: {
      normal: { en: "Your D-Dimer is normal, low probability of blood clots.", ur: "آپ کی D-Dimer معمول کے مطابق ہے، خون کے لوتھڑے کا کم امکان۔" },
      high: { en: "Your D-Dimer is elevated, may indicate blood clot, PE, or DVT. Imaging studies recommended.", ur: "آپ کی D-Dimer بلند ہے، خون کا لوتھڑا، PE، یا DVT ظاہر کر سکتی ہے۔ امیجنگ مطالعہ کی سفارش۔" }
    }
  };

  const paramInterpretation = interpretations[parameterId];
  if (!paramInterpretation || !paramInterpretation[status]) {
    return {
      en: "Consult with your healthcare provider for interpretation of this result.",
      ur: "اس نتیجے کی تشریح کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔"
    };
  }

  return paramInterpretation[status];
};

// Generate comprehensive recommendations for all parameters
const generateRecommendations = (
  parameterId: string, 
  status: string, 
  testType: 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation'
): { en: string[]; ur: string[] } => {
  
  const recommendations: Record<string, Record<string, { en: string[]; ur: string[] }>> = {
    // LIPID PROFILE RECOMMENDATIONS
    totalCholesterol: {
      high: {
        en: ["Adopt Mediterranean diet rich in olive oil and fish", "Exercise 30 minutes daily", "Limit trans fats and processed foods", "Consider plant sterols supplementation"],
        ur: ["زیتون کے تیل اور مچھلی سے بھرپور میڈیٹیرینین غذا اپنائیں", "روزانہ 30 منٹ ورزش کریں", "ٹرانس فیٹس اور پروسیسڈ فوڈ محدود کریں", "پلانٹ سٹیرولز سپلیمنٹ پر غور کریں"]
      }
    },
    ldlCholesterol: {
      high: {
        en: ["Follow heart-healthy DASH diet", "Increase soluble fiber intake (oats, beans)", "Exercise 150+ minutes per week", "Discuss statin therapy with your doctor", "Quit smoking if applicable"],
        ur: ["دل کے لیے صحت مند DASH غذا اپنائیں", "حل پذیر فائبر بڑھائیں (جئی، پھلیاں)", "ہفتے میں 150+ منٹ ورزش کریں", "ڈاکٹر سے سٹیٹن تھراپی پر بات کریں", "تمباکو نوشی چھوڑ دیں"]
      }
    },
    hdlCholesterol: {
      low: {
        en: ["Increase aerobic exercise", "Add healthy fats (nuts, avocados, fatty fish)", "Quit smoking to raise HDL", "Moderate alcohol may help (consult doctor)", "Lose excess weight"],
        ur: ["ایروبک ورزش بڑھائیں", "صحت مند چکنائی شامل کریں (گری دار میوے، ایوکاڈو، چکنائی والی مچھلی)", "HDL بڑھانے کے لیے تمباکو نوشی چھوڑیں", "معتدل الکحل مدد کر سکتی ہے (ڈاکٹر سے مشورہ)", "اضافی وزن کم کریں"]
      }
    },
    triglycerides: {
      high: {
        en: ["Reduce sugar and refined carbohydrates", "Limit alcohol consumption", "Increase omega-3 fatty acids (fish oil)", "Control diabetes if present", "Achieve healthy weight"],
        ur: ["شکر اور بہتر شدہ کاربوہائیڈریٹس کم کریں", "الکحل کی کھپت محدود کریں", "اومیگا 3 فیٹی ایسڈز بڑھائیں (مچھلی کا تیل)", "ذیابیطس کو کنٹرول کریں اگر موجود ہے", "صحت مند وزن حاصل کریں"]
      }
    },
    
    // GLUCOSE RECOMMENDATIONS
    fastingGlucose: {
      high: {
        en: ["Adopt low glycemic index diet", "Exercise regularly to improve insulin sensitivity", "Monitor blood sugar levels at home", "Lose 5-10% body weight if overweight", "Limit refined carbohydrates"],
        ur: ["کم گلائسیمک انڈیکس والی غذا اپنائیں", "انسولین حساسیت بہتر بنانے کے لیے باقاعدگی سے ورزش کریں", "گھر میں خون میں شکر کی نگرانی کریں", "زیادہ وزن ہے تو 5-10% وزن کم کریں", "بہتر شدہ کاربوہائیڈریٹس محدود کریں"]
      },
      low: {
        en: ["Eat small frequent meals", "Always carry fast-acting sugar", "Check medications causing low blood sugar", "Monitor glucose levels regularly", "Discuss with doctor if recurrent"],
        ur: ["چھوٹے بار بار کھانا کھائیں", "ہمیشہ تیز اثر والی شکر ساتھ رکھیں", "کم بلڈ شوگر کرنے والی ادویات چیک کریں", "گلوکوز کی سطح کی باقاعدگی سے نگرانی کریں", "بار بار ہونے پر ڈاکٹر سے بات کریں"]
      }
    },
    hba1c: {
      high: {
        en: ["Intensive diabetes management with your doctor", "Daily blood sugar monitoring", "Structured meal planning with dietitian", "Regular physical activity 5 days/week", "Medication adherence crucial"],
        ur: ["ڈاکٹر کے ساتھ گہری ڈایبیٹیز کا انتظام", "روزانہ خون میں شکر کی نگرانی", "ڈائٹیشن کے ساتھ منظم کھانے کی منصوبہ بندی", "ہفتے میں 5 دن باقاعدہ جسمانی سرگرمی", "دوا کی پابندی بہت اہم"]
      }
    },
    
    // THYROID RECOMMENDATIONS
    tsh: {
      high: {
        en: ["Take thyroid hormone replacement as prescribed", "Take medication on empty stomach", "Avoid soy and high-fiber near medication time", "Regular thyroid function monitoring", "Selenium supplementation may help"],
        ur: ["تجویز کردہ تھائرائیڈ ہارمون کی تبدیلی لیں", "خالی پیٹ دوا لیں", "دوا کے وقت کے قریب سویا اور زیادہ فائبر سے بچیں", "باقاعدہ تھائرائیڈ فنکشن کی نگرانی", "سیلینیم سپلیمنٹ مدد کر سکتا ہے"]
      },
      low: {
        en: ["Consult endocrinologist urgently", "May need anti-thyroid medications", "Avoid excess iodine intake", "Stress management important", "Regular monitoring essential"],
        ur: ["فوری طور پر اینڈوکرائنولوجسٹ سے مشورہ کریں", "اینٹی تھائرائیڈ ادویات کی ضرورت ہو سکتی ہے", "زیادہ آیوڈین سے بچیں", "تناؤ کا انتظام اہم", "باقاعدہ نگرانی ضروری"]
      }
    },
    
    // LIVER RECOMMENDATIONS
    alt: {
      high: {
        en: ["Eliminate alcohol completely", "Avoid hepatotoxic drugs (acetaminophen, certain antibiotics)", "Maintain healthy weight through diet and exercise", "Get Hepatitis A & B vaccinations", "Consider liver ultrasound", "Eat liver-friendly foods (leafy greens, berries)"],
        ur: ["الکحل مکمل طور پر ختم کریں", "جگر کے لیے نقصان دہ ادویات سے بچیں (ایسیٹامنوفین، کچھ اینٹی بائیوٹکس)", "غذا اور ورزش کے ذریعے صحت مند وزن برقرار رکھیں", "ہیپاٹائٹس A اور B کی ویکسینیشن کروائیں", "جگر کا الٹراساؤنڈ کروائیں", "جگر کے لیے دوستانہ غذا کھائیں (پتوں والی سبزیاں، بیری)"]
      }
    },
    ast: {
      high: {
        en: ["Avoid alcohol and NSAIDs", "Rule out heart and muscle causes", "Vitamin E may help in fatty liver", "Weight loss if BMI >25", "Monitor liver enzymes regularly"],
        ur: ["الکحل اور NSAIDs سے بچیں", "دل اور پٹھوں کی وجوہات رد کریں", "چکنائی والے جگر میں وٹامن E مدد کر سکتا ہے", "BMI >25 ہے تو وزن کم کریں", "جگر کے انزائمز کی باقاعدگی سے نگرانی کریں"]
      }
    },
    totalBilirubin: {
      high: {
        en: ["Identify and treat underlying cause", "Stay hydrated", "Phototherapy if severe (in infants)", "Avoid alcohol and liver-toxic medications", "Urgent medical evaluation if jaundice present"],
        ur: ["بنیادی وجہ کی شناخت اور علاج کریں", "ہائیڈریٹ رہیں", "شدید ہونے پر فوٹو تھراپی (بچوں میں)", "الکحل اور جگر کے لیے زہریلی ادویات سے بچیں", "یرقان موجود ہونے پر فوری طبی جانچ"]
      }
    },
    
    // KIDNEY RECOMMENDATIONS
    creatinine: {
      high: {
        en: ["Increase water intake to 2-3 liters daily", "Control blood pressure strictly (<130/80)", "Manage diabetes (HbA1c <7%)", "Avoid NSAIDs, contrast dyes", "Low-protein diet (consult dietitian)", "Regular nephrology follow-up"],
        ur: ["روزانہ 2-3 لیٹر پانی کی مقدار بڑھائیں", "بلڈ پریشر سختی سے کنٹرول کریں (<130/80)", "ڈایبیٹیز کا انتظام کریں (HbA1c <7%)", "NSAIDs، کنٹراسٹ ڈائی سے بچیں", "کم پروٹین کی غذا (ڈائٹیشن سے مشورہ)", "باقاعدہ نیفرولوجی فالو اپ"]
      }
    },
    bun: {
      high: {
        en: ["Drink more water", "Reduce protein intake temporarily", "Check for dehydration causes", "Review medications with doctor", "Monitor kidney function"],
        ur: ["زیادہ پانی پیئیں", "عارضی طور پر پروٹین کم کریں", "پانی کی کمی کی وجوہات چیک کریں", "ڈاکٹر کے ساتھ ادویات کا جائزہ لیں", "گردے کے فنکشن کی نگرانی کریں"]
      }
    },
    egfr: {
      low: {
        en: ["Stage-appropriate CKD management", "Blood pressure control critical", "Limit dietary phosphorus and potassium", "Regular lab monitoring", "Prepare for dialysis if eGFR <20", "Consider kidney transplant evaluation"],
        ur: ["مرحلے کے مطابق CKD کا انتظام", "بلڈ پریشر کا کنٹرول اہم", "غذائی فاسفورس اور پوٹاشیم محدود کریں", "باقاعدہ لیب نگرانی", "eGFR <20 ہے تو ڈائلیسس کی تیاری", "گردے کی پیوند کاری کی جانچ پر غور کریں"]
      }
    },
    
    // CARDIAC RECOMMENDATIONS
    troponinI: {
      high: {
        en: ["Seek emergency care IMMEDIATELY", "Aspirin 300mg if not allergic", "Complete bed rest", "Cardiac catheterization likely needed", "Intensive cardiac monitoring"],
        ur: ["فوری طور پر ایمرجنسی کیئر لیں", "الرجی نہیں ہے تو اسپرین 300mg", "مکمل بستر پر آرام", "کارڈیک کیتھیٹرائزیشن کی ضرورت ہو سکتی ہے", "گہری کارڈیک نگرانی"]
      }
    },
    ntProBnp: {
      high: {
        en: ["Reduce sodium intake (<2g/day)", "Daily weight monitoring", "Diuretics as prescribed", "Limit fluid intake", "ACE inhibitors/ARBs beneficial", "Regular cardiology follow-up"],
        ur: ["سوڈیم کی مقدار کم کریں (<2g/دن)", "روزانہ وزن کی نگرانی", "تجویز کردہ ڈائیورٹکس", "سیال کی مقدار محدود کریں", "ACE inhibitors/ARBs فائدہ مند", "باقاعدہ کارڈیولوجی فالو اپ"]
      }
    },
    
    // INFLAMMATORY RECOMMENDATIONS
    crp: {
      high: {
        en: ["Identify and treat infection source", "Anti-inflammatory diet (turmeric, ginger)", "Regular exercise reduces inflammation", "Adequate sleep (7-9 hours)", "Stress reduction techniques", "Omega-3 supplementation"],
        ur: ["انفیکشن کا ذریعہ شناخت اور علاج کریں", "سوزش کم کرنے والی غذا (ہلدی، ادرک)", "باقاعدہ ورزش سوزش کم کرتی ہے", "مناسب نیند (7-9 گھنٹے)", "تناؤ کم کرنے کی تکنیک", "اومیگا 3 سپلیمنٹ"]
      }
    },
    ferritin: {
      low: {
        en: ["Iron-rich foods (red meat, spinach, lentils)", "Vitamin C enhances iron absorption", "Avoid tea/coffee with meals", "Oral iron supplements", "Check for bleeding sources", "Consider IV iron if oral not tolerated"],
        ur: ["آئرن سے بھرپور غذا (سرخ گوشت، پالک، دال)", "وٹامن C آئرن کی جذب کو بڑھاتا ہے", "کھانے کے ساتھ چائے/کافی سے بچیں", "زبانی آئرن سپلیمنٹس", "خون بہنے کے ذرائع چیک کریں", "زبانی برداشت نہیں ہے تو IV آئرن پر غور کریں"]
      }
    },
    
    // ELECTROLYTES RECOMMENDATIONS
    sodium: {
      low: {
        en: ["May need sodium replacement", "Restrict water intake if SIADH", "Treat underlying cause", "Avoid diuretics temporarily", "Frequent monitoring essential"],
        ur: ["سوڈیم کی تبدیلی کی ضرورت ہو سکتی ہے", "SIADH ہے تو پانی کی مقدار محدود کریں", "بنیادی وجہ کا علاج کریں", "عارضی طور پر ڈائیورٹکس سے بچیں", "بار بار نگرانی ضروری"]
      },
      high: {
        en: ["Increase water intake", "Reduce salt in diet", "Check for diabetes insipidus", "Monitor mental status", "Correct slowly to avoid complications"],
        ur: ["پانی کی مقدار بڑھائیں", "غذا میں نمک کم کریں", "ڈائبیٹس انسیپڈس چیک کریں", "ذہنی حالت کی نگرانی کریں", "پیچیدگیوں سے بچنے کے لیے آہستہ درست کریں"]
      }
    },
    potassium: {
      low: {
        en: ["Potassium-rich foods (bananas, oranges, potatoes)", "Potassium supplements as prescribed", "Check diuretic medications", "Monitor heart rhythm", "Address underlying causes"],
        ur: ["پوٹاشیم سے بھرپور غذا (کیلے، سنگترے، آلو)", "تجویز کردہ پوٹاشیم سپلیمنٹس", "ڈائیورٹک ادویات چیک کریں", "دل کی تال کی نگرانی کریں", "بنیادی وجوہات کا حل کریں"]
      },
      high: {
        en: ["AVOID potassium-rich foods", "Low-potassium diet essential", "Check kidney function", "Review medications (ACE inhibitors, spironolactone)", "Emergency dialysis if severe", "ECG monitoring important"],
        ur: ["پوٹاشیم سے بھرپور غذا سے بچیں", "کم پوٹاشیم کی غذا ضروری", "گردے کا فنکشن چیک کریں", "ادویات کا جائزہ لیں (ACE inhibitors, spironolactone)", "شدید ہونے پر ایمرجنسی ڈائلیسس", "ECG نگرانی اہم"]
      }
    },
    
    // VITAMINS RECOMMENDATIONS
    vitaminB12: {
      low: {
        en: ["B12-rich foods (meat, fish, eggs, dairy)", "Oral B12 supplements (1000mcg daily)", "B12 injections if malabsorption", "Check for pernicious anemia", "Recheck levels in 3 months"],
        ur: ["B12 سے بھرپور غذا (گوشت، مچھلی، انڈے، دودھ)", "زبانی B12 سپلیمنٹس (1000mcg روزانہ)", "خراب جذب ہے تو B12 انجیکشن", "خطرناک خون کی کمی چیک کریں", "3 ماہ میں سطح دوبارہ چیک کریں"]
      }
    },
    vitaminD: {
      low: {
        en: ["Sun exposure 15-20 minutes daily", "Vitamin D supplementation (1000-2000 IU daily)", "Fortified foods (milk, cereals)", "Fatty fish (salmon, mackerel)", "Recheck in 3-6 months"],
        ur: ["روزانہ 15-20 منٹ دھوپ", "وٹامن D سپلیمنٹ (1000-2000 IU روزانہ)", "فورٹیفائیڈ فوڈز (دودھ، اناج)", "چکنائی والی مچھلی (سالمن، میکریل)", "3-6 ماہ میں دوبارہ چیک کریں"]
      }
    },
    
    // HORMONAL RECOMMENDATIONS
    testosterone: {
      low: {
        en: ["Resistance training exercise", "Adequate sleep (7-9 hours)", "Stress management", "Zinc and vitamin D supplementation", "Consider testosterone replacement therapy", "Weight loss if obese"],
        ur: ["مزاحمتی تربیتی ورزش", "مناسب نیند (7-9 گھنٹے)", "تناؤ کا انتظام", "زنک اور وٹامن D سپلیمنٹ", "ٹیسٹوسٹرون تبدیلی تھراپی پر غور کریں", "موٹے ہیں تو وزن کم کریں"]
      }
    },
    
    // TUMOR MARKERS RECOMMENDATIONS
    psa: {
      high: {
        en: ["Prostate biopsy may be needed", "Digital rectal exam", "Repeat PSA in 6 weeks", "Avoid ejaculation 48hrs before test", "Rule out prostatitis first", "Discuss with urologist"],
        ur: ["پروسٹیٹ بایوپسی کی ضرورت ہو سکتی ہے", "ڈیجیٹل ریکٹل ایگزام", "6 ہفتوں میں PSA دہرائیں", "ٹیسٹ سے 48 گھنٹے پہلے انزال سے بچیں", "پہلے پروسٹیٹائٹس رد کریں", "یورولوجسٹ سے بات کریں"]
      }
    },
    cea: {
      high: {
        en: ["Colonoscopy recommended", "CT scan of chest/abdomen", "Stop smoking (elevates CEA)", "Rule out benign causes first", "Oncology referral if persistently high", "Monitor trend over time"],
        ur: ["کولونوسکوپی کی سفارش", "سینے/پیٹ کا CT سکین", "تمباکو نوشی بند کریں (CEA بڑھاتی ہے)", "پہلے بے ضرر وجوہات رد کریں", "مسلسل بلند ہے تو آنکولوجی ریفرل", "وقت کے ساتھ رجحان کی نگرانی کریں"]
      }
    },
    
    // COAGULATION RECOMMENDATIONS
    inr: {
      high: {
        en: ["Reduce warfarin dose (consult doctor)", "Avoid aspirin and NSAIDs", "Limit vitamin K foods if extremely high", "Check for bleeding signs", "More frequent INR monitoring", "Avoid falls and injuries"],
        ur: ["وارفرین کی خوراک کم کریں (ڈاکٹر سے مشورہ)", "اسپرین اور NSAIDs سے بچیں", "انتہائی بلند ہے تو وٹامن K کی غذا محدود کریں", "خون بہنے کی علامات چیک کریں", "زیادہ بار INR نگرانی", "گرنے اور چوٹوں سے بچیں"]
      }
    },
    dDimer: {
      high: {
        en: ["Urgent imaging (CT angiography/Doppler)", "Avoid prolonged immobility", "Compression stockings", "Consider anticoagulation", "Rule out DVT/PE", "Follow up with hematologist"],
        ur: ["فوری امیجنگ (CT انجیوگرافی/ڈوپلر)", "طویل بے حرکتی سے بچیں", "کمپریشن موزے", "اینٹی کوایگولیشن پر غور کریں", "DVT/PE رد کریں", "ہیماٹولوجسٹ کے ساتھ فالو اپ"]
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

// Main analyzer function - updated to handle all test types
export const analyzeBloodTest = (data: BloodTestFormData): BloodTestAnalysis => {
  const results: BloodTestResult[] = data.parameters
    .filter(param => param.value !== '')
    .map(param => {
      const value = parseFloat(param.value);
      const referenceRange = getBloodTestReferenceRange(
        data.testType as any,
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

// Generate test-specific summary for all test types
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
      thyroid: { en: "thyroid function tests", ur: "تھائرائیڈ فنکشن ٹیسٹس" },
      liver: { en: "liver function tests", ur: "جگر کے فنکشن ٹیسٹس" },
      kidney: { en: "kidney function tests", ur: "گردے کے فنکشن ٹیسٹس" },
      cardiac: { en: "cardiac markers", ur: "دل کے مارکرز" },
      inflammatory: { en: "inflammatory markers", ur: "سوزش کے مارکرز" },
      electrolytes: { en: "electrolyte panel", ur: "الیکٹرولائٹ پینل" },
      vitamins: { en: "vitamin tests", ur: "وٹامن ٹیسٹس" },
      hormonal: { en: "hormone tests", ur: "ہارمون ٹیسٹس" },
      tumor: { en: "tumor markers", ur: "ٹیومر مارکرز" },
      autoimmune: { en: "autoimmune markers", ur: "خود کار قوت مدافعت کے مارکرز" },
      coagulation: { en: "coagulation studies", ur: "خون کے جمنے کے مطالعات" }
    };
    
    const testName = testNames[testType as keyof typeof testNames];
    return {
      en: `Excellent! All your ${testName?.en || 'test'} results are within normal ranges, indicating good health in this area.`,
      ur: `بہترین! آپ کے تمام ${testName?.ur || 'ٹیسٹ'} کے نتائج معمول کی حدود میں ہیں، جو اس علاقے میں اچھی صحت کی نشاندہی کرتے ہیں۔`
    };
  }
  
  return {
    en: `Your test results show ${abnormalResults.length} parameters outside normal ranges. Review the detailed analysis below and consult your healthcare provider for guidance.`,
    ur: `آپ کے ٹیسٹ کے نتائج ${abnormalResults.length} پیرامیٹرز کو معمول کی حدود سے باہر دکھاتے ہیں۔ نیچے تفصیلی تجزیہ دیکھیں اور رہنمائی کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔`
  };
};

// Identify related medical conditions for all test types
const identifyRelatedConditions = (results: BloodTestResult[], testType: string): { en: string[]; ur: string[] } => {
  const conditions = { en: [] as string[], ur: [] as string[] };
  
  // Add condition identification for all test types
  switch (testType) {
    case 'lipid':
      const highLDL = results.find(r => r.parameter.id === 'ldlCholesterol' && r.status === 'high');
      const lowHDL = results.find(r => r.parameter.id === 'hdlCholesterol' && r.status === 'low');
      const highTrig = results.find(r => r.parameter.id === 'triglycerides' && r.status === 'high');
      
      if (highLDL || lowHDL || highTrig) {
        conditions.en.push("Increased cardiovascular disease risk", "Potential metabolic syndrome");
        conditions.ur.push("دل کی بیماری کا بڑھا ہوا خطرہ", "ممکنہ میٹابولک سنڈروم");
      }
      break;
      
    case 'liver':
      const highALT = results.find(r => r.parameter.id === 'alt' && r.status === 'high');
      const highAST = results.find(r => r.parameter.id === 'ast' && r.status === 'high');
      
      if (highALT || highAST) {
        conditions.en.push("Possible hepatitis or liver inflammation", "Drug-induced liver injury risk");
        conditions.ur.push("ممکنہ ہیپاٹائٹس یا جگر کی سوزش", "دوا سے جگر کی چوٹ کا خطرہ");
      }
      break;
      
    case 'kidney':
      const highCreatinine = results.find(r => r.parameter.id === 'creatinine' && r.status === 'high');
      const lowEGFR = results.find(r => r.parameter.id === 'egfr' && r.status === 'low');
      
      if (highCreatinine || lowEGFR) {
        conditions.en.push("Chronic kidney disease risk", "Potential need for nephrology referral");
        conditions.ur.push("دائمی گردے کی بیماری کا خطرہ", "نیفرولوجی ریفرل کی ممکنہ ضرورت");
      }
      break;
      
    case 'cardiac':
      const highTroponin = results.find(r => (r.parameter.id === 'troponinI' || r.parameter.id === 'troponinT') 
                                            && (r.status === 'high' || r.status === 'critical-high'));
      
      if (highTroponin) {
        conditions.en.push("Acute myocardial infarction risk", "Urgent cardiology evaluation needed");
        conditions.ur.push("شدید دل کا دورہ پڑنے کا خطرہ", "فوری کارڈیولوجی جانچ ضروری");
      }
      break;
  }
  
  return conditions;
};
