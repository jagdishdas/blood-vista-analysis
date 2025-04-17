
const Footer = ({ language }: { language: string }) => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              {language === "en" ? "About BloodVista" : "بلڈ وسٹا کے بارے میں"}
            </h3>
            <p className="text-sm text-gray-600">
              {language === "en" 
                ? "BloodVista provides automated analysis of Complete Blood Count (CBC) reports with detailed interpretations in English and Urdu." 
                : "بلڈ وسٹا انگریزی اور اردو میں تفصیلی تشریح کے ساتھ مکمل بلڈ کاؤنٹ (سی بی سی) رپورٹس کا آٹومیٹڈ تجزیہ فراہم کرتا ہے۔"}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              {language === "en" ? "Features" : "خصوصیات"}
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                {language === "en" 
                  ? "• Manual parameter entry" 
                  : "• پیرامیٹر کا دستی اندراج"}
              </li>
              <li>
                {language === "en" 
                  ? "• PDF report upload & extraction" 
                  : "• پی ڈی ایف رپورٹ اپلوڈ اور استخراج"}
              </li>
              <li>
                {language === "en" 
                  ? "• Bilingual analysis (English/Urdu)" 
                  : "• دو لسانی تجزیہ (انگریزی/اردو)"}
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              {language === "en" ? "Disclaimer" : "انتباہ"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {language === "en" 
                ? "For informational purposes only. Consult a qualified healthcare professional for diagnosis and treatment." 
                : "صرف معلوماتی مقاصد کے لیے۔ تشخیص اور علاج کے لیے ایک قابل صحت کی دیکھ بھال کرنے والے پیشہ ور سے مشورہ کریں۔"}
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8 pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} BloodVista CBC Analyzer
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
