/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm, useFieldArray } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { AddContact } from '@/types/contact';
import LoadingSpin from '@components/LoadingSpin';
import BaseModal from '@components/Modal';
import { saveSingleContact, useAddContactMutation } from '@store/contactSlice';

const AddContactModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const [uploadContact] = useAddContactMutation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<AddContact>({
    defaultValues: {
      email_address: {
        address: '',
        permission_to_send: 'explicit',
      },
      first_name: '',
      last_name: '',
      create_source: 'Account',
      phone_numbers: [],
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: 'street_addresses',
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: 'phone_numbers',
  });

  const hasContactMethod = () => {
    const emailValue = watch('email_address.address');
    const phoneValues = watch('phone_numbers');

    return Boolean(
      (emailValue && emailValue.trim() !== '') ||
        (phoneValues &&
          phoneValues.length > 0 &&
          phoneValues.some(
            (p) => p.phone_number && p.phone_number.trim() !== '',
          )),
    );
  };

  const onSubmit = async (data: AddContact) => {
    if (!hasContactMethod()) {
      setError('root.contactMethod', {
        type: 'manual',
        message:
          'At least one contact method (email or phone number) is required',
      });
      return;
    }

    // Clean the data object to remove null, undefined and empty values
    const cleanData = (obj: any): any => {
      if (obj === null || obj === undefined) return undefined;
      
      if (Array.isArray(obj)) {
        const cleanedArray = obj
          .map(item => cleanData(item))
          .filter(item => item !== undefined);
        return cleanedArray.length > 0 ? cleanedArray : undefined;
      }
      
      if (typeof obj === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanedObj: any = {};
        let hasValues = false;
        
        Object.entries(obj).forEach(([key, value]) => {
          const cleanedValue = cleanData(value);
          if (cleanedValue !== undefined) {
            cleanedObj[key] = cleanedValue;
            hasValues = true;
          }
        });
        
        return hasValues ? cleanedObj : undefined;
      }
      
      // For primitive values
      if (obj === '' || obj === null || obj === undefined) return undefined;
      return obj;
    };

    // Clean the data before submitting
    const cleanedData = cleanData(data) || {};

    if (cleanedData.phone_numbers?.length > 0) {
      cleanedData.sms_channel = {
        full_sms_address: cleanedData.phone_numbers[0].phone_number,
        sms_channel_consents: [
          {
            consent_type: 'sms',
            consent_medium_details: 'sms',
            sms_consent_permission: 'explicit',
          },
        ],
      };
    }

    setIsSubmitting(true);
    const response = await uploadContact(cleanedData);
    if (response.error) {
      toast.error('Something went wrong, please try again');
      return;
    }

    dispatch(saveSingleContact(response.data.contact));
    toast.success('Contact added successfully');
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Contact"
      isSubmitting={isSubmitting}
    >
      {isSubmitting ? (
        <div className="px-6 py-4 min-h-[50vh] overflow-y-auto flex justify-center items-center">
          <LoadingSpin width="20%" />
        </div>
      ) : (
        <div>
          {/* Form */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Method Validation Error */}
              {errors.root?.contactMethod && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {errors.root.contactMethod.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="firstName"
                    >
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      {...register('first_name', {
                        required: 'First name is required',
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="lastName"
                    >
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      {...register('last_name', {
                        required: 'Last name is required',
                      })}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="email"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email_address.address', {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.email_address?.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        onChange={(e) => {
                          // Clear the contact method error if input is provided
                          if (e.target.value) {
                            clearErrors('root.contactMethod');
                          }
                        }}
                      />
                      {errors.email_address?.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email_address.address.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Either an email address or phone number is required
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="jobTitle"
                    >
                      Job Title
                    </label>
                    <input
                      id="jobTitle"
                      {...register('job_title')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor="companyName"
                    >
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      {...register('company_name')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Birthday
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label
                          className="block text-xs text-gray-500"
                          htmlFor="birthdayMonth"
                        >
                          Month
                        </label>
                        <select
                          id="birthdayMonth"
                          {...register('birthday_month', {
                            valueAsNumber: true,
                            validate: (value) =>
                              !value ||
                              (value >= 1 && value <= 12) ||
                              'Invalid month',
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select Month</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className="block text-xs text-gray-500"
                          htmlFor="birthdayDay"
                        >
                          Day
                        </label>
                        <select
                          id="birthdayDay"
                          {...register('birthday_day', {
                            valueAsNumber: true,
                            validate: (value) =>
                              !value ||
                              (value >= 1 && value <= 31) ||
                              'Invalid day',
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select Day</option>
                          {[...Array(31)].map((_, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(errors.birthday_month || errors.birthday_day) && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.birthday_month?.message ||
                          errors.birthday_day?.message}
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* Phone Numbers */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-700">
                    Phone Numbers
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      appendPhone({
                        phone_number: '',
                        kind: 'mobile',
                      });
                      // Clear contact method error when adding a phone
                      clearErrors('root.contactMethod');
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Phone
                  </button>
                </div>

                {phoneFields.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No phone numbers added. Click "Add Phone" to begin.
                  </p>
                )}

                {phoneFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="mb-4 p-3 border border-gray-200 rounded-md bg-white"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-700">
                        Phone #{index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removePhone(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700"
                          htmlFor={`phone.${index}.number`}
                        >
                          Phone Number
                        </label>
                        <input
                          id={`phone.${index}.number`}
                          type="tel"
                          {...register(`phone_numbers.${index}.phone_number`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="(123) 456-7890"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700"
                          htmlFor={`phone.${index}.kind`}
                        >
                          Type
                        </label>
                        <select
                          id={`phone.${index}.kind`}
                          {...register(`phone_numbers.${index}.kind`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="mobile">Mobile</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <p className="text-xs text-gray-500 mt-2">
                  Either an email address or phone number is required
                </p>
              </div>

              {/* Street Addresses */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-700">
                    Physical Addresses
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      appendAddress({
                        kind: 'home',
                        street: '',
                        city: '',
                        state: '',
                        postal_code: '',
                        country: '',
                      })
                    }
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Address
                  </button>
                </div>

                {addressFields.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No addresses added. Click "Add Address" to begin.
                  </p>
                )}

                {addressFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="mb-4 p-3 border border-gray-200 rounded-md bg-white"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-700">
                        Address #{index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700"
                          htmlFor={`addresses.${index}.kind`}
                        >
                          Type
                        </label>
                        <select
                          id={`addresses.${index}.kind`}
                          {...register(`street_addresses.${index}.kind`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="billing">Billing</option>
                          <option value="shipping">Shipping</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700"
                          htmlFor={`addresses.${index}.country`}
                        >
                          Country
                        </label>
                        <input
                          id={`addresses.${index}.country`}
                          {...register(`street_addresses.${index}.country`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor={`addresses.${index}.street`}
                      >
                        Street Address
                      </label>
                      <input
                        id={`addresses.${index}.street`}
                        {...register(`street_addresses.${index}.street`)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700"
                          htmlFor={`addresses.${index}.city`}
                        >
                          City
                        </label>
                        <input
                          id={`addresses.${index}.city`}
                          {...register(`street_addresses.${index}.city`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700"
                          htmlFor={`addresses.${index}.state`}
                        >
                          State/Province
                        </label>
                        <input
                          id={`addresses.${index}.state`}
                          {...register(`street_addresses.${index}.state`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor={`addresses.${index}.postal_code`}
                      >
                        Postal Code
                      </label>
                      <input
                        id={`addresses.${index}.postal_code`}
                        {...register(`street_addresses.${index}.postal_code`)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>

          {/* Footer with buttons */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse sm:px-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-500 text-base font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-150 ease-in-out"
            >
              Save Contact
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default AddContactModal;
