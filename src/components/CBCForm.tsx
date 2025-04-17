
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CBCFormData, CBCParameter } from "@/types/cbc.types";
import { getParameterReferenceRange } from "@/utils/cbc-reference-ranges";
import PDFUploader from "./PDFUploader";

interface CBCFormProps {
  language: string;
  onSubmit: (data: CBCFormData) => void;
}

// Define essential parameters for manual entry
const ESSENTIAL_PARAMETERS = ['wbc', 'rbc', 'hemoglobin', 'hematocrit', 'platelets'];

const CBCForm = ({ language, onSubmit }: CBCFormProps) => {
  const [formData, setFormData] = useState<CBCFormData>({
    patientName: "",
    patientAge: 0,
    patientGender: "",
    parameters: [
      {
        id: "wbc",
        nameEn: "White Blood Cell (WBC)",
        nameUr: "سفید خون کے خلیے (WBC)",
        value: "",
        unit: "× 10^9/L",
        referenceRange: { min: 0, max: 0 },
        category: "Primary"
      },
      {
        id: "rbc",
        nameEn: "Red Blood Cell (RBC)",
        nameUr: "سرخ خون کے خلیے (RBC)",
        value: "",
        unit: "× 10^12/L",
        referenceRange: { min: 0, max: 0 },
        category: "Primary"
      },
      {
        id: "hemoglobin",
        nameEn: "Hemoglobin (Hb)",
        nameUr: "ہیموگلوبن (Hb)",
        value: "",
        unit: "g/dL",
        referenceRange: { min: 0, max: 0 },
        category: "Primary"
      },
      {
        id: "hematocrit",
        nameEn: "Hematocrit (Hct)",
        nameUr: "ہیماٹوکرٹ (Hct)",
        value: "",
        unit: "%",
        referenceRange: { min: 0, max: 0 },
        category: "Primary"
      },
      {
        id: "platelets",
        nameEn: "Platelets",
        nameUr: "پلیٹلیٹس",
        value: "",
        unit: "× 10^9/L",
        referenceRange: { min: 0, max: 0 },
        category: "Primary"
      },
      {
        id: "mcv",
        nameEn: "Mean Corpuscular Volume (MCV)",
        nameUr: "میان کارپسکولر والیوم (MCV)",
        value: "",
        unit: "fL",
        referenceRange: { min: 0, max: 0 },
        category: "Secondary"
      },
      {
        id: "mch",
        nameEn: "Mean Corpuscular Hemoglobin (MCH)",
        nameUr: "میان کارپسکولر ہیموگلوبن (MCH)",
        value: "",
        unit: "pg",
        referenceRange: { min: 0, max: 0 },
        category: "Secondary"
      },
      {
        id: "mchc",
        nameEn: "MCHC",
        nameUr: "ایم سی ایچ سی",
        value: "",
        unit: "g/dL",
        referenceRange: { min: 0, max: 0 },
        category: "Secondary"
      },
      {
        id: "neutrophils",
        nameEn: "Neutrophils",
        nameUr: "نیوٹروفلز",
        value: "",
        unit: "%",
        referenceRange: { min: 0, max: 0 },
        category: "Differential"
      },
      {
        id: "lymphocytes",
        nameEn: "Lymphocytes",
        nameUr: "لمفوسائٹس",
        value: "",
        unit: "%",
        referenceRange: { min: 0, max: 0 },
        category: "Differential"
      },
      {
        id: "monocytes",
        nameEn: "Monocytes",
        nameUr: "مونوسائٹس",
        value: "",
        unit: "%",
        referenceRange: { min: 0, max: 0 },
        category: "Differential"
      },
      {
        id: "eosinophils",
        nameEn: "Eosinophils",
        nameUr: "ایوسینوفلز",
        value: "",
        unit: "%",
        referenceRange: { min: 0, max: 0 },
        category: "Differential"
      },
      {
        id: "basophils",
        nameEn: "Basophils",
        nameUr: "بیسوفلز",
        value: "",
        unit: "%",
        referenceRange: { min: 0, max: 0 },
        category: "Differential"
      }
    ]
  });

  const [activeTab, setActiveTab] = useState<string>("manual");

  // Update reference ranges when gender changes
  useEffect(() => {
    if (formData.patientGender) {
      const updatedParameters = formData.parameters.map(param => {
        const range = getParameterReferenceRange(param.id, formData.patientGender as 'male' | 'female');
        return { ...param, referenceRange: range };
      });
      
      setFormData(prev => ({ ...prev, parameters: updatedParameters }));
    }
  }, [formData.patientGender]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patientGender) {
      alert(language === 'en' ? 'Patient gender is required' : 'مریض کا جنس درکار ہے');
      return;
    }
    
    // For manual entry, check if essential parameters are filled
    if (activeTab === 'manual') {
      const essentialParams = formData.parameters.filter(p => ESSENTIAL_PARAMETERS.includes(p.id));
      const filledEssentialParams = essentialParams.filter(p => p.value !== '');
      
      if (filledEssentialParams.length < 3) {
        alert(
          language === 'en' 
            ? 'Please provide at least 3 essential CBC parameters' 
            : 'براہ کرم کم از کم 3 ضروری سی بی سی پیرامیٹرز فراہم کریں'
        );
        return;
      }
    }
    
    onSubmit(formData);
  };

  // Update parameter value
  const handleParameterChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map(param => 
        param.id === id ? { ...param, value } : param
      )
    }));
  };
  
  // Handle extracted data from PDF
  const handleExtractedData = (extractedData: CBCFormData) => {
    setFormData(extractedData);
    setActiveTab("manual"); // Switch to manual tab after extraction for verification
  };
  
  // Group parameters by category and filter essential ones for manual entry
  const manualParameters = formData.parameters.filter(p => ESSENTIAL_PARAMETERS.includes(p.id));
  const allParametersByCategory = {
    primary: formData.parameters.filter(p => p.category === 'Primary'),
    secondary: formData.parameters.filter(p => p.category === 'Secondary'),
    differential: formData.parameters.filter(p => p.category === 'Differential')
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="manual">
            {language === "en" ? "Manual Entry" : "دستی اندراج"}
          </TabsTrigger>
          <TabsTrigger value="upload">
            {language === "en" ? "Upload Report" : "رپورٹ اپلوڈ کریں"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-4">
          <PDFUploader 
            language={language} 
            parameters={formData.parameters} 
            onExtracted={handleExtractedData} 
          />
        </TabsContent>
        
        <TabsContent value="manual" className="mt-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                {language === "en" ? "CBC Report Details" : "سی بی سی رپورٹ کی تفصیلات"}
              </CardTitle>
              <CardDescription>
                {language === "en" 
                  ? "Enter essential CBC parameters for analysis" 
                  : "تجزیہ کے لیے ضروری سی بی سی پیرامیٹرز درج کریں"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">
                      {language === "en" ? "Patient Name" : "مریض کا نام"}
                    </Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                      placeholder={language === "en" ? "Enter name" : "نام درج کریں"}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patientAge">
                      {language === "en" ? "Patient Age" : "مریض کی عمر"}
                    </Label>
                    <Input
                      id="patientAge"
                      type="number"
                      min="0"
                      value={formData.patientAge || ""}
                      onChange={(e) => setFormData({...formData, patientAge: parseInt(e.target.value) || 0})}
                      placeholder={language === "en" ? "Enter age" : "عمر درج کریں"}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>
                      {language === "en" ? "Patient Gender" : "مریض کا جنس"}
                    </Label>
                    <RadioGroup
                      value={formData.patientGender}
                      onValueChange={(value) => setFormData({...formData, patientGender: value as 'male' | 'female'})}
                      className="mt-2 flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">{language === "en" ? "Male" : "مرد"}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">{language === "en" ? "Female" : "عورت"}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    {language === "en" ? "Essential CBC Parameters" : "ضروری سی بی سی پیرامیٹرز"}
                  </h3>
                  <div className="space-y-4">
                    {manualParameters.map((param) => (
                      <div key={param.id} className="grid grid-cols-12 gap-4 items-center">
                        <Label className="col-span-6" htmlFor={param.id}>
                          {language === "en" ? param.nameEn : param.nameUr}
                        </Label>
                        <div className="col-span-4">
                          <Input
                            id={param.id}
                            type="text"
                            value={param.value}
                            onChange={(e) => handleParameterChange(param.id, e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div className="col-span-2 text-sm text-gray-500">
                          {param.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-medical-600 hover:bg-medical-700"
                  disabled={!formData.patientGender}
                >
                  {language === "en" ? "Analyze Report" : "رپورٹ کا تجزیہ کریں"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Only show all parameters view when data is loaded from PDF */}
      {activeTab === "manual" && formData.parameters.some(p => !ESSENTIAL_PARAMETERS.includes(p.id) && p.value !== "") && (
        <Card className="w-full mt-4">
          <CardHeader>
            <CardTitle>
              {language === "en" ? "Additional Parameters (From PDF)" : "اضافی پیرامیٹرز (پی ڈی ایف سے)"}
            </CardTitle>
            <CardDescription>
              {language === "en" 
                ? "These additional values were extracted from your PDF" 
                : "یہ اضافی قدریں آپ کے پی ڈی ایف سے حاصل کی گئی ہیں"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Secondary Parameters */}
            {allParametersByCategory.secondary.some(p => p.value !== "") && (
              <div>
                <h3 className="text-lg font-medium mb-3">
                  {language === "en" ? "Secondary CBC Parameters" : "ثانوی سی بی سی پیرامیٹرز"}
                </h3>
                <div className="space-y-4">
                  {allParametersByCategory.secondary
                    .filter(p => p.value !== "")
                    .map((param) => (
                      <div key={param.id} className="grid grid-cols-12 gap-4 items-center">
                        <Label className="col-span-6" htmlFor={param.id}>
                          {language === "en" ? param.nameEn : param.nameUr}
                        </Label>
                        <div className="col-span-4">
                          <Input
                            id={param.id}
                            type="text"
                            value={param.value}
                            onChange={(e) => handleParameterChange(param.id, e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div className="col-span-2 text-sm text-gray-500">
                          {param.unit}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {/* Differential Count */}
            {allParametersByCategory.differential.some(p => p.value !== "") && (
              <div>
                <h3 className="text-lg font-medium mb-3">
                  {language === "en" ? "Differential WBC Count" : "ڈفرنشیل ڈبلیو بی سی کاؤنٹ"}
                </h3>
                <div className="space-y-4">
                  {allParametersByCategory.differential
                    .filter(p => p.value !== "")
                    .map((param) => (
                      <div key={param.id} className="grid grid-cols-12 gap-4 items-center">
                        <Label className="col-span-6" htmlFor={param.id}>
                          {language === "en" ? param.nameEn : param.nameUr}
                        </Label>
                        <div className="col-span-4">
                          <Input
                            id={param.id}
                            type="text"
                            value={param.value}
                            onChange={(e) => handleParameterChange(param.id, e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div className="col-span-2 text-sm text-gray-500">
                          {param.unit}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CBCForm;
