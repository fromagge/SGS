/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

import {
  AddContact,
  AddContactBulkRequest,
  AddContactBulkResponse,
  Contact,
  CreateContactResponse,
} from '@/types/contact';
import { TOKEN_COOKIE_NAME } from './authSlice';

interface ContactState {
  contacts: Contact[];
  initialSync: boolean | null;
  lastUpdated: Date | null;
  isBulkUploading: boolean;
  activityId: string | null;
}

const initialState: ContactState = {
  contacts: [],
  initialSync: true,
  lastUpdated: null,
  isBulkUploading: false,
  activityId: null,
};

const loadContactState = (): ContactState => {
  const contacts = localStorage.getItem('contacts');
  const initialSync = localStorage.getItem('initialSync');
  const lastUpdated = localStorage.getItem('lastUpdated');
  const bulkUpload = localStorage.getItem('bulkUpload');

  if (contacts === null) {
    return initialState;
  }

  return {
    contacts: JSON.parse(contacts),
    initialSync: initialSync ? JSON.parse(initialSync) : true,
    lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
    isBulkUploading: bulkUpload
      ? JSON.parse(bulkUpload).isBulkUploading
      : false,
    activityId: bulkUpload ? JSON.parse(bulkUpload).activityId : null,
  };
};

const saveContactState = (state: ContactState) => {
  localStorage.setItem('contacts', JSON.stringify(state.contacts));
  localStorage.setItem('initialSync', JSON.stringify(state.initialSync));
  localStorage.setItem('lastUpdated', JSON.stringify(state.lastUpdated));
  localStorage.setItem(
    'bulkUpload',
    JSON.stringify({
      isBulkUploading: state.isBulkUploading,
      activityId: state.activityId,
    }),
  );
};

const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  return baseQuery(args, api, extraOptions);
};

export const contactsApi = createApi({
  reducerPath: 'contactsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    getContacts: builder.query<
      Contact[],
      {
        from: Date | undefined;
        allContacts: boolean | undefined;
      }
    >({
      query: ({ from, allContacts }) => ({
        url: '/contacts',
        params: {
          from: from?.toISOString(),
          allContacts,
        },
      }),
      providesTags: ['Contact'],
    }),
    addContact: builder.mutation<CreateContactResponse, AddContact>({
      query: (contact) => ({
        url: '/contacts',
        method: 'POST',
        body: contact,
      }),
    }),
    addContactBulk: builder.mutation<
      AddContactBulkResponse,
      AddContactBulkRequest
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: '/contacts/bulk',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': undefined,
          },
        };
      },
    }),
    isBulkUploading: builder.query<{ isDone: boolean }, { activityId: string }>(
      {
        query: ({ activityId }) => ({
          url: `/contacts/bulk/${activityId}`,
        }),
      },
    ),
  }),
});

export const {
  useGetContactsQuery,
  useAddContactMutation,
  useAddContactBulkMutation,
  useIsBulkUploadingQuery,
  useLazyIsBulkUploadingQuery,
} = contactsApi;

const contactSlice = createSlice({
  name: 'contacts',
  initialState: loadContactState(),
  reducers: {
    saveContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
      if (state.initialSync === true) {
        state.initialSync = false;
      }
      state.lastUpdated = new Date();
      saveContactState(state);
    },
    saveSingleContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
      state.lastUpdated = new Date();
      saveContactState(state);
    },
    saveBulkUpload: (
      state,
      action: PayloadAction<{
        isBulkUploading: boolean;
        activityId: string | null;
      }>,
    ) => {
      state.isBulkUploading = action.payload.isBulkUploading;
      state.activityId = action.payload.activityId;
      saveContactState(state);
    },
  },
});

export const { saveContacts, saveBulkUpload, saveSingleContact } =
  contactSlice.actions;
export default contactSlice.reducer;
