import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { CBCFormData } from "@/types/cbc.types";
import { BloodTestFormData, BloodTestAnalysis } from "@/types/blood-test.types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CBCForm from "@/components/CBCForm";
import CBCResults from "@/components/CBCResults";
import BloodTestForm from "@/components/BloodTestForm";
import BloodTestResults from "@/components/BloodTestResults";
import TestCategorySelector from "@/components/TestCategorySelector";
import { analyzeCBC } from "@/utils/cbc-analyzer";
import { analyzeBloodTest } from "@/utils/blood-test-analyzer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>("en");
  const [selectedTestCategory, setSelectedTestCategory] = useState<string>("cbc");
  const [analysis, setAnalysis] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCBCFormSubmit = (data: CBCFormData) => {
    if (!user) {
      toast({
        title: language === "en" ? "Sign in required" : "سائن ان کی ضرورت ہے",
        description: language === "en"
          ? "Please sign in to analyze your blood test results."
          : "اپنے خون کے ٹیسٹ کے نتائج کا تجزیہ کرنے کے لیے سائن ان کریں۔",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

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
    if (!user) {
      toast({
        title: language === "en" ? "Sign in required" : "سائن ان کی ضرورت ہے",
        description: language === "en"
          ? "Please sign in to analyze your blood test results."
          : "اپنے خون کے ٹیسٹ کے نتائج کا تجزیہ کرنے کے لیے سائن ان کریں۔",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

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

  const renderTestForm = () => {
    switch (selectedTestCategory) {
      case 'cbc':
        return <CBCForm language={language} onSubmit={handleCBCFormSubmit} />;
      case 'lipid':
        return <BloodTestForm language={language} testType="lipid" onSubmit={handleBloodTestFormSubmit} />;
      case 'glucose':
        return <BloodTestForm language={language} testType="glucose" onSubmit={handleBloodTestFormSubmit} />;
      case 'thyroid':
        return <BloodTestForm language={language} testType="thyroid" onSubmit={handleBloodTestFormSubmit} />;
      case 'liver':
        return <BloodTestForm language={language} testType="liver" onSubmit={handleBloodTestFormSubmit} />;
      case 'kidney':
        return <BloodTestForm language={language} testType="kidney" onSubmit={handleBloodTestFormSubmit} />;
      case 'cardiac':
        return <BloodTestForm language={language} testType="cardiac" onSubmit={handleBloodTestFormSubmit} />;
      case 'inflammatory':
        return <BloodTestForm language={language} testType="inflammatory" onSubmit={handleBloodTestFormSubmit} />;
      case 'electrolytes':
        return <BloodTestForm language={language} testType="electrolytes" onSubmit={handleBloodTestFormSubmit} />;
      case 'vitamins':
        return <BloodTestForm language={language} testType="vitamins" onSubmit={handleBloodTestFormSubmit} />;
      case 'hormonal':
        return <BloodTestForm language={language} testType="hormonal" onSubmit={handleBloodTestFormSubmit} />;
      case 'tumor':
        return <BloodTestForm language={language} testType="tumor" onSubmit={handleBloodTestFormSubmit} />;
      case 'autoimmune':
        return <BloodTestForm language={language} testType="autoimmune" onSubmit={handleBloodTestFormSubmit} />;
      case 'coagulation':
        return <BloodTestForm language={language} testType="coagulation" onSubmit={handleBloodTestFormSubmit} />;
      default:
        return <CBCForm language={language} onSubmit={handleCBCFormSubmit} />;
    }
  };

  const renderResults = () => {
    if (!analysis) return null;
    
    // Check if it's CBC analysis (has cbcCategory) or blood test analysis (has testType)
    if (analysis.cbcCategory) {
      return <CBCResults analysis={analysis} language={language} />;
    } else {
      return <BloodTestResults analysis={analysis} language={language} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          
          {renderTestForm()}
          
          {analysis && (
            <div id="results-section" className="mt-8">
              {renderResults()}
            </div>
          )}
        </div>
      </main>
      
      <Footer language={language} />
    </div>
  );
};

export default Index;
