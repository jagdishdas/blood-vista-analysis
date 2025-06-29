
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BloodTestAnalysis } from '@/types/blood-test.types';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BloodTestResultsProps {
  analysis: BloodTestAnalysis;
  language: string;
}

const BloodTestResults = ({ analysis, language }: BloodTestResultsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'low': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical-low':
      case 'critical-high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'low':
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'critical-low':
      case 'critical-high': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTestTypeTitle = () => {
    switch (analysis.testType) {
      case 'lipid':
        return language === 'en' ? 'Lipid Profile Results' : 'لپڈ پروفائل کے نتائج';
      case 'glucose':
        return language === 'en' ? 'Glucose Test Results' : 'گلوکوز ٹیسٹ کے نتائج';
      case 'thyroid':
        return language === 'en' ? 'Thyroid Function Test Results' : 'تھائرائیڈ فنکشن ٹیسٹ کے نتائج';
      default:
        return language === 'en' ? 'Blood Test Results' : 'خون کے ٹیسٹ کے نتائج';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(analysis.overallRisk)}
            <span>{getTestTypeTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className={`border-2 ${getRiskColor(analysis.overallRisk)}`}>
              <AlertDescription className="text-sm">
                {language === 'en' ? analysis.summary.en : analysis.summary.ur}
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {language === 'en' ? 'Overall Risk Level:' : 'مجموعی خطرے کی سطح:'}
              </span>
              <Badge className={getRiskColor(analysis.overallRisk)}>
                {language === 'en' ? analysis.overallRisk.toUpperCase() : 
                  analysis.overallRisk === 'low' ? 'کم' :
                  analysis.overallRisk === 'moderate' ? 'متوسط' :
                  analysis.overallRisk === 'high' ? 'زیادہ' : 'تشویشناک'
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Parameter Results */}
      <div className="grid grid-cols-1 gap-4">
        {analysis.results.map((result, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: getStatusColor(result.status).replace('bg-', '#') }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {language === 'en' ? result.parameter.nameEn : result.parameter.nameUr}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <Badge variant="outline" className={getStatusColor(result.status) + ' text-white'}>
                    {language === 'en' ? result.status.replace('-', ' ').toUpperCase() : 
                      result.status === 'normal' ? 'معمول' :
                      result.status === 'low' ? 'کم' :
                      result.status === 'high' ? 'زیادہ' :
                      result.status === 'critical-low' ? 'تشویشناک کم' : 'تشویشناک زیادہ'
                    }
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Value and Reference Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'en' ? 'Your Value' : 'آپ کی قدر'}
                  </p>
                  <p className="text-2xl font-bold">
                    {result.parameter.value} {result.parameter.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'en' ? 'Normal Range' : 'معمول کی حد'}
                  </p>
                  <p className="text-lg">
                    {result.parameter.referenceRange.min} - {result.parameter.referenceRange.max} {result.parameter.unit}
                  </p>
                </div>
              </div>

              {/* Deviation Progress Bar */}
              {result.status !== 'normal' && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      {language === 'en' ? 'Deviation from Normal' : 'معمول سے انحراف'}
                    </span>
                    <span>{Math.abs(result.deviation).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(Math.abs(result.deviation), 100)} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Interpretation */}
              <div>
                <h4 className="font-semibold mb-2">
                  {language === 'en' ? 'Interpretation' : 'تشریح'}
                </h4>
                <p className="text-sm leading-relaxed">
                  {language === 'en' ? result.interpretation.en : result.interpretation.ur}
                </p>
              </div>

              {/* Recommendations */}
              {result.recommendations.en.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? 'Recommendations' : 'تجاویز'}
                  </h4>
                  <ul className="text-sm space-y-1">
                    {(language === 'en' ? result.recommendations.en : result.recommendations.ur).map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Related Conditions */}
      {analysis.relatedConditions.en.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Related Health Conditions' : 'متعلقہ صحت کے مسائل'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(language === 'en' ? analysis.relatedConditions.en : analysis.relatedConditions.ur).map((condition, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{condition}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BloodTestResults;
