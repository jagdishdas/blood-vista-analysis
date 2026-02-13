-- BloodVista Database Schema Migration
-- This migration creates tables for longitudinal health data tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  pregnancy_status BOOLEAN DEFAULT FALSE,
  pregnancy_trimester INTEGER CHECK (pregnancy_trimester BETWEEN 1 AND 3),
  
  -- Medical context
  chronic_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  current_medications TEXT[] DEFAULT '{}',
  
  -- Family history (JSONB for flexibility)
  family_history JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOOD TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blood_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Test metadata
  test_type TEXT NOT NULL CHECK (test_type IN (
    'cbc', 'lipid', 'glucose', 'thyroid', 'liver', 'kidney', 
    'cardiac', 'inflammatory', 'electrolytes', 'vitamins', 
    'hormonal', 'tumor', 'autoimmune', 'coagulation'
  )),
  test_date DATE NOT NULL,
  lab_name TEXT,
  
  -- Overall analysis
  overall_risk TEXT CHECK (overall_risk IN ('low', 'moderate', 'high', 'critical')),
  has_critical_values BOOLEAN DEFAULT FALSE,
  
  -- Summary (bilingual)
  summary_en TEXT,
  summary_ur TEXT,
  
  -- Relationship flags (e.g., anemia pattern detected)
  relationship_flags TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEST PARAMETERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS test_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES blood_tests(id) ON DELETE CASCADE,
  
  -- Parameter identification
  parameter_id TEXT NOT NULL, -- e.g., 'hemoglobin', 'wbc'
  parameter_name_en TEXT NOT NULL,
  parameter_name_ur TEXT,
  
  -- Measured value
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  
  -- Reference range
  ref_min NUMERIC NOT NULL,
  ref_max NUMERIC NOT NULL,
  
  -- Validated status
  status TEXT NOT NULL CHECK (status IN (
    'NORMAL', 'LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH'
  )),
  deviation NUMERIC, -- Percentage deviation
  
  -- Risk and flags
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  flags TEXT[] DEFAULT '{}', -- e.g., ['CRITICAL', 'URGENT']
  
  -- Interpretation (bilingual)
  interpretation_en TEXT,
  interpretation_ur TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAMILY PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS family_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Family member info
  relationship TEXT NOT NULL, -- e.g., 'mother', 'father', 'sibling'
  name TEXT,
  
  -- Health conditions
  conditions TEXT[] DEFAULT '{}',
  genetic_traits TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TREND SNAPSHOTS TABLE (For quick trend analysis)
-- ============================================
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parameter_id TEXT NOT NULL,
  
  -- Trend data
  current_value NUMERIC NOT NULL,
  previous_value NUMERIC,
  percent_change NUMERIC,
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'worsening')),
  
  -- Time period
  current_date DATE NOT NULL,
  previous_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_blood_tests_user_date ON blood_tests(user_id, test_date DESC);
CREATE INDEX idx_test_parameters_test ON test_parameters(test_id);
CREATE INDEX idx_test_parameters_param ON test_parameters(parameter_id);
CREATE INDEX idx_family_profiles_user ON family_profiles(user_id);
CREATE INDEX idx_trend_snapshots_user_param ON trend_snapshots(user_id, parameter_id);

-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Blood tests policies
CREATE POLICY "Users can view their own blood tests"
  ON blood_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blood tests"
  ON blood_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blood tests"
  ON blood_tests FOR UPDATE
  USING (auth.uid() = user_id);

-- Test parameters policies
CREATE POLICY "Users can view their own test parameters"
  ON test_parameters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM blood_tests
      WHERE blood_tests.id = test_parameters.test_id
      AND blood_tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own test parameters"
  ON test_parameters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blood_tests
      WHERE blood_tests.id = test_parameters.test_id
      AND blood_tests.user_id = auth.uid()
    )
  );

-- Family profiles policies
CREATE POLICY "Users can manage their own family profiles"
  ON family_profiles FOR ALL
  USING (auth.uid() = user_id);

-- Trend snapshots policies
CREATE POLICY "Users can view their own trend snapshots"
  ON trend_snapshots FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blood_tests_updated_at
  BEFORE UPDATE ON blood_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_profiles_updated_at
  BEFORE UPDATE ON family_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR TREND ANALYSIS
-- ============================================
CREATE OR REPLACE FUNCTION calculate_trend(
  p_user_id UUID,
  p_parameter_id TEXT,
  p_current_value NUMERIC,
  p_current_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_previous_value NUMERIC;
  v_previous_date DATE;
  v_percent_change NUMERIC;
  v_direction TEXT;
BEGIN
  -- Get most recent previous value
  SELECT tp.value, bt.test_date
  INTO v_previous_value, v_previous_date
  FROM test_parameters tp
  JOIN blood_tests bt ON tp.test_id = bt.id
  WHERE bt.user_id = p_user_id
    AND tp.parameter_id = p_parameter_id
    AND bt.test_date < p_current_date
  ORDER BY bt.test_date DESC
  LIMIT 1;
  
  -- Calculate if previous exists
  IF v_previous_value IS NOT NULL THEN
    v_percent_change := ((p_current_value - v_previous_value) / v_previous_value) * 100;
    
    -- Determine direction
    IF ABS(v_percent_change) < 5 THEN
      v_direction := 'stable';
    ELSIF v_percent_change > 0 THEN
      v_direction := 'improving'; -- This is context-dependent
    ELSE
      v_direction := 'worsening';
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'previous_value', v_previous_value,
    'previous_date', v_previous_date,
    'percent_change', v_percent_change,
    'direction', v_direction
  );
END;
$$ LANGUAGE plpgsql;
