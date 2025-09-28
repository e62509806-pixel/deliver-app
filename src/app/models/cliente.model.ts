export interface Cliente {
  id?: number;
  number: number;
  name: string;
  identity_card?: number | null;
  destination: string;
  packages: number;
  family_name?: string;
  phone?: number | null;
  description?: string;
  delivered: boolean;
  viaje_id: number;
}

export interface ClienteCreate {
  number: number;
  name: string;
  identity_card?: number | null;
  destination: string;
  packages: number;
  family_name?: string;
  phone?: number | null;
  description?: string;
  delivered?: boolean;
  viaje_id: number;
}

export interface ClienteUpdate {
  number?: number;
  name?: string;
  identity_card?: number | null;
  destination?: string;
  packages?: number;
  family_name?: string;
  phone?: number | null;
  description?: string;
  delivered?: boolean;
  viaje_id?: number;
}
