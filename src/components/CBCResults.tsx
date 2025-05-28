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
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  FileText, 
  Share2, 
  Download,
  Printer,
  Eye
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CBCSummaryCard from "./CBCSummaryCard";

interface CBCResultsProps {
  analysis: CBCAnalysis;
  language: string;
}

const ResultStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "normal":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "low":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "high":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
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
      name: result.parameter.id.toUpperCase(),
      displayName: language === "en" ? result.parameter.nameEn : result.parameter.nameUr,
      value,
      min,
      max,
      deviation: result.deviation,
      status: result.status
    };
  });

  // Create dataset for deviation chart
  const deviationData = chartData.map(item => ({
    name: item.name,
    displayName: item.displayName,
    deviation: item.deviation,
    status: item.status
  }));

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#16a34a';  // green
      case 'low': return '#eab308';     // amber
      case 'high': return '#dc2626';    // red
      default: return '#64748b';        // gray
    }
  };

  // Group results by category
  const categorizedResults = {
    primary: analysis.results.filter(r => r.parameter.category === 'Primary'),
    secondary: analysis.results.filter(r => r.parameter.category === 'Secondary'),
    differential: analysis.results.filter(r => r.parameter.category === 'Differential')
  };
  
  // Count abnormal results
  const abnormalResults = analysis.results.filter(r => r.status !== 'normal');
  
  // Handle mock print function
  const handlePrint = () => {
    window.print();
  };
  
  // Handle mock export function
  const handleExport = () => {
    alert(language === 'en' 
      ? 'This feature will export the results as a PDF document.'
      : 'یہ خصوصیت نتائج کو PDF دستاویز کے طور پر برآمد کرے گی۔');
  };
  
  // Handle mock share function
  const handleShare = () => {
    alert(language === 'en'
      ? 'This feature will allow sharing results via email or messaging.'
      : 'یہ خصوصیت ای میل یا پیغام رسانی کے ذریعے نتائج کا اشتراک کرنے کی اجازت دے گی۔');
  };

  return (
    <div ref={resultRef} className="w-full mt-8 space-y-6 print:mt-0">
      <div className="print:hidden flex justify-end space-x-2 mb-4">
        <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center">
          <Printer className="mr-2 h-4 w-4" />
          {language === "en" ? "Print" : "پرنٹ کریں"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          {language === "en" ? "Export" : "برآمد کریں"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center">
          <Share2 className="mr-2 h-4 w-4" />
          {language === "en" ? "Share" : "شیئر کریں"}
        </Button>
      </div>
      
      <Card className="print:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle>
            {language === "en" ? "CBC Report Analysis" : "سی بی سی رپورٹ کا تجزیہ"}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabbed View for Easy Understanding */}
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple" className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                {language === "en" ? "Simple View" : "آسان منظر"}
              </TabsTrigger>
              <TabsTrigger value="charts">
                {language === "en" ? "Charts" : "چارٹس"}
              </TabsTrigger>
              <TabsTrigger value="detailed">
                {language === "en" ? "Detailed" : "تفصیلی"}
              </TabsTrigger>
            </TabsList>

            {/* Simple User-Friendly View */}
            <TabsContent value="simple" className="space-y-4">
              <CBCSummaryCard analysis={analysis} language={language} />
            </TabsContent>

            {/* Charts View */}
            <TabsContent value="charts" className="space-y-6">
              {/* Summary Alert */}
              <Alert className={`${abnormalResults.length > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                <AlertTitle className="font-semibold">
                  {language === "en" ? "Summary / خلاصہ" : "خلاصہ / Summary"}
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{analysis.summary.en}</p>
                  <p className="font-urdu text-right">{analysis.summary.ur}</p>
                </AlertDescription>
              </Alert>

              {/* Key Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`shadow-sm border ${abnormalResults.length === 0 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{language === "en" ? "Parameters" : "پیرامیٹرز"}</h3>
                      <span className="text-2xl font-bold">{analysis.results.length}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {language === "en" 
                        ? "Total parameters analyzed" 
                        : "کل تجزیہ شدہ پیرامیٹرز"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{language === "en" ? "Abnormal" : "غیر معمولی"}</h3>
                      <span className="text-2xl font-bold">{abnormalResults.length}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {language === "en" 
                        ? "Parameters outside normal range" 
                        : "معمول کی حد سے باہر پیرامیٹرز"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{language === "en" ? "Deviation" : "انحراف"}</h3>
                      <span className="text-2xl font-bold">
                        {abnormalResults.length > 0 
                          ? `${Math.abs(Math.round(abnormalResults.reduce((max, r) => 
                              Math.abs(r.deviation) > Math.abs(max) ? r.deviation : max, 0)))}%` 
                          : "0%"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {language === "en" 
                        ? "Maximum parameter deviation" 
                        : "زیادہ سے زیادہ پیرامیٹر انحراف"}
                    </p>
                  </CardContent>
                </Card>
              </div>

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
                        formatter={(value: any, name, props) => {
                          const item = props.payload;
                          return [
                            `${value} ${item.min && item.max ? `(Range: ${item.min}-${item.max})` : ''}`,
                            item.displayName
                          ];
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0284c7"
                        strokeWidth={2}
                        dot={({ cx, cy, payload }) => (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={6} 
                            fill={getStatusColor(payload.status)} 
                            stroke="white" 
                            strokeWidth={2}
                          />
                        )}
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
              
              {/* Deviation Chart */}
              {abnormalResults.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-4">
                    {language === "en" ? "Parameter Deviation Analysis" : "پیرامیٹر انحراف کا تجزیہ"}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={deviationData.filter(d => d.status !== 'normal')}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={60} 
                          tick={{ fontSize: 12 }} 
                        />
                        <YAxis 
                          label={{ 
                            value: language === "en" ? 'Deviation (%)' : 'انحراف (%)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                          }} 
                        />
                        <Tooltip 
                          formatter={(value: number, name, props) => {
                            const item = props.payload;
                            return [
                              `${value.toFixed(1)}% ${value > 0 ? 'above' : 'below'} normal range`,
                              item.displayName
                            ];
                          }}
                        />
                        <Bar dataKey="deviation" name={language === "en" ? "Deviation" : "انحراف"}>
                          {deviationData
                            .filter(d => d.status !== 'normal')
                            .map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                            ))}
                        </Bar>
                        <Legend />
                        <ReferenceLine y={0} stroke="#000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Table View for Results */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "CBC Results Table" : "سی بی سی نتائج کا ٹیبل"}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
                          {language === "en" ? "Parameter" : "پیرامیٹر"}
                        </TableHead>
                        <TableHead className="text-right">
                          {language === "en" ? "Value" : "قدر"}
                        </TableHead>
                        <TableHead className="text-right">
                          {language === "en" ? "Reference Range" : "حوالہ رینج"}
                        </TableHead>
                        <TableHead className="text-right">
                          {language === "en" ? "Status" : "حالت"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysis.results.map((result) => (
                        <TableRow key={result.parameter.id}>
                          <TableCell className="font-medium">
                            {language === "en" ? result.parameter.nameEn : result.parameter.nameUr}
                          </TableCell>
                          <TableCell className="text-right">
                            {result.parameter.value} {result.parameter.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {result.parameter.referenceRange.min} - {result.parameter.referenceRange.max} {result.parameter.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className={`
                                ${result.status === "normal" ? "text-green-700" : 
                                  result.status === "low" ? "text-amber-700" : "text-red-700"}
                              `}>
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
                              </span>
                              <ResultStatusIcon status={result.status} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Detailed Results */}
            <TabsContent value="detailed" className="space-y-4">
              {/* Summary Alert - Always show both languages */}
              <Alert className={`${abnormalResults.length > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                <AlertTitle className="font-semibold">
                  {language === "en" ? "Summary / خلاصہ" : "خلاصہ / Summary"}
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{analysis.summary.en}</p>
                  <p className="font-urdu text-right">{analysis.summary.ur}</p>
                </AlertDescription>
              </Alert>

              {/* Key Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`shadow-sm border ${abnormalResults.length === 0 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{language === "en" ? "Parameters" : "پیرامیٹرز"}</h3>
                      <span className="text-2xl font-bold">{analysis.results.length}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {language === "en" 
                        ? "Total parameters analyzed" 
                        : "کل تجزیہ شدہ پیرامیٹرز"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{language === "en" ? "Abnormal" : "غیر معمولی"}</h3>
                      <span className="text-2xl font-bold">{abnormalResults.length}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {language === "en" 
                        ? "Parameters outside normal range" 
                        : "معمول کی حد سے باہر پیرامیٹرز"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{language === "en" ? "Deviation" : "انحراف"}</h3>
                      <span className="text-2xl font-bold">
                        {abnormalResults.length > 0 
                          ? `${Math.abs(Math.round(abnormalResults.reduce((max, r) => 
                              Math.abs(r.deviation) > Math.abs(max) ? r.deviation : max, 0)))}%` 
                          : "0%"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {language === "en" 
                        ? "Maximum parameter deviation" 
                        : "زیادہ سے زیادہ پیرامیٹر انحراف"}
                    </p>
                  </CardContent>
                </Card>
              </div>

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
                        formatter={(value: any, name, props) => {
                          const item = props.payload;
                          return [
                            `${value} ${item.min && item.max ? `(Range: ${item.min}-${item.max})` : ''}`,
                            item.displayName
                          ];
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0284c7"
                        strokeWidth={2}
                        dot={({ cx, cy, payload }) => (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={6} 
                            fill={getStatusColor(payload.status)} 
                            stroke="white" 
                            strokeWidth={2}
                          />
                        )}
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
              
              {/* Deviation Chart */}
              {abnormalResults.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-4">
                    {language === "en" ? "Parameter Deviation Analysis" : "پیرامیٹر انحراف کا تجزیہ"}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={deviationData.filter(d => d.status !== 'normal')}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={60} 
                          tick={{ fontSize: 12 }} 
                        />
                        <YAxis 
                          label={{ 
                            value: language === "en" ? 'Deviation (%)' : 'انحراف (%)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                          }} 
                        />
                        <Tooltip 
                          formatter={(value: number, name, props) => {
                            const item = props.payload;
                            return [
                              `${value.toFixed(1)}% ${value > 0 ? 'above' : 'below'} normal range`,
                              item.displayName
                            ];
                          }}
                        />
                        <Bar dataKey="deviation" name={language === "en" ? "Deviation" : "انحراف"}>
                          {deviationData
                            .filter(d => d.status !== 'normal')
                            .map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                            ))}
                        </Bar>
                        <Legend />
                        <ReferenceLine y={0} stroke="#000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {/* Table View for Results */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium">
                    {language === "en" ? "CBC Results Table" : "سی بی سی نتائج کا ٹیبل"}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
                          {language === "en" ? "Parameter" : "پیرامیٹر"}
                        </TableHead>
                        <TableHead className="text-right">
                          {language === "en" ? "Value" : "قدر"}
                        </TableHead>
                        <TableHead className="text-right">
                          {language === "en" ? "Reference Range" : "حوالہ رینج"}
                        </TableHead>
                        <TableHead className="text-right">
                          {language === "en" ? "Status" : "حالت"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysis.results.map((result) => (
                        <TableRow key={result.parameter.id}>
                          <TableCell className="font-medium">
                            {language === "en" ? result.parameter.nameEn : result.parameter.nameUr}
                          </TableCell>
                          <TableCell className="text-right">
                            {result.parameter.value} {result.parameter.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {result.parameter.referenceRange.min} - {result.parameter.referenceRange.max} {result.parameter.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className={`
                                ${result.status === "normal" ? "text-green-700" : 
                                  result.status === "low" ? "text-amber-700" : "text-red-700"}
                              `}>
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
                              </span>
                              <ResultStatusIcon status={result.status} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Detailed Results - Show both languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {language === "en" ? "Detailed Analysis" : "تفصیلی تجزیہ"}
                </h3>
                
                {/* Primary Parameters */}
                {categorizedResults.primary.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-700">
                      {language === "en" ? "Primary Parameters" : "بنیادی پیرامیٹرز"}
                    </h4>
                    {categorizedResults.primary.map((result) => (
                      <div 
                        key={result.parameter.id} 
                        className={`p-4 rounded-lg border ${
                          result.status === "normal" 
                            ? "border-green-200 bg-green-50" 
                            : result.status === "low" 
                            ? "border-amber-200 bg-amber-50"
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
                              ? "text-amber-700"
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
                        {/* Show both languages for interpretation */}
                        <div className="mt-2 space-y-2 text-sm">
                          <p>{result.interpretation.en}</p>
                          <p className="font-urdu text-right">{result.interpretation.ur}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Secondary Parameters */}
                {categorizedResults.secondary.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-700">
                      {language === "en" ? "Secondary Parameters" : "ثانوی پیرامیٹرز"}
                    </h4>
                    {categorizedResults.secondary.map((result) => (
                      <div 
                        key={result.parameter.id} 
                        className={`p-4 rounded-lg border ${
                          result.status === "normal" 
                            ? "border-green-200 bg-green-50" 
                            : result.status === "low" 
                            ? "border-amber-200 bg-amber-50"
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
                              ? "text-amber-700"
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
                        {/* Show both languages for interpretation */}
                        <div className="mt-2 space-y-2 text-sm">
                          <p>{result.interpretation.en}</p>
                          <p className="font-urdu text-right">{result.interpretation.ur}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Differential WBC Count */}
                {categorizedResults.differential.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-700">
                      {language === "en" ? "Differential WBC Count" : "ڈفرنشیل ڈبلیو بی سی کاؤنٹ"}
                    </h4>
                    {categorizedResults.differential.map((result) => (
                      <div 
                        key={result.parameter.id} 
                        className={`p-4 rounded-lg border ${
                          result.status === "normal" 
                            ? "border-green-200 bg-green-50" 
                            : result.status === "low" 
                            ? "border-amber-200 bg-amber-50"
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
                              ? "text-amber-700"
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
                        {/* Show both languages for interpretation */}
                        <div className="mt-2 space-y-2 text-sm">
                          <p>{result.interpretation.en}</p>
                          <p className="font-urdu text-right">{result.interpretation.ur}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Disclaimer - Show both languages */}
          <Alert className="bg-gray-50 border-gray-200">
            <AlertTitle className="font-semibold">
              {language === "en" ? "Medical Disclaimer / طبی انتباہ" : "طبی انتباہ / Medical Disclaimer"}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>This analysis is for informational purposes only and does not constitute medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.</p>
              <p className="font-urdu text-right">یہ تجزیہ صرف معلوماتی مقاصد کے لیے ہے اور یہ طبی مشورہ نہیں ہے۔ مناسب تشخیص اور علاج کے لیے براہ کرم کسی ہیلتھ کیئر فراہم کنندہ سے مشورہ کریں۔</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default CBCResults;
