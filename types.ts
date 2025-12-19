
export interface Contact {
  name: string;
  email: string;
  title: string;
  phone: string;
}

export interface ParseResult {
  contacts: Contact[];
}
