import React, { useCallback, useState, useEffect } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { processFile } from '../lib/knowledge';

interface FileUploadProps {
  onUploadComplete: (filename: string) => void;
  onError: (error: string) => void;
  darkMode?: boolean;
}

export function FileUpload({ onUploadComplete, onError, darkMode = false }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (uploadStatus) {
      const timer = setTimeout(() => setUploadStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  const handleFileProcess = async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      onError('Only CSV and Excel files (xlsx, xls) are supported');
      setUploadStatus('error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await processFile(file);
      if (data.length === 0) {
        throw new Error('No valid data found in file');
      }
      setLastUploadedFile(file.name);
      setUploadStatus('success');
      onUploadComplete(`${file.name} (${data.length} records)`);
      setShowUpload(false);
    } catch (error: any) {
      console.error('File processing error:', error);
      onError(error.message || `Error processing ${file.name}`);
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await handleFileProcess(file);
    }
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        await handleFileProcess(file);
      }
    }
    event.target.value = '';
  }, []);

  return (
    <div className="flex items-center justify-center">
      {!showUpload ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md ${
              darkMode 
                ? 'text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600' 
                : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          
          {uploadStatus === 'success' && (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <CheckCircle className="h-4 w-4" />
              Success
            </span>
          )}
          {uploadStatus === 'error' && (
            <span className="flex items-center gap-1 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              Failed
            </span>
          )}
          {lastUploadedFile && !uploadStatus && (
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {lastUploadedFile}
            </span>
          )}
        </div>
      ) : (
        <div className="relative max-w-md w-full">
          <div
            className={`relative border-2 ${
              dragActive 
                ? darkMode 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-purple-500 bg-purple-50'
                : darkMode
                  ? 'border-dashed border-gray-600' 
                  : 'border-dashed border-gray-300'
            } rounded-lg p-4 text-center transition-colors`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'} animate-spin`} />
                ) : (
                  <Upload className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                )}
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isLoading ? 'Processing...' : 'Drop CSV/Excel or click'}
                </span>
              </div>
            </label>
          </div>
          <button
            onClick={() => setShowUpload(false)}
            className={`absolute -top-2 -right-2 p-1 rounded-full ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}