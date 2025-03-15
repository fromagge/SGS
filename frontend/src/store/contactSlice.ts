import { createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a type for Contact
interface Contact {
  id: string;
  // Add other contact properties here
  [key: string]: any;
}

// Create the API service using RTK Query
export const contactsApi = createApi({
  reducerPath: 'contactsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    getContacts: builder.query<Contact[], void>({
      query: () => '/contacts',
      providesTags: ['Contact'],
    }),
    updateContact: builder.mutation<Contact, Contact>({
      query: (contact) => ({
        url: `/contacts/${contact.id}`,
        method: 'PUT',
        body: contact,
      }),
      invalidatesTags: ['Contact'],
    }),
    deleteContact: builder.mutation<void, string>({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

// Export the auto-generated hooks
export const {
  useGetContactsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactsApi;

// You can still keep a slice for any local state management
const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    error: null as string | null,
  },
  reducers: {
    // Add any local reducers here if needed
  },
});

export default contactSlice.reducer;
