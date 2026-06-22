export interface Operator {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  city: string | null;
  state: string | null;
  tier: string;
  logo_url: string | null;
  points_per_dollar: string;
  redemption_rate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  location_count?: number;
}

export interface OperatorLocation {
  id: string;
  operator_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: string | null;
  lng: string | null;
  phone: string | null;
  is_primary: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Special {
  id: string;
  item: string;
  description: string;
  updated_at: number;
}

export interface OperatorProfile {
  id: string;
  operator_id: string;
  about: string | null;
  hours: Record<string, string> | null;
  website: string | null;
  instagram: string | null;
  leafly_url: string | null;
  dutchie_url: string | null;
  other_ordering_url: string | null;
  ordering_platform: string | null;
  payment_methods: string[] | null;
  black_owned: boolean;
  woman_owned: boolean;
  lgbtq_friendly: boolean;
  veteran_owned: boolean;
  specials: Special[] | null;
  primary_color: string | null;
  secondary_color: string | null;
  background_color: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  palette: string;
  date_updated: string;
  lat: string | null;
  lng: string | null;
}

export interface StrainQueueItem {
  id: string;
  name: string;
  type: string | null;
  device_id: string;
  device_ids: string[];
  surfaced_at: string;
  status: 'pending' | 'enriching' | 'published' | 'rejected';
  strain_id: string | null;
  surface_count: number;
}

export interface Terpene {
  name: string;
  effect: string;
}

export interface Strain {
  id: string;
  name: string;
  aliases: string[];
  type: 'sativa' | 'indica' | 'hybrid';
  lineage: string | null;
  thc_min: number | null;
  thc_max: number | null;
  cbd_min: number | null;
  cbd_max: number | null;
  terpenes: Terpene[];
  effects: string[];
  use_cases: string[];
  flavors: string[];
  about: string | null;
  cautions: string | null;
  best_method: string | null;
  beginner_friendly: boolean;
  dominance: 'true_sativa' | 'sativa_dominant' | 'balanced' | 'indica_dominant' | 'true_indica' | null;
  session_count: number;
  created_at: string;
  updated_at: string;
}
