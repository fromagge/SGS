import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { toast } from 'react-toastify';

import BaseModal from '@components/Modal';

import { validateDataFile } from '@/utils/excel';
import { saveBulkUpload, useAddContactBulkMutation } from '@store/contactSlice';
const AddContactBulkModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const [uploadContactsBulk] = useAddContactBulkMutation();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      if (!acceptedFileTypes.includes(selectedFile.type)) {
        setError('Please upload only Excel files (.xlsx, .xls)');
        setFile(null);
        return;
      }

      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setError('Please upload only Excel files (.xlsx, .xls)');
        setFile(null);
        return;
      }

      const { isValid, errors } = await validateDataFile(selectedFile);

      if (!isValid) {
        setError(errors.join('\n'));
        setFile(null);
        toast.error('The file is not valid');
        return;
      }

      toast.success('The file is valid and ready to upload');
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    const response = await uploadContactsBulk({ file: file });
    if (response.error) {
      setIsUploading(false);
      toast.error('Something went wrong, please try again');
      return;
    }

    toast.success(
      'File uploaded successfully, the contacts will be added shortly',
    );
    setIsUploading(false);
    dispatch(
      saveBulkUpload({
        isBulkUploading: true,
        activityId: response.data.activity_id,
      }),
    );
    onClose();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Add Contacts Bulk">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls"
        className="hidden"
      />

      <div className="my-4 h-64 border-2 border-dashed border-gray-300 rounded-md p-6 text-center flex flex-col items-center justify-center">
        {file ? (
          <div className="flex flex-col items-center">
            <span className="text-green-500 mb-2">✓ File selected</span>
            <p className="text-gray-700">{file.name}</p>
            <button
              onClick={triggerFileInput}
              className="mt-2 text-blue-500 bg-purple-400 text-white rounded-md p-2 mt-4 cursor-pointer"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <button
              onClick={triggerFileInput}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer"
            >
              Select file
            </button>
            <p className="mt-2 text-gray-500 text-sm">
              Supports .xlsx, .xls and .csv formats
            </p>
          </div>
        )}
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded mr-2"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`px-4 py-2 rounded ${
            !file || isUploading
              ? 'bg-gray-300 text-gray-500'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </BaseModal>
  );
};

export default AddContactBulkModal;
