
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
  }
];

export const getTestCategoryById = (id: string): TestCategory | undefined => {
  return TEST_CATEGORIES.find(category => category.id === id);
};
