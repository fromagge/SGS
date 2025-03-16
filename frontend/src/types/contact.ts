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


