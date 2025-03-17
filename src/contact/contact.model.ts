export class EmailAddress {
  constructor(
    private address: string,
    private date_changed: Date = new Date(),
  ) {}
  
  getEmail(): string {
    return this.address;
  }
}

export class PhoneNumber {
  constructor(
    private number: string,
    private date_changed: Date = new Date(),
    private type: 'home' | 'work' | 'mobile' | 'other' = 'mobile',
  ) {}
  
  getNumber(): string {
    return this.number;
  }
  
  getType(): string {
    return this.type;
  }
}

class Address {
  constructor(
    private street: string = '',
    private street2: string = '',
    private city: string = '',
    private state: string = '',
    private zip: string = '',
    private country: string = '',
    private type: 'home' | 'work' | 'other' = 'home'
  ) {}
  
  getType(): string {
    return this.type;
  }
  
  getAddressData() {
    return {
      street: this.street,
      street2: this.street2,
      city: this.city,
      state: this.state,
      zip: this.zip,
      country: this.country
    };
  }
}

export class ContactModel {
  private addresses: Address[] = [];
  private job_title: string = '';
  private company_name: string = '';
  private birthday_month?: number;
  private birthday_day?: number;
  private anniversary?: string;
  private sms_number: string = '';
  private sms_consent_date: string = '';
  private custom_fields: Record<string, any> = {};

  constructor(
    private first_name: string,
    private last_name: string,
    private email_addresses: EmailAddress[] = [],
    private phone_numbers: PhoneNumber[] = [],
    private id: string = '',
    private date_changed: Date = new Date(),
    private todays_visitors: boolean = false,
    private todays_visitors_date_changed: Date = new Date(),
    private address_line_1: string = '',
    private address_line_2: string = '',
    private city: string = '',
    private zip: string = '',
    private state_abbreviation: string = '',
    private country_abbreviation: string = '',
  ) {
    if (address_line_1) {
      this.addresses.push(new Address(
        address_line_1, 
        address_line_2,
        city,
        state_abbreviation,
        zip,
        country_abbreviation
      ));
    }
  }

  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
  
  setJobTitle(title: string): void {
    this.job_title = title;
  }
  
  setCompanyName(company: string): void {
    this.company_name = company;
  }
  
  setBirthday(month: number, day: number): void {
    this.birthday_month = month;
    this.birthday_day = day;
  }
  
  setAnniversary(date: string): void {
    this.anniversary = date;
  }
  
  setSmsNumber(number: string, consentDate?: string): void {
    this.sms_number = number;
    if (consentDate) {
      this.sms_consent_date = consentDate;
    }
  }
  
  addAddress(address: Address): void {
    this.addresses.push(address);
  }
  
  addCustomField(name: string, value: any): void {
    this.custom_fields[name] = value;
  }

  to_json(): any {
    // Start with required fields
    const payload: Record<string, any> = {
      first_name: this.first_name,
      last_name: this.last_name,
    };
    
    // Add email if available
    if (this.email_addresses.length > 0) {
      payload.email = this.email_addresses[0].getEmail();
    }
    
    // Add SMS number (either from explicit SMS number or from phone numbers)
    if (this.sms_number) {
      payload.sms_number = this.sms_number;
      payload.sms_consent_date = this.sms_consent_date || new Date().toISOString();
    } else if (this.phone_numbers.length > 0) {
      // Use the first phone number as SMS number if no explicit SMS number is set
      payload.sms_number = this.phone_numbers[0].getNumber();
      payload.sms_consent_date = new Date().toISOString();
    }
    
    // Process phone numbers for other phone fields
    this.phone_numbers.forEach(phone => {
      const type = phone.getType();
      if (type === 'mobile') {
        payload.mobile_phone = phone.getNumber();
      } else if (type === 'home') {
        payload.home_phone = phone.getNumber();
      } else if (type === 'work') {
        payload.work_phone = phone.getNumber();
      } else if (type === 'other') {
        payload.other_phone = phone.getNumber();
      }
      
      // If no specific type or first number, set as general phone
      if (!payload.phone && type === 'mobile') {
        payload.phone = phone.getNumber();
      }
    });
    
    // Process addresses
    this.addresses.forEach(address => {
      const type = address.getType();
      const addressData = address.getAddressData();
      
      if (type === 'home') {
        payload.home_street = addressData.street;
        payload.home_street2 = addressData.street2;
        payload.home_city = addressData.city;
        payload.home_state = addressData.state;
        payload.home_zip = addressData.zip;
        payload.home_country = addressData.country;
      } else if (type === 'work') {
        payload.work_street = addressData.street;
        payload.work_street2 = addressData.street2;
        payload.work_city = addressData.city;
        payload.work_state = addressData.state;
        payload.work_zip = addressData.zip;
        payload.work_country = addressData.country;
      } else if (type === 'other') {
        payload.other_street = addressData.street;
        payload.other_street2 = addressData.street2;
        payload.other_city = addressData.city;
        payload.other_state = addressData.state;
        payload.other_zip = addressData.zip;
        payload.other_country = addressData.country;
      }
      
      // Set main address fields if not already set (using first address)
      if (!payload.street && type === 'home') {
        payload.street = addressData.street;
        payload.street2 = addressData.street2;
        payload.city = addressData.city;
        payload.state = addressData.state;
        payload.zip = addressData.zip;
        payload.country = addressData.country;
      }
    });
    
    // Add additional fields if present
    if (this.job_title) payload.job_title = this.job_title;
    if (this.company_name) payload.company_name = this.company_name;
    if (this.birthday_month) payload.birthday_month = this.birthday_month;
    if (this.birthday_day) payload.birthday_day = this.birthday_day;
    if (this.anniversary) payload.anniversary = this.anniversary;
    
    // Add custom fields
    for (const [key, value] of Object.entries(this.custom_fields)) {
      payload[`cf:${key}`] = value;
    }
    
    return payload;
  }
}
