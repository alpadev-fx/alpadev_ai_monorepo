'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Textarea } from '@heroui/react';
import { scheduleMeeting } from '../../actions/schedule-meeting';
import { format, addMinutes } from 'date-fns';

export default function BookingForm() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ meetLink: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple state for form for demo purposes. 
  // Ideally use react-hook-form for complex forms.
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    datetime: '', // Using type="datetime-local" for native picker
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.datetime) throw new Error("Please select a date and time");

      const startDate = new Date(formData.datetime);
      const endDate = addMinutes(startDate, 30); // Default 30 min slot

      const payload = {
        name: formData.name,
        email: formData.email,
        notes: formData.notes,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const result = await scheduleMeeting(payload);

      if (result.success && result.meetLink) {
        setSuccessData({ meetLink: result.meetLink });
      } else {
        setError(result.error || 'Failed to schedule meeting.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (successData) {
    return (
      <Card className="max-w-md mx-auto p-6 bg-content1 border-success border-2">
        <CardHeader className="flex flex-col gap-2 items-center">
            <h2 className="text-xl font-bold text-success-600">Meeting Scheduled!</h2>
        </CardHeader>
        <CardBody className="text-center gap-4">
            <p className="text-default-500">Your Google Meet link has been generated.</p>
            <div className="p-4 bg-default-100 rounded-lg break-all">
                <a href={successData.meetLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {successData.meetLink}
                </a>
            </div>
            <Button color="primary" variant="flat" onClick={() => { setSuccessData(null); setFormData({name: '', email: '', datetime: '', notes: ''}); }}>
                Book Another
            </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto p-4">
        <CardHeader>
            <h2 className="text-xl font-bold">Book a Video Call</h2>
        </CardHeader>
        <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input 
                    label="Name" 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    isDisabled={loading}
                />
                <Input 
                    label="Email" 
                    name="email"
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    isDisabled={loading}
                />
                
                {/* Native DateTime Picker for simplicity, can be replaced with HeroUI DatePicker if configured */}
                <Input
                    label="Date & Time"
                    type="datetime-local"
                    name="datetime"
                    value={formData.datetime}
                    onChange={handleChange}
                    required
                    isDisabled={loading}
                    placeholder="Select date"
                />

                <Textarea 
                    label="Notes" 
                    name="notes"
                    value={formData.notes} 
                    onChange={handleChange} 
                    isDisabled={loading}
                />

                {error && (
                    <div className="p-2 text-sm text-danger bg-danger-50 rounded">
                        {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    color="primary" 
                    isLoading={loading}
                    className="w-full"
                >
                    {loading ? 'Booking...' : 'Confirm Meeting'}
                </Button>
            </form>
        </CardBody>
    </Card>
  );
};
