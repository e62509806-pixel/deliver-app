export interface Cliente {
  id?: number;
  check?: string | null;
  number: number;
  name: string;
  identity_card?: string;
  destination: string;
  packages: number;
  family_name?: string;
  phone?: number | null;
  address?: string;
  is_address?: boolean;
  description?: string;
  delivered: boolean;
  viaje_id: number;
}

export interface ClienteCreate {
  number: number;
  name: string;
  identity_card?: string;
  destination: string;
  packages: number;
  family_name?: string;
  phone?: number | null;
  address?: string;
  is_address?: boolean;
  description?: string;
  delivered?: boolean;
  viaje_id: number;
}

export interface ClienteUpdate {
  check?: string | null;
  number?: number;
  name?: string;
  identity_card?: string;
  destination?: string;
  packages?: number;
  family_name?: string;
  phone?: number | null;
  address?: string;
  is_address?: boolean;
  description?: string;
  delivered?: boolean;
  viaje_id?: number;
}
