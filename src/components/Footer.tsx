
const Footer = ({ language }: { language: string }) => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {language === "en" ? (
            <p className="text-gray-600 text-sm mb-4">
              <strong>Disclaimer:</strong> For informational purposes only. Consult a qualified healthcare professional for diagnosis and treatment.
            </p>
          ) : (
            <p className="text-gray-600 text-sm mb-4 font-urdu">
              <strong>انتباہ:</strong> صرف معلوماتی مقاصد کے لیے۔ تشخیص اور علاج کے لیے ایک قابل صحت کی دیکھ بھال کرنے والے پیشہ ور سے مشورہ کریں۔
            </p>
          )}
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} BloodVista CBC Analyzer
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
