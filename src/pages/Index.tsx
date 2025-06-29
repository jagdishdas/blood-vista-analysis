
import { useState } from "react";
import { CBCFormData } from "@/types/cbc.types";
import { BloodTestFormData, BloodTestAnalysis } from "@/types/blood-test.types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CBCForm from "@/components/CBCForm";
import CBCResults from "@/components/CBCResults";
import TestCategorySelector from "@/components/TestCategorySelector";
import { analyzeCBC } from "@/utils/cbc-analyzer";
import { analyzeBloodTest } from "@/utils/blood-test-analyzer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [language, setLanguage] = useState<string>("en");
  const [selectedTestCategory, setSelectedTestCategory] = useState<string>("cbc");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleCBCFormSubmit = (data: CBCFormData) => {
    try {
      const results = analyzeCBC(data);
      setAnalysis(results);
      
      toast({
        title: language === "en" ? "Analysis Complete" : "تجزیہ مکمل",
        description: language === "en" 
          ? "Your CBC results have been analyzed successfully."
          : "آپ کے سی بی سی نتائج کا کامیابی سے تجزیہ کیا گیا ہے۔",
      });
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: language === "en" ? "Analysis Error" : "تجزیہ میں خرابی",
        description: language === "en"
          ? "There was an error analyzing your CBC results. Please try again."
          : "آپ کے سی بی سی نتائج کا تجزیہ کرنے میں ایک خرابی تھی۔ دوبارہ کوشش کریں۔",
        variant: "destructive",
      });
    }
  };

  const handleBloodTestFormSubmit = (data: BloodTestFormData) => {
    try {
      const results = analyzeBloodTest(data);
      setAnalysis(results);
      
      toast({
        title: language === "en" ? "Analysis Complete" : "تجزیہ مکمل",
        description: language === "en" 
          ? "Your blood test results have been analyzed successfully."
          : "آپ کے خون کے ٹیسٹ کے نتائج کا کامیابی سے تجزیہ کیا گیا ہے۔",
      });
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: language === "en" ? "Analysis Error" : "تجزیہ میں خرابی",
        description: language === "en"
          ? "There was an error analyzing your blood test results. Please try again."
          : "آپ کے خون کے ٹیسٹ کے نتائج کا تجزیہ کرنے میں ایک خرابی تھی۔ دوبارہ کوشش کریں۔",
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedTestCategory(categoryId);
    setAnalysis(null); // Clear previous analysis when switching categories
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header language={language} setLanguage={setLanguage} />
      <Toaster />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {language === "en" ? "BloodVista - Comprehensive Blood Test Analyzer" : "بلڈ وسٹا - جامع خون کا ٹیسٹ تجزیہ کار"}
            </h1>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              {language === "en" 
                ? "Upload your blood test report PDF or image, or enter parameters manually for professional analysis and interpretation across multiple test categories"
                : "پیشہ ورانہ تجزیہ اور تشریح کے لیے اپنی خون کے ٹیسٹ کی رپورٹ پی ڈی ایف یا تصویر اپلوڈ کریں یا مختلف ٹیسٹ کیٹگریز میں پیرامیٹرز کو دستی طور پر درج کریں"
              }
            </p>
          </div>
          
          <TestCategorySelector 
            language={language}
            selectedCategory={selectedTestCategory}
            onCategorySelect={handleCategorySelect}
          />
          
          {selectedTestCategory === 'cbc' ? (
            <CBCForm language={language} onSubmit={handleCBCFormSubmit} />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "en" ? "Coming Soon!" : "جلد آ رہا ہے!"}
                </h3>
                <p className="text-gray-600">
                  {language === "en" 
                    ? `${selectedTestCategory.charAt(0).toUpperCase() + selectedTestCategory.slice(1)} test analysis is being developed. Please use CBC for now.`
                    : `${selectedTestCategory} ٹیسٹ کا تجزیہ تیار کیا جا رہا ہے۔ براہ کرم ابھی کے لیے سی بی سی استعمال کریں۔`
                  }
                </p>
              </div>
            </div>
          )}
          
          {analysis && <div id="results-section"><CBCResults analysis={analysis} language={language} /></div>}
        </div>
      </main>
      
      <Footer language={language} />
    </div>
  );
};

export default Index;
