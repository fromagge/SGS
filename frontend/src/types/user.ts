interface PhysicalAddress {
  address_line1: string;
  address_line2?: string;
  address_line3?: string;
  city: string;
  state_code: string;
  state_name?: string;
  postal_code: string;
  country_code: string;
}

interface CompanyLogo {
  url: string;
  external_url: string;
  internal_id: string;
}

interface User {
  contact_email: string;
  contact_phone: string;
  country_code: string;
  encoded_account_id: string;
  first_name: string;
  last_name: string;
  organization_name: string;
  organization_phone: string;
  state_code: string;
  time_zone_id: string;
  website: string;
  physical_address: PhysicalAddress;
  company_logo: CompanyLogo;
}

export default User;