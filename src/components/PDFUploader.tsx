
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileCheck, AlertOctagon, Loader2 } from 'lucide-react';
import { processPDF, extractCBCData, convertToCBCFormData } from '@/utils/pdf-processor';
import { CBCParameter, CBCFormData } from '@/types/cbc.types';
import { toast } from "@/components/ui/use-toast";

interface PDFUploaderProps {
  language: string;
  parameters: CBCParameter[];
  onExtracted: (data: CBCFormData) => void;
}

const PDFUploader = ({ language, parameters, onExtracted }: PDFUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if the file is a PDF
      if (!selectedFile.type.includes('pdf')) {
        toast({
          title: language === 'en' ? 'Invalid File Type' : 'غلط فائل کی قسم',
          description: language === 'en' 
            ? 'Please upload a PDF file' 
            : 'براہ کرم PDF فائل اپلوڈ کریں',
          variant: 'destructive'
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const ocrResult = await processPDF(file);
      
      if (ocrResult.confidence < 60) {
        toast({
          title: language === 'en' ? 'Low Quality Scan' : 'کم معیار کی اسکین',
          description: language === 'en'
            ? 'The scan quality is low. Results may not be accurate.'
            : 'اسکین کا معیار کم ہے۔ نتائج درست نہیں ہوسکتے ہیں۔',
          variant: 'warning'
        });
      }
      
      const extractedData = extractCBCData(ocrResult.text);
      
      if (extractedData.parameters.length === 0) {
        toast({
          title: language === 'en' ? 'No Data Found' : 'کوئی ڈیٹا نہیں ملا',
          description: language === 'en'
            ? 'Could not extract CBC parameters from the PDF. Please try uploading a clearer scan or enter values manually.'
            : 'پی ڈی ایف سے سی بی سی پیرامیٹرز حاصل نہیں کرسکا۔ براہ کرم واضح اسکین اپلوڈ کریں یا قدریں دستی طور پر درج کریں۔',
          variant: 'destructive'
        });
        return;
      }
      
      const formData = convertToCBCFormData(extractedData, parameters);
      onExtracted(formData);
      
      toast({
        title: language === 'en' ? 'Report Processed Successfully' : 'رپورٹ کامیابی سے پروسیس کی گئی',
        description: language === 'en'
          ? `Extracted ${extractedData.parameters.length} parameters. Please verify the values before analysis.`
          : `${extractedData.parameters.length} پیرامیٹرز نکالے گئے۔ براہ کرم تجزیہ سے پہلے قدروں کی تصدیق کریں۔`,
      });
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: language === 'en' ? 'Processing Error' : 'پروسیسنگ میں خرابی',
        description: language === 'en'
          ? 'Failed to process the PDF. Please try again or enter values manually.'
          : 'پی ڈی ایف کو پروسیس کرنے میں ناکام۔ براہ کرم دوبارہ کوشش کریں یا قدریں دستی طور پر درج کریں۔',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>
          {language === 'en' ? 'Upload CBC Report PDF' : 'سی بی سی رپورٹ پی ڈی ایف اپلوڈ کریں'}
        </CardTitle>
        <CardDescription>
          {language === 'en' 
            ? 'Upload your CBC report in PDF format for automatic extraction' 
            : 'خودکار استخراج کے لیے اپنی سی بی سی رپورٹ پی ڈی ایف فارمیٹ میں اپلوڈ کریں'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
              {!file ? (
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
              onChange={handleFileChange} 
              disabled={isProcessing}
            />
          </label>
        </div>
        
        <Button 
          onClick={handleProcess} 
          disabled={!file || isProcessing} 
          className="w-full"
          variant={file ? "default" : "outline"}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'en' ? 'Processing...' : 'پروسیسنگ...'}
            </>
          ) : (
            <>
              {language === 'en' ? 'Extract CBC Data' : 'سی بی سی ڈیٹا نکالیں'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PDFUploader;
