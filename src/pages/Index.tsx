
import { useState } from "react";
import { CBCFormData } from "@/types/cbc.types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CBCForm from "@/components/CBCForm";
import CBCResults from "@/components/CBCResults";
import { analyzeCBC } from "@/utils/cbc-analyzer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [language, setLanguage] = useState<string>("en");
  const [analysis, setAnalysis] = useState(null);
  const { toast } = useToast();

  const handleFormSubmit = (data: CBCFormData) => {
    try {
      const results = analyzeCBC(data);
      setAnalysis(results);
      
      // Show success message
      toast({
        title: language === "en" ? "Analysis Complete" : "تجزیہ مکمل",
        description: language === "en" 
          ? "Your CBC results have been analyzed successfully."
          : "آپ کے سی بی سی نتائج کا کامیابی سے تجزیہ کیا گیا ہے۔",
      });
      
      // Scroll to results after a short delay to allow for render
      setTimeout(() => {
        if (document.getElementById('results-section')) {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header language={language} setLanguage={setLanguage} />
      <Toaster />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === "en" ? "BloodVista CBC Report Analyzer" : "بلڈ وسٹا سی بی سی رپورٹ تجزیہ کار"}
            </h1>
            <p className="text-gray-600">
              {language === "en" 
                ? "Upload your CBC report PDF or image, or enter parameters manually for professional analysis and interpretation"
                : "پیشہ ورانہ تجزیہ اور تشریح کے لیے اپنی سی بی سی رپورٹ پی ڈی ایف یا تصویر اپلوڈ کریں یا پیرامیٹرز کو دستی طور پر درج کریں"
              }
            </p>
          </div>
          
          <CBCForm language={language} onSubmit={handleFormSubmit} />
          
          {analysis && <div id="results-section"><CBCResults analysis={analysis} language={language} /></div>}
        </div>
      </main>
      
      <Footer language={language} />
    </div>
  );
};

export default Index;
