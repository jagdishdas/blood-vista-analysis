/**
 * CBC ANALYZER - Refactored to use Medical-Grade Validation Engine
 * This file now uses the centralized validation engine and content layer.
 */

import { CBCFormData, CBCAnalysis } from "../types/cbc.types";
import { analyzeCBC as analyzeCBCCore } from "@/medical-core/analyzer-adapter";

/**
 * Main analyzer function - now delegates to the medical-grade engine
 */
export const analyzeCBC = analyzeCBCCore;
