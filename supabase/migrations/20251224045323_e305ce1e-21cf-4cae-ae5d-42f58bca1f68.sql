-- Create radiology_scans table for storing scan metadata and results
CREATE TABLE public.radiology_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('xray', 'ct', 'mri')),
  file_name TEXT NOT NULL,
  file_url TEXT,
  analysis_summary TEXT,
  findings JSONB,
  confidence_score NUMERIC(5,4),
  ai_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.radiology_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (only scan owner can access)
CREATE POLICY "Users can view their own scans" 
ON public.radiology_scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans" 
ON public.radiology_scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" 
ON public.radiology_scans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans" 
ON public.radiology_scans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for radiology images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('radiology-scans', 'radiology-scans', false);

-- Storage policies for radiology scans bucket
CREATE POLICY "Users can upload their own radiology scans"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'radiology-scans' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own radiology scans"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'radiology-scans' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own radiology scans"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'radiology-scans' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_radiology_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_radiology_scans_updated_at
BEFORE UPDATE ON public.radiology_scans
FOR EACH ROW
EXECUTE FUNCTION public.update_radiology_updated_at();