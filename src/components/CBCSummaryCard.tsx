
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CBCAnalysis } from "@/types/cbc.types";
import { 
  Heart, 
  Shield, 
  Droplets, 
  Activity,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface CBCSummaryCardProps {
  analysis: CBCAnalysis;
  language: string;
}

const CBCSummaryCard = ({ analysis, language }: CBCSummaryCardProps) => {
  const abnormalResults = analysis.results.filter(r => r.status !== 'normal');
  const totalParameters = analysis.results.length;
  const normalPercentage = Math.round(((totalParameters - abnormalResults.length) / totalParameters) * 100);
  
  // Categorize issues for easy understanding
  const categories = {
    infection: abnormalResults.filter(r => 
      ['wbc', 'neutrophils', 'lymphocytes'].includes(r.parameter.id)
    ),
    anemia: abnormalResults.filter(r => 
      ['hemoglobin', 'rbc', 'hematocrit'].includes(r.parameter.id) && r.status === 'low'
    ),
    bleeding: abnormalResults.filter(r => 
      r.parameter.id === 'platelets' && r.status === 'low'
    ),
    other: abnormalResults.filter(r => 
      !['wbc', 'neutrophils', 'lymphocytes', 'hemoglobin', 'rbc', 'hematocrit', 'platelets'].includes(r.parameter.id)
    )
  };

  const getHealthStatus = () => {
    if (normalPercentage === 100) {
      return {
        status: 'excellent',
        icon: <CheckCircle className="h-8 w-8 text-green-500" />,
        color: 'green',
        textEn: 'Excellent Health',
        textUr: 'بہترین صحت'
      };
    } else if (normalPercentage >= 80) {
      return {
        status: 'good',
        icon: <Heart className="h-8 w-8 text-blue-500" />,
        color: 'blue',
        textEn: 'Good Health',
        textUr: 'اچھی صحت'
      };
    } else if (normalPercentage >= 60) {
      return {
        status: 'fair',
        icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
        color: 'amber',
        textEn: 'Fair Health',
        textUr: 'متوسط صحت'
      };
    } else {
      return {
        status: 'needs-attention',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        color: 'red',
        textEn: 'Needs Medical Attention',
        textUr: 'طبی توجہ درکار'
      };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-4">
      {/* Overall Health Status */}
      <Card className={`border-2 border-${healthStatus.color}-200 bg-${healthStatus.color}-50`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            {healthStatus.icon}
          </div>
          <CardTitle className="text-xl">
            {language === 'en' ? healthStatus.textEn : healthStatus.textUr}
          </CardTitle>
          <div className="space-y-2">
            <Progress value={normalPercentage} className="h-3" />
            <p className="text-sm text-gray-600">
              {language === 'en' 
                ? `${normalPercentage}% of your blood parameters are normal`
                : `آپ کے خون کے ${normalPercentage}% پیرامیٹرز معمول کے مطابق ہیں`
              }
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Key Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Infection Status */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className={`h-5 w-5 ${categories.infection.length > 0 ? 'text-amber-500' : 'text-green-500'}`} />
              <div>
                <h3 className="font-medium text-sm">
                  {language === 'en' ? 'Immune System' : 'مدافعتی نظام'}
                </h3>
                <p className={`text-xs ${categories.infection.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {language === 'en' 
                    ? (categories.infection.length > 0 ? 'Needs attention' : 'Working well')
                    : (categories.infection.length > 0 ? 'توجہ درکار' : 'اچھی طرح کام کر رہا')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anemia Status */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Droplets className={`h-5 w-5 ${categories.anemia.length > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <div>
                <h3 className="font-medium text-sm">
                  {language === 'en' ? 'Blood Oxygen' : 'خون میں آکسیجن'}
                </h3>
                <p className={`text-xs ${categories.anemia.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {language === 'en' 
                    ? (categories.anemia.length > 0 ? 'Low levels' : 'Normal levels')
                    : (categories.anemia.length > 0 ? 'کم سطح' : 'معمول کی سطح')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bleeding Risk */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className={`h-5 w-5 ${categories.bleeding.length > 0 ? 'text-orange-500' : 'text-green-500'}`} />
              <div>
                <h3 className="font-medium text-sm">
                  {language === 'en' ? 'Blood Clotting' : 'خون جمنا'}
                </h3>
                <p className={`text-xs ${categories.bleeding.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {language === 'en' 
                    ? (categories.bleeding.length > 0 ? 'May need care' : 'Working well')
                    : (categories.bleeding.length > 0 ? 'دیکھ بھال کی ضرورت' : 'اچھی طرح کام کر رہا')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Status */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Heart className={`h-5 w-5 text-${healthStatus.color}-500`} />
              <div>
                <h3 className="font-medium text-sm">
                  {language === 'en' ? 'Overall Health' : 'مجموعی صحت'}
                </h3>
                <p className={`text-xs text-${healthStatus.color}-600`}>
                  {language === 'en' ? healthStatus.textEn : healthStatus.textUr}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Recommendations */}
      {abnormalResults.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              {language === 'en' ? 'What This Means for You' : 'آپ کے لیے اس کا مطلب'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.anemia.length > 0 && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {language === 'en' 
                        ? '🩸 Your blood may not be carrying enough oxygen'
                        : '🩸 آپ کا خون کافی آکسیجن نہیں لے جا رہا'
                      }
                    </p>
                    <p className="text-sm">
                      {language === 'en' 
                        ? 'This might make you feel tired or weak. Common causes include not eating enough iron-rich foods or blood loss.'
                        : 'اس سے آپ کو تھکاوٹ یا کمزوری محسوس ہو سکتی ہے۔ عام وجوہات میں آئرن والی غذا کم کھانا یا خون کا ضیاع شامل ہے۔'
                      }
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {categories.infection.length > 0 && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {language === 'en' 
                        ? '🛡️ Your immune system is active'
                        : '🛡️ آپ کا مدافعتی نظام فعال ہے'
                      }
                    </p>
                    <p className="text-sm">
                      {language === 'en' 
                        ? 'Your body might be fighting an infection or inflammation. This is usually temporary.'
                        : 'آپ کا جسم کسی انفیکشن یا سوزش سے لڑ رہا ہو سکتا ہے۔ یہ عام طور پر عارضی ہوتا ہے۔'
                      }
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {categories.bleeding.length > 0 && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {language === 'en' 
                        ? '🩹 Your blood clotting ability may be reduced'
                        : '🩹 آپ کے خون جمنے کی صلاحیت کم ہو سکتی ہے'
                      }
                    </p>
                    <p className="text-sm">
                      {language === 'en' 
                        ? 'You might bruise more easily or bleed longer from cuts. Be gentle with activities.'
                        : 'آپ کو آسانی سے چوٹ لگ سکتی ہے یا کٹنے پر زیادہ دیر خون بہہ سکتا ہے۔ سرگرمیوں میں احتیاط کریں۔'
                      }
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2">
                {language === 'en' ? '👨‍⚕️ Next Steps:' : '👨‍⚕️ اگلے قدم:'}
              </h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>
                  {language === 'en' 
                    ? 'Share these results with your doctor'
                    : 'یہ نتائج اپنے ڈاکٹر کے ساتھ شیئر کریں'
                  }
                </li>
                <li>
                  {language === 'en' 
                    ? 'Ask about any symptoms you\'ve been having'
                    : 'آپ کو ہونے والی علامات کے بارے میں پوچھیں'
                  }
                </li>
                <li>
                  {language === 'en' 
                    ? 'Follow up with recommended tests or treatments'
                    : 'تجویز کردہ ٹیسٹس یا علاج کو فالو اپ کریں'
                  }
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CBCSummaryCard;
