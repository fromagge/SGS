export interface Contact {
  contact_id: string;
  email_address: {
    address: string;
    permission_to_send: string;
    created_at: string;
    updated_at: string;
    opt_in_source: string;
    opt_in_date: string;
    confirm_status: string;
  };
  first_name: string;
  last_name: string;
};


export interface AddContact {
  email_address: {
    address: string;
    permission_to_send: string;
  };
  first_name: string;
  last_name: string;
  job_title: string;
  company_name: string;
  create_source: 'Account';
  birthday_month: number;
  birthday_day: number;
  anniversary: string;
  custom_fields: {
    custom_field_id: string;
    value: string;
  }[];
  phone_numbers: {
    phone_number: string;
    kind: string;
  }[];
  street_addresses: {
    kind: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }[];
  taggings: string[];
  notes: {
    note_id: string;
    created_at: string;
    content: string;
  }[];
  sms_channel: {
    full_sms_address: string;
    sms_channel_consents: {
      sms_consent_permission: string;
      consent_type: string;
      consent_medium_details: string;
    }[];
  };
}

export interface CreateContactResponse {
  message: string;
  contact: Contact;
}

export interface AddContactBulkRequest {
  file: File;
}

export interface AddContactBulkResponse {
  message: string;
  activity_id: string;
}