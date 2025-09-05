export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      products: {
        Row: {
          barcode: string | null
          category: string
          created_at: string
          current_stock: number
          id: string
          location: string | null
          min_stock: number
          name: string
          price: number
          purchase_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          category: string
          created_at?: string
          current_stock?: number
          id?: string
          location?: string | null
          min_stock?: number
          name: string
          price: number
          purchase_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          category?: string
          created_at?: string
          current_stock?: number
          id?: string
          location?: string | null
          min_stock?: number
          name?: string
          price?: number
          purchase_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          cash_received: number | null
          cashier_name: string
          change: number | null
          created_at: string
          grand_total: number
          id: string
          items: Json
          payment_method: string
          receipt_number: string
          tax: number
          total: number
          user_id: string
        }
        Insert: {
          cash_received?: number | null
          cashier_name: string
          change?: number | null
          created_at?: string
          grand_total: number
          id?: string
          items: Json
          payment_method: string
          receipt_number: string
          tax: number
          total: number
          user_id: string
        }
        Update: {
          cash_received?: number | null
          cashier_name?: string
          change?: number | null
          created_at?: string
          grand_total?: number
          id?: string
          items?: Json
          payment_method?: string
          receipt_number?: string
          tax?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          phone: string | null
          store_name: string | null
          business_name: string | null
          business_type: string | null
          address: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          country: string | null
          tax_number: string | null
          business_license: string | null
          description: string | null
          currency: string | null
          timezone: string | null
          language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          store_name?: string | null
          business_name?: string | null
          business_type?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string | null
          tax_number?: string | null
          business_license?: string | null
          description?: string | null
          currency?: string | null
          timezone?: string | null
          language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          store_name?: string | null
          business_name?: string | null
          business_type?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string | null
          tax_number?: string | null
          business_license?: string | null
          description?: string | null
          currency?: string | null
          timezone?: string | null
          language?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          store_name: string | null
          business_name: string | null
          business_type: string | null
          phone: string | null
          address: string | null
          city: string | null
          province: string | null
          is_active: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          subscription_expires_at: string | null
          total_products: number | null
          total_transactions: number | null
          total_revenue: number | null
          currency: string | null
          timezone: string | null
          language: string | null
          theme: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          store_name?: string | null
          business_name?: string | null
          business_type?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_expires_at?: string | null
          total_products?: number | null
          total_transactions?: number | null
          total_revenue?: number | null
          currency?: string | null
          timezone?: string | null
          language?: string | null
          theme?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          store_name?: string | null
          business_name?: string | null
          business_type?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_expires_at?: string | null
          total_products?: number | null
          total_transactions?: number | null
          total_revenue?: number | null
          currency?: string | null
          timezone?: string | null
          language?: string | null
          theme?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      receipt_settings: {
        Row: {
          id: string
          user_id: string
          show_logo: boolean | null
          logo_url: string | null
          header_text: string | null
          footer_text: string | null
          show_address: boolean | null
          show_phone: boolean | null
          show_email: boolean | null
          show_tax_number: boolean | null
          paper_size: string | null
          font_size: string | null
          show_qr_code: boolean | null
          currency_symbol: string | null
          show_tax: boolean | null
          tax_rate: number | null
          tax_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          show_logo?: boolean | null
          logo_url?: string | null
          header_text?: string | null
          footer_text?: string | null
          show_address?: boolean | null
          show_phone?: boolean | null
          show_email?: boolean | null
          show_tax_number?: boolean | null
          paper_size?: string | null
          font_size?: string | null
          show_qr_code?: boolean | null
          currency_symbol?: string | null
          show_tax?: boolean | null
          tax_rate?: number | null
          tax_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          show_logo?: boolean | null
          logo_url?: string | null
          header_text?: string | null
          footer_text?: string | null
          show_address?: boolean | null
          show_phone?: boolean | null
          show_email?: boolean | null
          show_tax_number?: boolean | null
          paper_size?: string | null
          font_size?: string | null
          show_qr_code?: boolean | null
          currency_symbol?: string | null
          show_tax?: boolean | null
          tax_rate?: number | null
          tax_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
