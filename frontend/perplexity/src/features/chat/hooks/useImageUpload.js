import { useState, useCallback, useRef } from "react";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 4;
const MAX_DIMENSION = 1200; // Resize large images

/**
 * Compress/resize an image using Canvas API.
 * Returns { data: base64String, mimeType, name }.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Resize if too large
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Output as JPEG for compression (unless it's a PNG with transparency or GIF)
        const outputType = file.type === "image/png" || file.type === "image/gif" ? file.type : "image/jpeg";
        const quality = 0.82;
        const dataUrl = canvas.toDataURL(outputType, quality);
        const base64 = dataUrl.split(",")[1];

        resolve({
          data: base64,
          mimeType: outputType,
          name: file.name || "image",
          preview: dataUrl, // For local preview
        });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Custom hook for managing image uploads in chat.
 * Supports: file picker, drag & drop, clipboard paste.
 */
export function useImageUpload() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Validate and add files
  const addFiles = useCallback(async (files) => {
    setError(null);
    const fileList = Array.from(files);

    for (const file of fileList) {
      // Check type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Unsupported format: ${file.type.split("/")[1] || "unknown"}. Use PNG, JPG, WEBP, or GIF.`);
        continue;
      }
      // Check size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name}. Max 5MB per image.`);
        continue;
      }
      // Check limit
      setImages((prev) => {
        if (prev.length >= MAX_IMAGES) {
          setError(`Maximum ${MAX_IMAGES} images allowed.`);
          return prev;
        }
        return prev; // Will be updated after compression
      });
    }

    // Compress and add valid files
    const validFiles = fileList.filter(
      (f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
    );

    try {
      const compressed = await Promise.all(validFiles.map(compressImage));
      setImages((prev) => {
        const remaining = MAX_IMAGES - prev.length;
        return [...prev, ...compressed.slice(0, remaining)];
      });
    } catch {
      setError("Failed to process one or more images.");
    }
  }, []);

  // Remove a specific image by index
  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  // Clear all images
  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file input change
  const onFileInputChange = useCallback((e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  }, [addFiles]);

  // Drag & drop handlers
  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types?.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the container (not entering a child)
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  // Clipboard paste handler
  const onPaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      addFiles(imageFiles);
    }
  }, [addFiles]);

  return {
    images,
    error,
    isDragging,
    fileInputRef,
    addFiles,
    removeImage,
    clearImages,
    openFilePicker,
    onFileInputChange,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onPaste,
  };
}
