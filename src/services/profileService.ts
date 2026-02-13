/**
 * USER PROFILE DATABASE SERVICE
 * Handles all database operations for user profiles
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Get current user's profile
 */
export async function getUserProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Profile doesn't exist yet
            return null;
        }
        console.error('Error fetching user profile:', error);
        throw error;
    }

    return data;
}

/**
 * Create user profile
 */
export async function createUserProfile(profile: ProfileInsert): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User must be authenticated to create profile');
    }

    const { data, error } = await supabase
        .from('profiles')
        .insert({
            ...profile,
            id: user.id
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }

    return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: ProfileUpdate): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User must be authenticated to update profile');
    }

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }

    return data;
}

/**
 * Calculate user's age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
}

/**
 * Check if user has completed their profile
 */
export async function hasCompletedProfile(): Promise<boolean> {
    const profile = await getUserProfile();

    if (!profile) {
        return false;
    }

    // Check required fields
    return !!(
        profile.date_of_birth &&
        profile.sex
    );
}

/**
 * Get user context for medical validation
 */
export async function getUserMedicalContext() {
    const profile = await getUserProfile();

    if (!profile) {
        return null;
    }

    const age = calculateAge(profile.date_of_birth);

    return {
        age,
        ageInMonths: profile.date_of_birth ? age * 12 : undefined,
        gender: profile.sex as 'male' | 'female',
        conditions: profile.chronic_conditions || [],
        isPregnant: profile.pregnancy_status,
        pregnancyTrimester: profile.pregnancy_trimester || undefined
    };
}
