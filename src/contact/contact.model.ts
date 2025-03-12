class EmailAddress {
  constructor(
    private address: string,
    private date_changed: Date = new Date(),
  ) {}
}

class PhoneNumber {
  constructor(
    private number: string,
    private date_changed: Date = new Date(),
  ) {}
}

export class Contact {
  constructor(
    private first_name: string,
    private last_name: string,
    private email_addresses: EmailAddress[],
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
  ) {}

  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
