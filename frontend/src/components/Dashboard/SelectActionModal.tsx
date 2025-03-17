import { UserPlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

import BaseModal from '@components/Modal';
import AddContactModal from '@/components/Dashboard/AddContactModal';
import AddContactBulkModal from '@/components/Dashboard/AddContactBulkModal';

const SelectActionModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isAddContactBulkModalOpen, setIsAddContactBulkModalOpen] =
    useState(false);

  useEffect(() => {
    if (selectedAction === 'addContact') {
      setIsAddContactModalOpen(true);
    } else if (selectedAction === 'addContactBulk') {
      setIsAddContactBulkModalOpen(true);
    }
  }, [onClose, selectedAction]);

  return (
    <>
      {selectedAction === null && (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Select Action">
          <div className="flex flex-row gap-6  my-6 w-full">
            <button
              className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors duration-200 w-full h-full min-h-[200px] cursor-pointer "
              onClick={() => setSelectedAction('addContact')}
            >
              <UserPlusIcon className="h-12 w-12 text-blue-500 mb-4 grayscale" />
              <h3 className="text-lg font-medium text-gray-900">
                Add a contact
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add a single contact to your list
              </p>
            </button>

            <button
              className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors duration-200 w-full h-full min-h-[200px] cursor-pointer"
              onClick={() => setSelectedAction('addContactBulk')}
            >
              <UsersIcon className="h-12 w-12 text-green-500 mb-4  grayscale" />
              <h3 className="text-lg font-medium text-gray-900">
                Add multiple contacts
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Import multiple contacts from a file
              </p>
            </button>
          </div>
        </BaseModal>
      )}
      {selectedAction === 'addContact' && (
        <AddContactModal
          isOpen={isAddContactModalOpen}
          onClose={() => {
            setIsAddContactModalOpen(false);
            onClose();
          }}
        />
      )}
      {selectedAction === 'addContactBulk' && (
        <AddContactBulkModal
          isOpen={isAddContactBulkModalOpen}
          onClose={() => {
            setIsAddContactBulkModalOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default SelectActionModal;
