import React from 'react';

const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  isSubmitting?: boolean | undefined | null;
}) => {
  if (!isOpen) return <></>;

  return (
    <div
      className="fixed z-10 inset-0 overflow-y-auto bg-gray-800/75 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-xl shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full overflow-hidden p-4">
          {/* Header */}
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold" id="modal-title">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="hover:text-gray-200 focus:outline-none cursor-pointer"
              >
                {!isSubmitting && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
