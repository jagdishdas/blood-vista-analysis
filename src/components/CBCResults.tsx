
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CBCAnalysis, CBCResult } from "@/types/cbc.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

interface CBCResultsProps {
  analysis: CBCAnalysis;
  language: string;
}

const ResultStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "normal":
      return <CheckCircle className="h-5 w-5 text-normal" />;
    case "low":
      return <AlertTriangle className="h-5 w-5 text-borderline" />;
    case "high":
      return <AlertCircle className="h-5 w-5 text-critical" />;
    default:
      return null;
  }
};

const CBCResults = ({ analysis, language }: CBCResultsProps) => {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysis]);

  // Prepare chart data
  const chartData = analysis.results.map((result) => {
    const value = parseFloat(result.parameter.value);
    const { min, max } = result.parameter.referenceRange;
    
    return {
      name: language === "en" ? result.parameter.nameEn : result.parameter.nameUr,
      value,
      min,
      max,
    };
  });

  return (
    <div ref={resultRef} className="w-full mt-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "CBC Report Analysis" : "سی بی سی رپورٹ کا تجزیہ"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Alert */}
          <Alert className={`${analysis.results.some(r => r.status !== "normal") ? "bg-medical-50" : "bg-green-50"}`}>
            <AlertTitle className="font-semibold">
              {language === "en" ? "Summary" : "خلاصہ"}
            </AlertTitle>
            <AlertDescription className={language === "ur" ? "font-urdu text-right" : ""}>
              {language === "en" 
                ? analysis.summary.en
                : analysis.summary.ur}
            </AlertDescription>
          </Alert>

          {/* Chart Visualization */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium mb-4">
              {language === "en" ? "Parameter Visualization" : "پیرامیٹر کا تجسیم"}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={60} 
                    tick={{ fontSize: 12 }} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const item = props.payload;
                      return [
                        `${value} (Range: ${item.min}-${item.max})`,
                        name
                      ];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                  {chartData.map((item, index) => (
                    <ReferenceLine
                      key={`ref-min-${index}`}
                      y={item.min}
                      stroke="#16a34a"
                      strokeDasharray="3 3"
                      segment={[{ x: index, y: item.min }, { x: index + 1, y: item.min }]}
                    />
                  ))}
                  {chartData.map((item, index) => (
                    <ReferenceLine
                      key={`ref-max-${index}`}
                      y={item.max}
                      stroke="#dc2626"
                      strokeDasharray="3 3"
                      segment={[{ x: index, y: item.max }, { x: index + 1, y: item.max }]}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {language === "en" ? "Detailed Parameter Analysis" : "پیرامیٹر کا تفصیلی تجزیہ"}
            </h3>
            
            {analysis.results.map((result) => (
              <div 
                key={result.parameter.id} 
                className={`p-4 rounded-lg border ${
                  result.status === "normal" 
                    ? "border-green-200 bg-green-50" 
                    : result.status === "low" 
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <ResultStatusIcon status={result.status} />
                    <div>
                      <h4 className="font-medium">
                        {language === "en" ? result.parameter.nameEn : result.parameter.nameUr}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {result.parameter.value} {result.parameter.unit} 
                        <span className="text-gray-500 ml-1">
                          (
                          {language === "en" ? "Reference: " : "حوالہ: "}
                          {result.parameter.referenceRange.min}-{result.parameter.referenceRange.max} {result.parameter.unit}
                          )
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    result.status === "normal" 
                      ? "text-green-700" 
                      : result.status === "low" 
                      ? "text-yellow-700"
                      : "text-red-700"
                  }`}>
                    {language === "en" 
                      ? result.status.charAt(0).toUpperCase() + result.status.slice(1) 
                      : result.status === "normal" 
                      ? "معمول کے مطابق"
                      : result.status === "low" 
                      ? "کم"
                      : "زیادہ"}
                    {result.status !== "normal" && (
                      <span className="ml-1">
                        ({result.deviation > 0 ? "+" : ""}{result.deviation.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                <p className={`mt-2 text-sm ${language === "ur" ? "font-urdu text-right" : ""}`}>
                  {language === "en" ? result.interpretation.en : result.interpretation.ur}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CBCResults;
