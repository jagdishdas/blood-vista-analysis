/**
 * PROFILE ONBOARDING COMPONENT
 * Collect user's medical context on first login
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

export function ProfileOnboarding() {
    const { createProfile } = useProfile();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        sex: 'male' as 'male' | 'female' | 'other',
        pregnancyStatus: false,
        pregnancyTrimester: null as number | null,
        chronicConditions: [] as string[],
        allergies: [] as string[],
        currentMedications: [] as string[]
    });

    const [conditionInput, setConditionInput] = useState('');
    const [allergyInput, setAllergyInput] = useState('');
    const [medicationInput, setMedicationInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            await createProfile({
                full_name: formData.fullName,
                date_of_birth: formData.dateOfBirth,
                sex: formData.sex,
                pregnancy_status: formData.pregnancyStatus,
                pregnancy_trimester: formData.pregnancyTrimester,
                chronic_conditions: formData.chronicConditions,
                allergies: formData.allergies,
                current_medications: formData.currentMedications
            });

            // Navigate to home after profile creation
            navigate('/');
        } catch (error) {
            console.error('Error creating profile:', error);
            alert('Failed to create profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addCondition = () => {
        if (conditionInput.trim()) {
            setFormData(prev => ({
                ...prev,
                chronicConditions: [...prev.chronicConditions, conditionInput.trim()]
            }));
            setConditionInput('');
        }
    };

    const addAllergy = () => {
        if (allergyInput.trim()) {
            setFormData(prev => ({
                ...prev,
                allergies: [...prev.allergies, allergyInput.trim()]
            }));
            setAllergyInput('');
        }
    };

    const addMedication = () => {
        if (medicationInput.trim()) {
            setFormData(prev => ({
                ...prev,
                currentMedications: [...prev.currentMedications, medicationInput.trim()]
            }));
            setMedicationInput('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to BloodVista ✨</CardTitle>
                    <CardDescription>
                        Let's set up your health profile for personalized blood test analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Basic Information</h3>

                            <div>
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="dob">Date of Birth *</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    required
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label>Sex *</Label>
                                <div className="flex gap-4 mt-2">
                                    {['male', 'female', 'other'].map((sex) => (
                                        <label key={sex} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sex"
                                                value={sex}
                                                checked={formData.sex === sex}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    sex: e.target.value as 'male' | 'female' | 'other'
                                                }))}
                                                className="cursor-pointer"
                                            />
                                            <span className="capitalize">{sex}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {formData.sex === 'female' && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="pregnancy"
                                        checked={formData.pregnancyStatus}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({ ...prev, pregnancyStatus: checked as boolean }))
                                        }
                                    />
                                    <Label htmlFor="pregnancy">Currently Pregnant</Label>
                                </div>
                            )}

                            {formData.pregnancyStatus && (
                                <div>
                                    <Label htmlFor="trimester">Trimester</Label>
                                    <Input
                                        id="trimester"
                                        type="number"
                                        min="1"
                                        max="3"
                                        value={formData.pregnancyTrimester || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            pregnancyTrimester: parseInt(e.target.value) || null
                                        }))}
                                        placeholder="1, 2, or 3"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Medical History (Optional) */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Medical History (Optional)</h3>

                            <div>
                                <Label>Chronic Conditions</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={conditionInput}
                                        onChange={(e) => setConditionInput(e.target.value)}
                                        placeholder="e.g., Diabetes, Hypertension"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                                    />
                                    <Button type="button" onClick={addCondition}>Add</Button>
                                </div>
                                {formData.chronicConditions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.chronicConditions.map((condition, idx) => (
                                            <span key={idx} className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                                                {condition}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        chronicConditions: prev.chronicConditions.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="ml-2 text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Current Medications</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={medicationInput}
                                        onChange={(e) => setMedicationInput(e.target.value)}
                                        placeholder="e.g., Metformin, Aspirin"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                                    />
                                    <Button type="button" onClick={addMedication}>Add</Button>
                                </div>
                                {formData.currentMedications.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.currentMedications.map((med, idx) => (
                                            <span key={idx} className="bg-green-100 px-3 py-1 rounded-full text-sm">
                                                {med}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        currentMedications: prev.currentMedications.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="ml-2 text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
