
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
import { CBCFormData, CBCParameter } from "@/types/cbc.types";
import { getParameterReferenceRange } from "@/utils/cbc-reference-ranges";

interface CBCFormProps {
  language: string;
  onSubmit: (data: CBCFormData) => void;
}

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
      }
    ]
  });

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {language === "en" ? "CBC Report Details" : "سی بی سی رپورٹ کی تفصیلات"}
        </CardTitle>
        <CardDescription>
          {language === "en" 
            ? "Enter your CBC report parameters for analysis" 
            : "تجزیہ کے لیے اپنے سی بی سی رپورٹ کے پیرامیٹرز درج کریں"}
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
              {language === "en" ? "CBC Parameters" : "سی بی سی پیرامیٹرز"}
            </h3>
            <div className="space-y-4">
              {formData.parameters.map((param) => (
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
  );
};

export default CBCForm;
