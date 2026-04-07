export interface Product {
  id: string;
  farmer_id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  prepared_date: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
  farmer_name?: string;
  farm_name?: string;
  user_profiles?: {
    id: string;
    full_name: string;
    farm_name?: string;
    role: string;
  };
}
