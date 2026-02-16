import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ObjectUploader } from '@/components/ui/ObjectUploader';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera, X, Save, User } from 'lucide-react';
import type { UploadResult } from '@uppy/core';

const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  avatar: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.avatar || null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    },
  });

  // Fetch current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update profile photo mutation
  const updatePhotoMutation = useMutation({
    mutationFn: async (photoURL: string) => {
      return apiRequest('/api/photos/avatar', {
        method: 'PUT',
        body: JSON.stringify({ photoURL }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setPhotoUrl(data.avatar);
      form.setValue('avatar', data.avatar);
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Photo Update Failed",
        description: error.message || "Failed to update photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      const profileData = profile as any; // Type assertion since useQuery returns unknown
      form.reset({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        avatar: profileData.avatar || '',
      });
      setPhotoUrl(profileData.avatar || null);
    }
  }, [profile, form]);

  const handleSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest('/api/photos/upload', {
        method: 'POST',
      });
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handlePhotoUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = (uploadedFile as any).uploadURL;
      
      if (uploadURL) {
        updatePhotoMutation.mutate(uploadURL);
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    form.setValue('avatar', '');
    updatePhotoMutation.mutate('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-profile-title">
            User Profile
          </h1>
          <p className="text-gray-600">Manage your account settings and profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {photoUrl ? (
                <div className="relative inline-block">
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="h-40 w-40 rounded-full object-cover border-4 border-gray-200 mx-auto"
                    data-testid="img-profile-photo"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemovePhoto}
                    disabled={updatePhotoMutation.isPending}
                    data-testid="button-remove-photo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={5242880} // 5MB
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handlePhotoUploadComplete}
                buttonClassName="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                {photoUrl ? 'Change Photo' : 'Upload Photo'}
              </ObjectUploader>
              
              <p className="text-sm text-gray-500">
                Upload a profile photo. Max size: 5MB
              </p>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter first name" 
                              {...field} 
                              data-testid="input-firstName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter last name" 
                              {...field} 
                              data-testid="input-lastName"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="your@email.com" 
                              {...field} 
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="1234567890" 
                              {...field} 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-2"
                      data-testid="button-save-profile"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}