import { createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Contact } from '@/types/contact';

export const contactsApi = createApi({
  reducerPath: 'contactsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
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
  }),
});

// Export the -generated hooks
export const { useGetContactsQuery } = contactsApi;

const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    error: null as string | null,
  },
  reducers: {
    
  },
});

export default contactSlice.reducer;
