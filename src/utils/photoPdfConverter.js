/**
 * Photo to PDF Converter Utility
 * Converts images to PDF format for homework submissions
 */

import jsPDF from 'jspdf';

/**
 * Convert a single image to PDF
 * @param {File} imageFile - Image file to convert
 * @returns {Promise<Blob>} PDF blob
 */
export const convertImageToPdf = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const img = new Image();
        
        img.onload = () => {
          // Create PDF with image dimensions
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height]
          });

          // Add image to PDF
          pdf.addImage(
            event.target.result,
            'JPEG',
            0,
            0,
            img.width,
            img.height
          );

          // Convert to blob and resolve - make sure it's a proper PDF blob
          const blob = pdf.output('blob');
          
          // Create a proper PDF blob with correct MIME type
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          resolve(pdfBlob);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = event.target.result;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(imageFile);
  });
};

/**
 * Convert multiple images to a single PDF
 * @param {File[]} imageFiles - Array of image files
 * @returns {Promise<Blob>} PDF blob containing all images
 */
export const convertMultipleImagesToPdf = async (imageFiles) => {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('No images provided');
  }

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    for (let i = 0; i < imageFiles.length; i++) {
      const imageBlob = await convertImageToPdf(imageFiles[i]);
      const imageUrl = URL.createObjectURL(imageBlob);
      
      if (i > 0) {
        pdf.addPage();
      }

      // Calculate dimensions to fit A4
      const imgDimensions = pdf.getImageProperties(imageUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      let width = pdfWidth - 20;
      let height = (imgDimensions.height * width) / imgDimensions.width;

      if (height > pdfHeight - 20) {
        height = pdfHeight - 20;
        width = (imgDimensions.width * height) / imgDimensions.height;
      }

      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      pdf.addImage(imageUrl, 'JPEG', x, y, width, height);
      URL.revokeObjectURL(imageUrl);
    }

    return pdf.output('blob');
  } catch (error) {
    throw new Error(`Failed to convert images to PDF: ${error.message}`);
  }
};

/**
 * Convert image to PDF and create download link
 * @param {File} imageFile - Image file to convert
 * @param {string} fileName - Name for the PDF file (without extension)
 */
export const downloadImageAsPdf = async (imageFile, fileName = 'homework') => {
  try {
    const pdfBlob = await convertImageToPdf(imageFile);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
};

/**
 * Convert multiple images to PDF and download
 * @param {File[]} imageFiles - Array of image files
 * @param {string} fileName - Name for the PDF file (without extension)
 */
export const downloadMultipleImagesAsPdf = async (imageFiles, fileName = 'homework') => {
  try {
    const pdfBlob = await convertMultipleImagesToPdf(imageFiles);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
};

/**
 * Validate if file is an image
 * @param {File} file - File to validate
 * @returns {boolean} True if file is an image
 */
export const isImageFile = (file) => {
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validImageTypes.includes(file.type);
};

/**
 * Validate if file is a PDF
 * @param {File} file - File to validate
 * @returns {boolean} True if file is a PDF
 */
export const isPdfFile = (file) => {
  return file.type === 'application/pdf';
};

/**
 * Get file extension
 * @param {File} file - File to get extension from
 * @returns {string} File extension
 */
export const getFileExtension = (file) => {
  return file.name.split('.').pop().toLowerCase();
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
