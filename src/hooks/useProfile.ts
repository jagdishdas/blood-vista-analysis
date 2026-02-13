/**
 * PROFILE MANAGEMENT HOOK
 * React hook for user profile operations
 */

import { useState, useEffect } from 'react';
import {
    getUserProfile,
    createUserProfile,
    updateUserProfile,
    hasCompletedProfile,
    getUserMedicalContext
} from '@/services/profileService';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            setIsLoading(true);
            const data = await getUserProfile();
            setProfile(data);

            const complete = await hasCompletedProfile();
            setProfileComplete(complete);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    }

    async function createProfile(profileData: ProfileInsert) {
        try {
            setError(null);
            const newProfile = await createUserProfile(profileData);
            setProfile(newProfile);
            setProfileComplete(true);
            return newProfile;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create profile';
            setError(message);
            throw new Error(message);
        }
    }

    async function updateProfile(updates: ProfileUpdate) {
        try {
            setError(null);
            const updated = await updateUserProfile(updates);
            setProfile(updated);
            return updated;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update profile';
            setError(message);
            throw new Error(message);
        }
    }

    async function getMedicalContext() {
        try {
            return await getUserMedicalContext();
        } catch (err) {
            console.error('Error getting medical context:', err);
            return null;
        }
    }

    return {
        profile,
        isLoading,
        error,
        profileComplete,
        createProfile,
        updateProfile,
        refreshProfile: loadProfile,
        getMedicalContext
    };
}
