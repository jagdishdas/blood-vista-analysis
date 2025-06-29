
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TEST_CATEGORIES } from '@/utils/test-categories';
import { Activity, Heart, TrendingUp, Thermometer } from 'lucide-react';

interface TestCategorySelectorProps {
  language: string;
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const TestCategorySelector = ({ language, selectedCategory, onCategorySelect }: TestCategorySelectorProps) => {
  const iconMap = {
    activity: Activity,
    heart: Heart,
    'trending-up': TrendingUp,
    thermometer: Thermometer
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {language === 'en' ? 'Select Blood Test Category' : 'خون کے ٹیسٹ کی قسم منتخب کریں'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEST_CATEGORIES.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap];
          const isSelected = selectedCategory === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? `ring-2 ring-offset-2 ${category.color.replace('bg-', 'ring-')} shadow-lg` 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {language === 'en' ? category.nameEn : category.nameUr}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {language === 'en' ? category.description.en : category.description.ur}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs">
                      {language === 'en' ? 'Selected' : 'منتخب'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TestCategorySelector;
