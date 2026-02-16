import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../stores/auth';
import { useToast } from '../../hooks/useToast';
import { apiClient } from '../../lib/api-client';
import { profileSchema, type ProfileFormData } from '../../schemas/profile.schema';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user: currentUser, updateUser } = useAuthStore();
  const { showToast } = useToast();
  const [bioLength, setBioLength] = useState(currentUser?.bio?.length || 0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: currentUser?.displayName || '',
      bio: currentUser?.bio || '',
    },
  });

  // Watch bio field for character count
  const bio = watch('bio');
  
  // Update character count when bio changes
  if (bio !== undefined && bio.length !== bioLength) {
    setBioLength(bio.length);
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await apiClient.patch('/api/users/profile', data);
      
      // Update auth store with new user data
      if (currentUser) {
        updateUser({
          ...currentUser,
          displayName: data.displayName,
          bio: data.bio,
        });
      }
      
      showToast({
        type: 'success',
        message: 'Profile updated successfully!',
      });
      
      onClose();
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      
      if (err.status === 401) {
        showToast({
          type: 'error',
          message: 'Session expired. Please log in again.',
        });
      } else if (err.status === 400) {
        showToast({
          type: 'error',
          message: err.message || 'Invalid profile data. Please check your inputs.',
        });
      } else {
        showToast({
          type: 'error',
          message: 'Failed to update profile. Please try again.',
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Display Name Field */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Display Name *
            </label>
            <Input
              id="displayName"
              type="text"
              {...register('displayName')}
              disabled={isSubmitting}
              className={errors.displayName ? 'border-red-500' : ''}
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Bio Field */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register('bio')}
              disabled={isSubmitting}
              className={
                `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                }`
              }
            />
            <div className="mt-1 flex justify-between items-center">
              {errors.bio ? (
                <p className="text-sm text-red-600">{errors.bio.message}</p>
              ) : (
                <span className="text-sm text-gray-500">
                  {bioLength}/500 characters
                </span>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
