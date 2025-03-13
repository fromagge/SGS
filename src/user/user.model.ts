class PhysicalAddress {
    address_line1: string;
    address_line2?: string;
    address_line3?: string;
    city: string;
    state_code: string;
    state_name?: string;
    postal_code: string;
    country_code: string;
  
    constructor(
      address_line1: string,
      city: string,
      state_code: string,
      postal_code: string,
      country_code: string,
      address_line2?: string,
      address_line3?: string,
      state_name?: string
    ) {
      this.address_line1 = address_line1;
      this.address_line2 = address_line2;
      this.address_line3 = address_line3;
      this.city = city;
      this.state_code = state_code;
      this.state_name = state_name;
      this.postal_code = postal_code;
      this.country_code = country_code;
    }
  }
  
  class CompanyLogo {
    url: string;
    external_url: string;
    internal_id: string;
  
    constructor(url: string, external_url: string, internal_id: string) {
      this.url = url;
      this.external_url = external_url;
      this.internal_id = internal_id;
    }
  }
  
  class User {
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
  
    constructor(
      contact_email: string,
      contact_phone: string,
      country_code: string,
      encoded_account_id: string,
      first_name: string,
      last_name: string,
      organization_name: string,
      organization_phone: string,
      state_code: string,
      time_zone_id: string,
      website: string,
      physical_address: PhysicalAddress,
      company_logo: CompanyLogo
    ) {
      this.contact_email = contact_email;
      this.contact_phone = contact_phone;
      this.country_code = country_code;
      this.encoded_account_id = encoded_account_id;
      this.first_name = first_name;
      this.last_name = last_name;
      this.organization_name = organization_name;
      this.organization_phone = organization_phone;
      this.state_code = state_code;
      this.time_zone_id = time_zone_id;
      this.website = website;
      this.physical_address = physical_address;
      this.company_logo = company_logo;
    }
  }
  
  export default User;