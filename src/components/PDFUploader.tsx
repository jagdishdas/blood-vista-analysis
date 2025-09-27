
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileCheck, Loader2, FileImage, AlertCircle } from 'lucide-react';
import { processPDF, processImageFile, extractBloodTestData, convertToBloodTestFormData, extractCBCData, convertToCBCFormData } from '@/utils/pdf-processor';
import { BloodTestParameter, BloodTestFormData } from '@/types/blood-test.types';
import { CBCParameter, CBCFormData } from '@/types/cbc.types';
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PDFUploaderProps {
  language: string;
  parameters: BloodTestParameter[] | CBCParameter[];
  onExtracted: (data: BloodTestFormData | CBCFormData) => void;
  testType: 'cbc' | 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation';
}

const PDFUploader = ({ language, parameters, onExtracted, testType }: PDFUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image'>('pdf');
  const [activeTab, setActiveTab] = useState<string>('pdf');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getTestTypeTitle = () => {
    switch (testType) {
      case 'cbc':
        return language === 'en' ? 'CBC Report' : 'سی بی سی رپورٹ';
      case 'lipid':
        return language === 'en' ? 'Lipid Profile Report' : 'لپڈ پروفائل رپورٹ';
      case 'glucose':
        return language === 'en' ? 'Glucose Test Report' : 'گلوکوز ٹیسٹ رپورٹ';
      case 'thyroid':
        return language === 'en' ? 'Thyroid Function Test Report' : 'تھائرائیڈ فنکشن ٹیسٹ رپورٹ';
      case 'liver':
        return language === 'en' ? 'Liver Function Test Report' : 'جگر کے فنکشن ٹیسٹ رپورٹ';
      case 'kidney':
        return language === 'en' ? 'Kidney Function Test Report' : 'گردے کے فنکشن ٹیسٹ رپورٹ';
      case 'cardiac':
        return language === 'en' ? 'Cardiac Markers Report' : 'دل کے مارکرز رپورٹ';
      case 'inflammatory':
        return language === 'en' ? 'Inflammatory Markers Report' : 'سوزش کے مارکرز رپورٹ';
      case 'electrolytes':
        return language === 'en' ? 'Electrolytes & Minerals Report' : 'الیکٹرولائٹس اور معدنیات رپورٹ';
      case 'vitamins':
        return language === 'en' ? 'Vitamins & Deficiencies Report' : 'وٹامنز اور کمی رپورٹ';
      case 'hormonal':
        return language === 'en' ? 'Hormonal Tests Report' : 'ہارمونل ٹیسٹس رپورٹ';
      case 'tumor':
        return language === 'en' ? 'Tumor Markers Report' : 'ٹیومر مارکرز رپورٹ';
      case 'autoimmune':
        return language === 'en' ? 'Autoimmune Markers Report' : 'خود کار قوت مدافعت کے مارکرز رپورٹ';
      case 'coagulation':
        return language === 'en' ? 'Coagulation Studies Report' : 'خون کے جمنے کے مطالعات کی رپورٹ';
      default:
        return language === 'en' ? 'Blood Test Report' : 'خون کے ٹیسٹ کی رپورٹ';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setErrorMessage(null);
      
      console.log(`Selected ${type} file:`, selectedFile.name, selectedFile.size, selectedFile.type);
      
      if (type === 'pdf' && !selectedFile.type.includes('pdf')) {
        toast({
          title: language === 'en' ? 'Invalid File Type' : 'غلط فائل کی قسم',
          description: language === 'en' 
            ? 'Please upload a PDF file' 
            : 'براہ کرم PDF فائل اپلوڈ کریں',
          variant: 'destructive'
        });
        return;
      } else if (type === 'image' && !selectedFile.type.includes('image')) {
        toast({
          title: language === 'en' ? 'Invalid File Type' : 'غلط فائل کی قسم',
          description: language === 'en' 
            ? 'Please upload an image file (JPG, PNG, etc.)' 
            : 'براہ کرم تصویر فائل اپلوڈ کریں (JPG، PNG، وغیرہ)',
          variant: 'destructive'
        });
        return;
      }
      
      setFile(selectedFile);
      setFileType(type);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      console.log(`Processing ${fileType} file: ${file.name} for ${testType} test`);
      
      let ocrResult;
      
      if (fileType === 'pdf') {
        console.log('Starting PDF processing...');
        ocrResult = await processPDF(file);
        console.log('PDF processing completed, confidence:', ocrResult.confidence);
      } else {
        console.log('Starting image processing...');
        ocrResult = await processImageFile(file);
        console.log('Image processing completed, confidence:', ocrResult.confidence);
      }
      
      console.log('OCR Text length:', ocrResult.text.length);
      console.log('OCR Text preview:', ocrResult.text.substring(0, 500));
      
      if (ocrResult.confidence < 60) {
        console.warn('Low OCR confidence:', ocrResult.confidence);
        toast({
          title: language === 'en' ? 'Low Quality Scan' : 'کم معیار کی اسکین',
          description: language === 'en'
            ? 'The scan quality is low. Results may not be accurate.'
            : 'اسکین کا معیار کم ہے۔ نتائج درست نہیں ہوسکتے ہیں۔',
          variant: 'default'
        });
      }
      
      console.log(`Starting ${testType} data extraction...`);
      
      let extractedData;
      let formData;
      
      if (testType === 'cbc') {
        // Handle CBC extraction separately
        extractedData = extractCBCData(ocrResult.text);
        console.log('Extracted CBC data:', extractedData);
        
        if (extractedData.parameters.length === 0) {
          setErrorMessage(language === 'en'
            ? 'Could not extract CBC parameters from the file. Please try uploading a clearer scan or enter values manually.'
            : 'فائل سے CBC پیرامیٹرز حاصل نہیں کرسکا۔ براہ کرم واضح اسکین اپلوڈ کریں یا قدریں دستی طور پر درج کریں۔');
          
          toast({
            title: language === 'en' ? 'No Data Found' : 'کوئی ڈیٹا نہیں ملا',
            description: language === 'en'
              ? 'Could not extract CBC parameters from the file. Please try uploading a clearer scan or enter values manually.'
              : 'فائل سے CBC پیرامیٹرز حاصل نہیں کرسکا۔ براہ کرم واضح اسکین اپلوڈ کریں یا قدریں دستی طور پر درج کریں۔',
            variant: 'destructive'
          });
          return;
        }
        
        console.log('Converting CBC to form data...');
        formData = convertToCBCFormData(extractedData, parameters as CBCParameter[]);
      } else {
        // Handle other blood test types
        extractedData = extractBloodTestData(ocrResult.text, testType as 'lipid' | 'glucose' | 'thyroid');
        console.log('Extracted blood test data:', extractedData);
        
        if (extractedData.parameters.length === 0) {
          setErrorMessage(language === 'en'
            ? `Could not extract ${testType} parameters from the file. Please try uploading a clearer scan or enter values manually.`
            : `فائل سے ${testType} پیرامیٹرز حاصل نہیں کرسکا۔ براہ کرم واضح اسکین اپلوڈ کریں یا قدریں دستی طور پر درج کریں۔`);
          
          toast({
            title: language === 'en' ? 'No Data Found' : 'کوئی ڈیٹا نہیں ملا',
            description: language === 'en'
              ? `Could not extract ${testType} parameters from the file. Please try uploading a clearer scan or enter values manually.`
              : `فائل سے ${testType} پیرامیٹرز حاصل نہیں کرسکا۔ براہ کرم واضح اسکین اپلوڈ کریں یا قدریں دستی طور پر درج کریں۔`,
            variant: 'destructive'
          });
          return;
        }
        
        console.log('Converting to form data...');
        formData = convertToBloodTestFormData(extractedData, parameters as BloodTestParameter[], testType as 'lipid' | 'glucose' | 'thyroid');
      }
      
      console.log('Form data ready:', formData);
      
      onExtracted(formData);
      
      toast({
        title: language === 'en' ? 'Report Processed Successfully' : 'رپورٹ کامیابی سے پروسیس کی گئی',
        description: language === 'en'
          ? `Extracted ${extractedData.parameters.length} parameters with international standard units. Please verify the values before analysis.`
          : `${extractedData.parameters.length} پیرامیٹرز بین الاقوامی معیاری یونٹس کے ساتھ نکالے گئے۔ براہ کرم تجزیہ سے پہلے قدروں کی تصدیق کریں۔`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(language === 'en'
        ? 'Failed to process the file. Please try again or enter values manually.'
        : 'فائل کو پروسیس کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں یا قدریں دستی طور پر درج کریں۔');
      
      toast({
        title: language === 'en' ? 'Processing Error' : 'پروسیسنگ میں خرابی',
        description: language === 'en'
          ? 'Failed to process the file. Please try again or enter values manually.'
          : 'فائل کو پروسیس کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں یا قدریں دستی طور پر درج کریں۔',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {language === 'en' ? `Upload ${getTestTypeTitle()}` : `${getTestTypeTitle()} اپلوڈ کریں`}
        </CardTitle>
        <CardDescription>
          {language === 'en' 
            ? `Upload your ${testType} test report as PDF or image for automatic extraction with international standard units` 
            : `بین الاقوامی معیاری یونٹس کے ساتھ خودکار استخراج کے لیے اپنی ${testType} ٹیسٹ رپورٹ پی ڈی ایف یا تصویر کے طور پر اپلوڈ کریں`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf">
              {language === 'en' ? 'PDF Upload' : 'پی ڈی ایف اپلوڈ'}
            </TabsTrigger>
            <TabsTrigger value="image">
              {language === 'en' ? 'Image Upload' : 'تصویر اپلوڈ'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pdf" className="mt-4">
            <div className="flex flex-col items-center justify-center w-full">
              <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
                  {!file || fileType !== 'pdf' ? (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {language === 'en' 
                          ? 'Click to upload or drag and drop' 
                          : 'اپلوڈ کرنے کے لیے کلک کریں یا کھینچ کر چھوڑیں'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF (MAX. 10MB)</p>
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </>
                  )}
                </div>
                <input 
                  id="pdf-upload" 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'pdf')} 
                  disabled={isProcessing}
                />
              </label>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="mt-4">
            <div className="flex flex-col items-center justify-center w-full">
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
                  {!file || fileType !== 'image' ? (
                    <>
                      <FileImage className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {language === 'en' 
                          ? `Upload ${testType} test report image` 
                          : `${testType} ٹیسٹ رپورٹ کی تصویر اپلوڈ کریں`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG (MAX. 10MB)</p>
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </>
                  )}
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'image')} 
                  disabled={isProcessing}
                />
              </label>
            </div>
          </TabsContent>
        </Tabs>

        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleProcess} 
          disabled={!file || isProcessing} 
          className="w-full"
          variant={file ? "default" : "outline"}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'en' ? 'Processing with International Standards...' : 'بین الاقوامی معیارات کے ساتھ پروسیسنگ...'}
            </>
          ) : (
            <>
              {language === 'en' ? `Extract ${testType.toUpperCase()} Data (International Standard)` : `${testType.toUpperCase()} ڈیٹا نکالیں (بین الاقوامی معیار)`}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PDFUploader;
