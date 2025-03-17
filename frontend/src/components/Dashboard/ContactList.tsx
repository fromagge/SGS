import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

import { RootState, AppDispatch } from '@store/store';
import {
  contactsApi,
  saveBulkUpload,
  saveContacts,
  useGetContactsQuery,
} from '@store/contactSlice';
import { Contact } from '@/types/contact';
import SelectActionModal from './SelectActionModal';

const ContactList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { contacts, initialSync, lastUpdated } = useSelector(
    (state: RootState) => state.contacts,
  );
  const { isBulkUploading, activityId } = useSelector(
    (state: RootState) => state.contacts,
  );

  // Sync state
  const [from, setFrom] = useState<Date | undefined>();
  const [syncAll, setSyncAll] = useState(false);
  const [syncing, setSyncing] = useState(true);

  // Search and filter states
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    emailStatus: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage] = useState(10);

  const { data, isFetching, refetch: refetchContacts } = useGetContactsQuery(
    { from, allContacts: syncAll },
    { skip: syncing },
  );

  // Filter contacts based on search term and filters
  const filteredContacts = contacts?.filter((contact: Contact) => {
    const matchesSearch =
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email_address.address
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFirstName =
      filters.firstName === '' ||
      contact.first_name
        .toLowerCase()
        .includes(filters.firstName.toLowerCase());

    const matchesLastName =
      filters.lastName === '' ||
      contact.last_name.toLowerCase().includes(filters.lastName.toLowerCase());

    const matchesEmailStatus =
      filters.emailStatus === '' ||
      contact.email_address.confirm_status === filters.emailStatus;

    return (
      matchesSearch && matchesFirstName && matchesLastName && matchesEmailStatus
    );
  });

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts?.slice(
    indexOfFirstContact,
    indexOfLastContact,
  );
  const totalPages = Math.ceil(
    (filteredContacts?.length || 0) / contactsPerPage,
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const onAddContact = () => {
    setShowAddContactModal(true);
  };

  const isBulkFinished = async () => {
    if (!activityId) {
      return false;
    }
    const result = await dispatch(
      contactsApi.endpoints.isBulkUploading.initiate({ activityId }),
    );

    if (result.data && result.data?.isDone) {
      dispatch(saveBulkUpload({ isBulkUploading: false, activityId: null }));
      return true;
    }
    return false;
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBulkUploading) {
        const finished = await isBulkFinished();
        if (finished) {
          setSyncing(false);
          refetchContacts();
          clearInterval(interval);
        }

      }
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkUploading]);

  useEffect(() => {
    if (initialSync) {
      setSyncing(false);
      setSyncAll(true);
    }
  }, [initialSync]);

  useEffect(() => {
    if (initialSync && data && !isFetching) {
      dispatch(saveContacts(data));
    }
  }, [initialSync, data, isFetching, dispatch]);

  return (
    <>
      {showAddContactModal && (
        <SelectActionModal
          isOpen={showAddContactModal}
          onClose={() => setShowAddContactModal(false)}
        />
      )}
      <div className="mt-4">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 py-2 px-3 block w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <button
              onClick={() => onAddContact()}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add
            </button>
            <button
              onClick={() => {
                setFrom(lastUpdated ? new Date(lastUpdated) : undefined);
              }}
              disabled={isBulkUploading}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isBulkUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                  Syncing...
                </>
              ) : (
                'Sync'
              )}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-md mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1"
                  value={filters.firstName}
                  onChange={(e) =>
                    setFilters({ ...filters, firstName: e.target.value })
                  }
                  placeholder="Filter by first name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1"
                  value={filters.lastName}
                  onChange={(e) =>
                    setFilters({ ...filters, lastName: e.target.value })
                  }
                  placeholder="Filter by last name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Status
                </label>
                <select
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 bg-white"
                  value={filters.emailStatus}
                  onChange={(e) =>
                    setFilters({ ...filters, emailStatus: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option value="on">Confirmed</option>
                  <option value="off">Unconfirmed</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Contact list */}
        <div className="overflow-hidden">
          {isFetching ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredContacts?.length ? (
            <>
              <ul className="divide-y divide-gray-200">
                {currentContacts.map((contact: Contact) => (
                  <li
                    key={contact.contact_id}
                    className="py-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-2 md:mb-0">
                        <h3 className="text-lg font-medium text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {contact.email_address.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-right space-x-2">
                        <span className="text-xs text-gray-500">
                          Last updated:{' '}
                          {new Date(
                            contact.email_address.updated_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between  bg-white px-4 py-3 sm:px-6 mt-12">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                        currentPage === 1
                          ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full flex flex-col">
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm mx-auto"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50 focus:z-20'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* First page */}
                      {currentPage > 2 && (
                        <button
                          onClick={() => paginate(1)}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                        >
                          1
                        </button>
                      )}

                      {/* Ellipsis if needed */}
                      {currentPage > 3 && (
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                          ...
                        </span>
                      )}

                      {/* Generate page numbers around current page */}
                      {[...Array(totalPages).keys()]
                        .map((number) => number + 1)
                        .filter(
                          (number) =>
                            number === currentPage ||
                            (number >= currentPage - 1 &&
                              number <= currentPage + 3 &&
                              number !== 1 &&
                              number !== totalPages),
                        )
                        .map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === number
                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20'
                            }`}
                          >
                            {number}
                          </button>
                        ))}

                      {/* Ellipsis if needed */}
                      {currentPage < totalPages - 3 && (
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                          ...
                        </span>
                      )}

                      {/* Last page */}
                      {currentPage < totalPages - 1 && (
                        <button
                          onClick={() => paginate(totalPages)}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                        >
                          {totalPages}
                        </button>
                      )}

                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50 focus:z-20'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                    <div>
                      <p className="text-sm text-gray-700 mt-2">
                        Showing{' '}
                        <span className="font-medium">
                          {indexOfFirstContact + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(
                            indexOfLastContact,
                            filteredContacts?.length || 0,
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {filteredContacts?.length}
                        </span>{' '}
                        results
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No contacts found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactList;
