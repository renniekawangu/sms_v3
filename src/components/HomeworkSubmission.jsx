import { useState, useRef } from 'react'
import { Upload, Image, FileText, X, Check, AlertCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { homeworkApi } from '../services/api'
import {
  convertImageToPdf,
  convertMultipleImagesToPdf,
  isImageFile,
  isPdfFile,
  formatFileSize
} from '../utils/photoPdfConverter'

/**
 * HomeworkSubmission Component
 * Allows students to submit homework with photo-to-PDF conversion
 */
function HomeworkSubmission({ homeworkId, classroomId, onSubmitSuccess }) {
  const { success, error: showError, loading } = useToast()
  const { user } = useAuth()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [convertedPdf, setConvertedPdf] = useState(null)
  const [isConverting, setIsConverting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!isImageFile(file) && !isPdfFile(file)) {
        showError(`${file.name} is not a supported file type (image or PDF)`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB max
        showError(`${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedFiles(validFiles);
    
    // If all files are images, auto-convert to PDF
    const imageFiles = validFiles.filter(f => isImageFile(f));
    if (imageFiles.length > 0 && imageFiles.length === validFiles.length) {
      await convertToPdf(imageFiles);
    }
  };

  const convertToPdf = async (imageFiles) => {
    try {
      setIsConverting(true);
      
      let pdfBlob;
      if (imageFiles.length === 1) {
        pdfBlob = await convertImageToPdf(imageFiles[0]);
      } else {
        pdfBlob = await convertMultipleImagesToPdf(imageFiles);
      }

      // Create a File object from the blob
      const pdfFile = new File([pdfBlob], 'homework_submission.pdf', {
        type: 'application/pdf'
      });

      setConvertedPdf({
        file: pdfFile,
        blob: pdfBlob,
        name: pdfFile.name,
        size: pdfFile.size
      });

      success(`Converted ${imageFiles.length} image(s) to PDF`);
    } catch (err) {
      showError(`Conversion failed: ${err.message}`);
      setConvertedPdf(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertClick = async () => {
    const imageFiles = selectedFiles.filter(f => isImageFile(f));
    if (imageFiles.length === 0) {
      showError('No image files selected');
      return;
    }
    await convertToPdf(imageFiles);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearConversion = () => {
    setConvertedPdf(null);
  };

  const handleDownloadPdf = () => {
    if (!convertedPdf?.blob) return;

    const url = URL.createObjectURL(convertedPdf.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = convertedPdf.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!convertedPdf && selectedFiles.length === 0) {
      showError('Please select files to submit');
      return;
    }

    try {
      setSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      
      if (convertedPdf) {
        formData.append('files', convertedPdf.file);
      } else {
        // Upload PDFs directly
        selectedFiles.forEach(file => {
          if (isPdfFile(file)) {
            formData.append('files', file);
          }
        });
      }

      // Submit homework
      const response = await homeworkApi.submitWithFiles(homeworkId, formData);
      
      success('Homework submitted successfully');
      setSelectedFiles([]);
      setConvertedPdf(null);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      showError(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const hasImages = selectedFiles.some(f => isImageFile(f));
  const hasPdfs = selectedFiles.some(f => isPdfFile(f));

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
      <h3 className="text-lg sm:text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
        <Upload size={20} className="text-primary-blue" />
        Submit Homework
      </h3>

      {/* File Upload Area */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          fileInputRef.current?.click()
        }}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary-blue hover:bg-blue-50 transition-all mb-4"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm sm:text-base font-medium text-text-dark mb-1">
          Click or drag files to upload
        </p>
        <p className="text-xs sm:text-sm text-text-muted">
          Images will be converted to PDF. Supported: JPG, PNG, GIF, WebP, PDF
        </p>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm sm:text-base text-text-dark mb-3 flex items-center gap-2">
            <Image size={16} />
            Selected Files ({selectedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 sm:p-3 bg-white rounded border border-gray-200"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isImageFile(file) ? (
                    <Image size={16} className="text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText size={16} className="text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-text-dark truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1 hover:bg-red-50 rounded transition"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>

          {hasImages && (
            <button
              type="button"
              onClick={handleConvertClick}
              disabled={isConverting}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition text-xs sm:text-sm font-medium"
            >
              {isConverting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Convert Images to PDF
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Converted PDF Preview */}
      {convertedPdf && (
        <div className="mb-4 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Check size={20} className="text-green-600" />
              <div>
                <h4 className="font-medium text-sm sm:text-base text-text-dark">
                  Ready to Submit
                </h4>
                <p className="text-xs text-text-muted">PDF converted successfully</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearConversion}
              className="p-1 hover:bg-green-100 rounded transition"
            >
              <X size={16} className="text-green-600" />
            </button>
          </div>

          <div className="p-2 sm:p-3 bg-white rounded border border-green-200 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-text-dark truncate">
                  {convertedPdf.name}
                </p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(convertedPdf.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="text-xs text-primary-blue hover:underline"
            >
              Download Preview
            </button>
          </div>
        </div>
      )}

      {/* Info Alert */}
      {selectedFiles.length > 0 && !convertedPdf && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-700">
            {hasImages && hasImages
              ? 'Images will be converted to PDF. PDF files will be uploaded as-is.'
              : hasImages
              ? 'Select images above to convert them to PDF before submitting.'
              : 'PDF files are ready to submit.'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleSubmit()
        }}
        disabled={submitting || (selectedFiles.length === 0 && !convertedPdf) || isConverting}
        className="w-full px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm sm:text-base flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check size={18} />
            Submit Homework
          </>
        )}
      </button>
    </div>
  );
}

export default HomeworkSubmission;
