import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Scan, Brain, FileCheck } from 'lucide-react';

interface RadiologyAnalyzerProps {
  stage: 'uploading' | 'processing' | 'analyzing';
  progress: number;
}

export function RadiologyAnalyzer({ stage, progress }: RadiologyAnalyzerProps) {
  const stages = [
    { 
      key: 'uploading', 
      label: 'Preparing Image', 
      description: 'Compressing and anonymizing your scan...',
      icon: Scan 
    },
    { 
      key: 'processing', 
      label: 'Processing', 
      description: 'Sending to AI analysis engine...',
      icon: Brain 
    },
    { 
      key: 'analyzing', 
      label: 'Analyzing', 
      description: 'AI is examining your scan for findings...',
      icon: FileCheck 
    },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === stage);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 text-center">{Math.round(progress)}% complete</p>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-between">
            {stages.map((s, index) => {
              const Icon = s.icon;
              const isActive = index === currentStageIndex;
              const isComplete = index < currentStageIndex;
              
              return (
                <div 
                  key={s.key}
                  className={`flex flex-col items-center text-center flex-1 ${
                    isActive ? 'text-medical-600' : isComplete ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${isActive ? 'bg-medical-100 animate-pulse' : isComplete ? 'bg-green-100' : 'bg-gray-100'}
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Current Stage Description */}
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-medical-100 mb-4">
                {stage === 'uploading' && <Scan className="h-10 w-10 text-medical-600" />}
                {stage === 'processing' && <Brain className="h-10 w-10 text-medical-600" />}
                {stage === 'analyzing' && <FileCheck className="h-10 w-10 text-medical-600" />}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {stages[currentStageIndex]?.label}
            </h3>
            <p className="text-gray-500 mt-1">
              {stages[currentStageIndex]?.description}
            </p>
          </div>

          {/* AI Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Important:</strong> AI analysis is for informational purposes only 
              and does not constitute medical advice. Always consult a qualified healthcare 
              professional for diagnosis and treatment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
