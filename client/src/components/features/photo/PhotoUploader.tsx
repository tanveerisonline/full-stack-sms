import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, X, User } from 'lucide-react';

interface PhotoUploaderProps {
  currentPhoto?: string;
  onPhotoUpdate: (photoUrl: string) => void;
  entityType: 'student' | 'teacher' | 'user';
  entityId?: string | number;
  className?: string;
}

export default function PhotoUploader({
  currentPhoto,
  onPhotoUpdate,
  entityType,
  entityId,
  className = ""
}: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('entityType', entityType);
      if (entityId) {
        formData.append('entityId', entityId.toString());
      }

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      onPhotoUpdate(result.photoUrl);
      setShowUploadModal(false);
      setPreviewUrl(null);
      
      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhoto) return;

    try {
      const response = await fetch('/api/photos/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          photoUrl: currentPhoto,
        }),
      });

      if (response.ok) {
        onPhotoUpdate('');
        toast({
          title: "Photo removed",
          description: "Your photo has been removed successfully.",
        });
      }
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Remove failed",
        description: "Failed to remove photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`photo-uploader ${className}`}>
      {/* Current Photo Display */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {currentPhoto && (
            <button
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              data-testid="button-remove-photo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <Button
            variant="outline"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
            data-testid="button-upload-photo"
          >
            <Camera className="w-4 h-4" />
            {currentPhoto ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-sm text-gray-500 mt-1">
            JPG, PNG or GIF (max 5MB)
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md" data-testid="dialog-photo-upload">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl && (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
                disabled={isUploading}
                data-testid="input-file-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600">
                  {isUploading ? 'Uploading...' : 'Click to select a photo'}
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewUrl(null);
                }}
                className="flex-1"
                disabled={isUploading}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById('photo-upload') as HTMLInputElement;
                  input?.click();
                }}
                className="flex-1"
                disabled={isUploading}
                data-testid="button-select-photo"
              >
                {isUploading ? 'Uploading...' : 'Select Photo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}