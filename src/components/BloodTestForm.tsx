
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BloodTestFormData, BloodTestParameter } from '@/types/blood-test.types';
import { getTestParameters } from '@/utils/test-parameters';
import PDFUploader from './PDFUploader';

interface BloodTestFormProps {
  language: string;
  testType: 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation';
  onSubmit: (data: BloodTestFormData) => void;
}

const BloodTestForm = ({ language, testType, onSubmit }: BloodTestFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<BloodTestFormData>({
    defaultValues: {
      patientName: '',
      patientAge: 30,
      patientGender: 'male',
      testType,
      parameters: []
    }
  });

  const watchedValues = watch();
  const patientGender = watch('patientGender') || 'male';
  const patientAge = watch('patientAge') || 30;
  
  // Initialize parameters with default gender and age, then update based on form values
  const [parameters, setParameters] = useState<BloodTestParameter[]>(() => 
    getTestParameters(testType, 'male', 30).map(param => ({
      ...param,
      value: ''
    }))
  );

  // Update parameters when gender, age, or test type changes to reflect accurate reference ranges
  useEffect(() => {
    const gender = (patientGender || 'male') as 'male' | 'female';
    const age = patientAge || 30;
    const newParameters = getTestParameters(testType, gender, age);
    
    // Preserve existing values when updating parameters
    setParameters(prevParams => 
      newParameters.map(newParam => {
        const existingParam = prevParams.find(p => p.id === newParam.id);
        return existingParam ? { ...newParam, value: existingParam.value } : { ...newParam, value: '' };
      })
    );
  }, [testType, patientGender, patientAge]);

  const handleParameterChange = (parameterId: string, value: string) => {
    const updatedParameters = parameters.map(param =>
      param.id === parameterId ? { ...param, value } : param
    );
    setParameters(updatedParameters);
    setValue('parameters', updatedParameters);
  };

  const handleExtractedData = (extractedFormData: BloodTestFormData) => {
    setValue('patientName', extractedFormData.patientName);
    setValue('patientAge', extractedFormData.patientAge);
    setValue('patientGender', extractedFormData.patientGender);
    
    const updatedParameters = parameters.map(param => {
      const extractedParam = extractedFormData.parameters.find(p => p.id === param.id);
      return extractedParam ? { ...param, value: extractedParam.value } : param;
    });
    
    setParameters(updatedParameters);
    setValue('parameters', updatedParameters);
  };

  const onFormSubmit = (data: BloodTestFormData) => {
    const formData = {
      ...data,
      parameters: parameters.filter(param => param.value !== '')
    };
    onSubmit(formData);
  };

  const getTestTitle = () => {
    switch (testType) {
      case 'lipid':
        return language === 'en' ? 'Lipid Profile Analysis' : 'لپڈ پروفائل تجزیہ';
      case 'glucose':
        return language === 'en' ? 'Glucose Tests Analysis' : 'گلوکوز ٹیسٹس تجزیہ';
      case 'thyroid':
        return language === 'en' ? 'Thyroid Function Tests' : 'تھائرائیڈ فنکشن ٹیسٹس';
      case 'liver':
        return language === 'en' ? 'Liver Function Tests (LFT)' : 'جگر کے فنکشن ٹیسٹس';
      case 'kidney':
        return language === 'en' ? 'Kidney Function Tests (KFT)' : 'گردے کے فنکشن ٹیسٹس';
      case 'cardiac':
        return language === 'en' ? 'Cardiac Markers Analysis' : 'دل کے مارکرز کا تجزیہ';
      case 'inflammatory':
        return language === 'en' ? 'Inflammatory Markers' : 'سوزش کے مارکرز';
      case 'electrolytes':
        return language === 'en' ? 'Electrolytes & Minerals' : 'الیکٹرولائٹس اور معدنیات';
      case 'vitamins':
        return language === 'en' ? 'Vitamins & Deficiencies' : 'وٹامنز اور کمی';
      case 'hormonal':
        return language === 'en' ? 'Hormonal Tests Analysis' : 'ہارمونل ٹیسٹس کا تجزیہ';
      case 'tumor':
        return language === 'en' ? 'Tumor Markers Analysis' : 'ٹیومر مارکرز کا تجزیہ';
      case 'autoimmune':
        return language === 'en' ? 'Autoimmune Markers' : 'خود کار قوت مدافعت کے مارکرز';
      case 'coagulation':
        return language === 'en' ? 'Coagulation Studies' : 'خون کے جمنے کے مطالعات';
      default:
        return language === 'en' ? 'Blood Test Analysis' : 'خون کا ٹیسٹ تجزیہ';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {getTestTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              {language === 'en' ? 'Upload Report' : 'رپورٹ اپلوڈ کریں'}
            </TabsTrigger>
            <TabsTrigger value="manual">
              {language === 'en' ? 'Manual Entry' : 'دستی اندراج'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <PDFUploader
              language={language}
              parameters={parameters}
              onExtracted={handleExtractedData}
              testType={testType}
            />
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="patientName">
                    {language === 'en' ? 'Patient Name' : 'مریض کا نام'}
                  </Label>
                  <Input
                    id="patientName"
                    {...register('patientName')}
                    placeholder={language === 'en' ? 'Enter patient name' : 'مریض کا نام درج کریں'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="patientAge">
                    {language === 'en' ? 'Age' : 'عمر'}
                  </Label>
                  <Input
                    id="patientAge"
                    type="number"
                    {...register('patientAge', { valueAsNumber: true })}
                    placeholder={language === 'en' ? 'Age in years' : 'سال میں عمر'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="patientGender">
                    {language === 'en' ? 'Gender' : 'جنس'}
                  </Label>
                  <Select onValueChange={(value) => setValue('patientGender', value as 'male' | 'female')}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select gender' : 'جنس منتخب کریں'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">
                        {language === 'en' ? 'Male' : 'مرد'}
                      </SelectItem>
                      <SelectItem value="female">
                        {language === 'en' ? 'Female' : 'عورت'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Test Parameters */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'en' ? 'Test Parameters' : 'ٹیسٹ پیرامیٹرز'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parameters.map((parameter) => (
                    <div key={parameter.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Label className="font-medium">
                            {language === 'en' ? parameter.nameEn : parameter.nameUr}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {language === 'en' 
                              ? `Normal: ${parameter.referenceRange.min}-${parameter.referenceRange.max} ${parameter.unit}`
                              : `معمول: ${parameter.referenceRange.min}-${parameter.referenceRange.max} ${parameter.unit}`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={parameter.value}
                          onChange={(e) => handleParameterChange(parameter.id, e.target.value)}
                          placeholder={language === 'en' ? 'Enter value' : 'قدر درج کریں'}
                          className="flex-1"
                        />
                        <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm font-medium min-w-[60px] justify-center">
                          {parameter.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-lg"
                disabled={parameters.every(p => p.value === '')}
              >
                {language === 'en' ? 'Analyze Blood Test Results' : 'خون کے ٹیسٹ کے نتائج کا تجزیہ کریں'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BloodTestForm;
