import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { BOOK_CATEGORIES } from '@/utils/constants';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookData: any) => void;
  book?: any;
}

export function BookModal({ isOpen, onClose, onSave, book }: BookModalProps) {
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publicationYear: new Date().getFullYear().toString(),
    description: '',
    totalCopies: '1',
    availableCopies: '1',
    location: '',
    status: 'available' as 'available' | 'maintenance' | 'lost'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (book && isOpen) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || '',
        publisher: book.publisher || '',
        publicationYear: book.publicationYear?.toString() || new Date().getFullYear().toString(),
        description: book.description || '',
        totalCopies: book.totalCopies?.toString() || '1',
        availableCopies: book.availableCopies?.toString() || '1',
        location: book.location || '',
        status: book.status || 'available'
      });
    } else if (!book) {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publisher: '',
        publicationYear: new Date().getFullYear().toString(),
        description: '',
        totalCopies: '1',
        availableCopies: '1',
        location: '',
        status: 'available'
      });
    }
    setErrors({});
  }, [book, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.publisher.trim()) newErrors.publisher = 'Publisher is required';
    
    const year = parseInt(formData.publicationYear);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      newErrors.publicationYear = 'Please enter a valid year';
    }
    
    const totalCopies = parseInt(formData.totalCopies);
    const availableCopies = parseInt(formData.availableCopies);
    
    if (isNaN(totalCopies) || totalCopies < 1) {
      newErrors.totalCopies = 'Total copies must be at least 1';
    }
    
    if (isNaN(availableCopies) || availableCopies < 0) {
      newErrors.availableCopies = 'Available copies cannot be negative';
    }
    
    if (!isNaN(totalCopies) && !isNaN(availableCopies) && availableCopies > totalCopies) {
      newErrors.availableCopies = 'Available copies cannot exceed total copies';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    const bookData = {
      ...formData,
      publicationYear: parseInt(formData.publicationYear),
      totalCopies: parseInt(formData.totalCopies),
      availableCopies: parseInt(formData.availableCopies),
      id: book?.id || `book_${Date.now()}`,
      createdAt: book?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(bookData);
    addToast(book ? 'Book updated successfully!' : 'Book added successfully!', 'success');
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'lost', label: 'Lost/Damaged' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-book-modal-title">
            {book ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
                data-testid="input-book-title"
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                className={errors.author ? 'border-red-500' : ''}
                data-testid="input-book-author"
              />
              {errors.author && <p className="text-sm text-red-600 mt-1">{errors.author}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="isbn">ISBN *</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => handleChange('isbn', e.target.value)}
                className={errors.isbn ? 'border-red-500' : ''}
                placeholder="978-0-123456-78-9"
                data-testid="input-book-isbn"
              />
              {errors.isbn && <p className="text-sm text-red-600 mt-1">{errors.isbn}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''} data-testid="select-book-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="publisher">Publisher *</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => handleChange('publisher', e.target.value)}
                className={errors.publisher ? 'border-red-500' : ''}
                data-testid="input-book-publisher"
              />
              {errors.publisher && <p className="text-sm text-red-600 mt-1">{errors.publisher}</p>}
            </div>

            <div>
              <Label htmlFor="publicationYear">Publication Year *</Label>
              <Input
                id="publicationYear"
                type="number"
                value={formData.publicationYear}
                onChange={(e) => handleChange('publicationYear', e.target.value)}
                className={errors.publicationYear ? 'border-red-500' : ''}
                min="1000"
                max={new Date().getFullYear()}
                data-testid="input-book-year"
              />
              {errors.publicationYear && <p className="text-sm text-red-600 mt-1">{errors.publicationYear}</p>}
            </div>
          </div>

          {/* Copy Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="totalCopies">Total Copies *</Label>
              <Input
                id="totalCopies"
                type="number"
                value={formData.totalCopies}
                onChange={(e) => handleChange('totalCopies', e.target.value)}
                className={errors.totalCopies ? 'border-red-500' : ''}
                min="1"
                data-testid="input-book-total-copies"
              />
              {errors.totalCopies && <p className="text-sm text-red-600 mt-1">{errors.totalCopies}</p>}
            </div>

            <div>
              <Label htmlFor="availableCopies">Available Copies *</Label>
              <Input
                id="availableCopies"
                type="number"
                value={formData.availableCopies}
                onChange={(e) => handleChange('availableCopies', e.target.value)}
                className={errors.availableCopies ? 'border-red-500' : ''}
                min="0"
                data-testid="input-book-available-copies"
              />
              {errors.availableCopies && <p className="text-sm text-red-600 mt-1">{errors.availableCopies}</p>}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => handleChange('status', value)}>
                <SelectTrigger data-testid="select-book-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location/Shelf</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Section A, Shelf 3"
              data-testid="input-book-location"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the book..."
              className="min-h-[80px]"
              data-testid="textarea-book-description"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-book-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-book-save">
              {book ? 'Update Book' : 'Add Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}