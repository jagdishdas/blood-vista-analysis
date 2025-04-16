
import { useState } from "react";
import { CBCFormData } from "@/types/cbc.types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CBCForm from "@/components/CBCForm";
import CBCResults from "@/components/CBCResults";
import { analyzeCBC } from "@/utils/cbc-analyzer";

const Index = () => {
  const [language, setLanguage] = useState<string>("en");
  const [analysis, setAnalysis] = useState(null);

  const handleFormSubmit = (data: CBCFormData) => {
    const results = analyzeCBC(data);
    setAnalysis(results);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === "en" ? "BloodVista CBC Report Analyzer" : "بلڈ وسٹا سی بی سی رپورٹ تجزیہ کار"}
            </h1>
            <p className="text-gray-600">
              {language === "en" 
                ? "Enter your Complete Blood Count (CBC) report parameters for professional analysis and interpretation"
                : "پیشہ ورانہ تجزیے اور تشریح کے لیے اپنی مکمل بلڈ کاؤنٹ (سی بی سی) رپورٹ کے پیرامیٹرز درج کریں"
              }
            </p>
          </div>
          
          <CBCForm language={language} onSubmit={handleFormSubmit} />
          
          {analysis && <CBCResults analysis={analysis} language={language} />}
        </div>
      </main>
      
      <Footer language={language} />
    </div>
  );
};

export default Index;
