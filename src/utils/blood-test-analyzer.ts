/**
 * BLOOD TEST ANALYZER - Refactored to use Medical-Grade Validation Engine
 * This file now uses the centralized validation engine and content layer.
 */

import { BloodTestFormData, BloodTestAnalysis } from '@/types/blood-test.types';
import { analyzeBloodTest as analyzeBloodTestCore } from "@/medical-core/analyzer-adapter";

/**
 * Main analyzer function - now delegates to the medical-grade engine
 */
export const analyzeBloodTest = analyzeBloodTestCore;
