
import { TestCategory } from '@/types/blood-test.types';

export const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 'cbc',
    nameEn: 'Complete Blood Count (CBC)',
    nameUr: 'مکمل خون کی گنتی',
    description: {
      en: 'Measures different components of blood including red blood cells, white blood cells, and platelets',
      ur: 'خون کے مختلف اجزاء کی پیمائش جس میں سرخ خون کے خلیات، سفید خون کے خلیات، اور پلیٹ لیٹس شامل ہیں'
    },
    icon: 'activity',
    color: 'bg-red-500'
  },
  {
    id: 'lipid',
    nameEn: 'Lipid Profile',
    nameUr: 'لپڈ پروفائل',
    description: {
      en: 'Measures cholesterol and triglyceride levels to assess cardiovascular disease risk',
      ur: 'دل کی بیماری کے خطرے کا اندازہ لگانے کے لیے کولیسٹرول اور ٹرائگلیسرائیڈ کی سطح کی پیمائش'
    },
    icon: 'heart',
    color: 'bg-blue-500'
  },
  {
    id: 'glucose',
    nameEn: 'Glucose Tests',
    nameUr: 'گلوکوز ٹیسٹس',
    description: {
      en: 'Measures blood sugar levels to screen for diabetes and monitor glucose control',
      ur: 'ذیابیطس کی جانچ اور گلوکوز کنٹرول کی نگرانی کے لیے خون میں شکر کی سطح کی پیمائش'
    },
    icon: 'trending-up',
    color: 'bg-green-500'
  },
  {
    id: 'thyroid',
    nameEn: 'Thyroid Function Tests',
    nameUr: 'تھائرائیڈ فنکشن ٹیسٹس',
    description: {
      en: 'Measures thyroid hormones to assess thyroid gland function and metabolism',
      ur: 'تھائرائیڈ غدود کے کام اور میٹابولزم کا اندازہ لگانے کے لیے تھائرائیڈ ہارمونز کی پیمائش'
    },
    icon: 'thermometer',
    color: 'bg-purple-500'
  },
  {
    id: 'liver',
    nameEn: 'Liver Function Tests (LFT)',
    nameUr: 'جگر کے فنکشن ٹیسٹس',
    description: {
      en: 'Evaluates liver health by measuring enzymes, proteins, and bilirubin levels',
      ur: 'انزائمز، پروٹین اور بلیروبن کی سطح کی پیمائش کرکے جگر کی صحت کا جائزہ'
    },
    icon: 'shield',
    color: 'bg-orange-500'
  },
  {
    id: 'kidney',
    nameEn: 'Kidney Function Tests (KFT)',
    nameUr: 'گردے کے فنکشن ٹیسٹس',
    description: {
      en: 'Assesses kidney health by measuring creatinine, urea, and filtration rate',
      ur: 'کریٹینین، یوریا اور فلٹریشن ریٹ کی پیمائش کرکے گردوں کی صحت کا اندازہ'
    },
    icon: 'droplets',
    color: 'bg-teal-500'
  },
  {
    id: 'cardiac',
    nameEn: 'Cardiac Markers',
    nameUr: 'دل کے مارکرز',
    description: {
      en: 'Detects heart muscle damage and assesses cardiovascular disease risk',
      ur: 'دل کے پٹھے کی خرابی کا پتا لگانا اور قلبی امراض کے خطرے کا اندازہ'
    },
    icon: 'heart-pulse',
    color: 'bg-rose-500'
  },
  {
    id: 'inflammatory',
    nameEn: 'Inflammatory Markers',
    nameUr: 'سوزش کے مارکرز',
    description: {
      en: 'Measures inflammation levels in the body using CRP, ESR, and other markers',
      ur: 'CRP، ESR اور دیگر مارکرز کا استعمال کرتے ہوئے جسم میں سوزش کی سطح کی پیمائش'
    },
    icon: 'flame',
    color: 'bg-amber-500'
  },
  {
    id: 'electrolytes',
    nameEn: 'Electrolytes & Minerals',
    nameUr: 'الیکٹرولائٹس اور معدنیات',
    description: {
      en: 'Measures essential minerals and electrolytes for proper body function',
      ur: 'جسم کے صحیح کام کے لیے ضروری معدنیات اور الیکٹرولائٹس کی پیمائش'
    },
    icon: 'zap',
    color: 'bg-yellow-500'
  },
  {
    id: 'vitamins',
    nameEn: 'Vitamins & Deficiencies',
    nameUr: 'وٹامنز اور کمی',
    description: {
      en: 'Tests for vitamin levels and identifies nutritional deficiencies',
      ur: 'وٹامن کی سطح کی جانچ اور غذائی کمی کی شناخت'
    },
    icon: 'sun',
    color: 'bg-emerald-500'
  },
  {
    id: 'hormonal',
    nameEn: 'Hormonal Tests',
    nameUr: 'ہارمونل ٹیسٹس',
    description: {
      en: 'Comprehensive hormone panel including reproductive and stress hormones',
      ur: 'تولیدی اور تناؤ کے ہارمونز سمیت جامع ہارمون پینل'
    },
    icon: 'user',
    color: 'bg-pink-500'
  },
  {
    id: 'tumor',
    nameEn: 'Tumor Markers',
    nameUr: 'ٹیومر مارکرز',
    description: {
      en: 'Screens for cancer markers and monitors treatment response',
      ur: 'کینسر مارکرز کی جانچ اور علاج کی رسپانس کی نگرانی'
    },
    icon: 'target',
    color: 'bg-red-600'
  },
  {
    id: 'autoimmune',
    nameEn: 'Autoimmune Markers',
    nameUr: 'خود کار قوت مدافعت کے مارکرز',
    description: {
      en: 'Tests for autoimmune conditions and immune system disorders',
      ur: 'خود کار قوت مدافعت کی حالات اور مدافعتی نظام کی خرابیوں کی جانچ'
    },
    icon: 'shield-check',
    color: 'bg-indigo-500'
  },
  {
    id: 'coagulation',
    nameEn: 'Coagulation Studies',
    nameUr: 'خون کے جمنے کے مطالعات',
    description: {
      en: 'Evaluates blood clotting function and bleeding disorders',
      ur: 'خون کے جمنے کے فنکشن اور خون بہنے کی خرابیوں کا جائزہ'
    },
    icon: 'activity',
    color: 'bg-violet-500'
  }
];

export const getTestCategoryById = (id: string): TestCategory | undefined => {
  return TEST_CATEGORIES.find(category => category.id === id);
};
