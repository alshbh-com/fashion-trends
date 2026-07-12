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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: string | null
          id: string
          section: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          section?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          section?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      admin_user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string | null
          permission_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission?: string | null
          permission_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string | null
          permission_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          password: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          password?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          password?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      agent_daily_closings: {
        Row: {
          closed_by: string | null
          closed_by_username: string | null
          closing_date: string
          created_at: string
          delivery_agent_id: string | null
          id: string
          net_amount: number
          notes: string | null
        }
        Insert: {
          closed_by?: string | null
          closed_by_username?: string | null
          closing_date: string
          created_at?: string
          delivery_agent_id?: string | null
          id?: string
          net_amount?: number
          notes?: string | null
        }
        Update: {
          closed_by?: string | null
          closed_by_username?: string | null
          closing_date?: string
          created_at?: string
          delivery_agent_id?: string | null
          id?: string
          net_amount?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_daily_closings_delivery_agent_id_fkey"
            columns: ["delivery_agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_payments: {
        Row: {
          amount: number
          created_at: string
          delivery_agent_id: string | null
          id: string
          notes: string | null
          order_id: string | null
          payment_date: string | null
          payment_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          delivery_agent_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          delivery_agent_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_payments_delivery_agent_id_fkey"
            columns: ["delivery_agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string
          metadata: Json | null
          product_id: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          active_template: string | null
          active_theme: string | null
          custom_settings: Json | null
          id: string
          invoice_name: string | null
          platform_name: string | null
          theme_mode: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          active_template?: string | null
          active_theme?: string | null
          custom_settings?: Json | null
          id?: string
          invoice_name?: string | null
          platform_name?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          active_template?: string | null
          active_theme?: string | null
          custom_settings?: Json | null
          id?: string
          invoice_name?: string | null
          platform_name?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cashbox: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string | null
          opening_balance: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          opening_balance?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          opening_balance?: number | null
        }
        Relationships: []
      }
      cashbox_transactions: {
        Row: {
          amount: number
          cashbox_id: string | null
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          reason: string | null
          type: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          amount?: number
          cashbox_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reason?: string | null
          type: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          amount?: number
          cashbox_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reason?: string | null
          type?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cashbox_transactions_cashbox_id_fkey"
            columns: ["cashbox_id"]
            isOneToOne: false
            referencedRelation: "cashbox"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          governorate: string | null
          id: string
          name: string | null
          phone: string | null
          phone2: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          governorate?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          phone2?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          governorate?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          phone2?: string | null
        }
        Relationships: []
      }
      delivery_agents: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          serial_number: string | null
          total_owed: number | null
          total_paid: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          serial_number?: string | null
          total_owed?: number | null
          total_paid?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          serial_number?: string | null
          total_owed?: number | null
          total_paid?: number | null
        }
        Relationships: []
      }
      governorates: {
        Row: {
          agent_shipping_cost: number | null
          created_at: string | null
          id: string
          name: string | null
          shipping_cost: number | null
        }
        Insert: {
          agent_shipping_cost?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          shipping_cost?: number | null
        }
        Update: {
          agent_shipping_cost?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          shipping_cost?: number | null
        }
        Relationships: []
      }
      offices: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string | null
          watermark_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string | null
          watermark_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string | null
          watermark_name?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          order_id: string | null
          price: number | null
          product_details: string | null
          product_id: string | null
          quantity: number | null
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_details?: string | null
          product_id?: string | null
          quantity?: number | null
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_details?: string | null
          product_id?: string | null
          quantity?: number | null
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          changed_by_username: string | null
          created_at: string | null
          id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
          order_id: string | null
          source: string | null
        }
        Insert: {
          changed_by?: string | null
          changed_by_username?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
          source?: string | null
        }
        Update: {
          changed_by?: string | null
          changed_by_username?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          order_id?: string | null
          source?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          agent_shipping_cost: number | null
          assigned_at: string | null
          barcode_value: string | null
          created_at: string | null
          customer_id: string | null
          delivery_agent_id: string | null
          discount: number | null
          governorate_id: string | null
          id: string
          modified_amount: string | null
          notes: string | null
          order_details: string | null
          order_number: number | null
          qr_value: string | null
          shipping_cost: number | null
          status: string | null
          total_amount: number | null
          tracking_code: string | null
          updated_at: string | null
        }
        Insert: {
          agent_shipping_cost?: number | null
          assigned_at?: string | null
          barcode_value?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_agent_id?: string | null
          discount?: number | null
          governorate_id?: string | null
          id?: string
          modified_amount?: string | null
          notes?: string | null
          order_details?: string | null
          order_number?: number | null
          qr_value?: string | null
          shipping_cost?: number | null
          status?: string | null
          total_amount?: number | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_shipping_cost?: number | null
          assigned_at?: string | null
          barcode_value?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_agent_id?: string | null
          discount?: number | null
          governorate_id?: string | null
          id?: string
          modified_amount?: string | null
          notes?: string | null
          order_details?: string | null
          order_number?: number | null
          qr_value?: string | null
          shipping_cost?: number | null
          status?: string | null
          total_amount?: number | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_agent_id_fkey"
            columns: ["delivery_agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_color_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          product_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          product_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_color_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          color_options: Json | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          description_en: string | null
          details: string | null
          discount_price: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_offer: boolean | null
          low_stock_threshold: number | null
          name: string | null
          name_ar: string | null
          name_en: string | null
          offer_price: number | null
          price: number | null
          quantity_pricing: Json | null
          rating: number | null
          reviews_count: number | null
          size_options: Json | null
          size_pricing: Json | null
          stock: number | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          color_options?: Json | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          details?: string | null
          discount_price?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_offer?: boolean | null
          low_stock_threshold?: number | null
          name?: string | null
          name_ar?: string | null
          name_en?: string | null
          offer_price?: number | null
          price?: number | null
          quantity_pricing?: Json | null
          rating?: number | null
          reviews_count?: number | null
          size_options?: Json | null
          size_pricing?: Json | null
          stock?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          color_options?: Json | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          details?: string | null
          discount_price?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_offer?: boolean | null
          low_stock_threshold?: number | null
          name?: string | null
          name_ar?: string | null
          name_en?: string | null
          offer_price?: number | null
          price?: number | null
          quantity_pricing?: Json | null
          rating?: number | null
          reviews_count?: number | null
          size_options?: Json | null
          size_pricing?: Json | null
          stock?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          created_at: string
          customer_id: string | null
          delivery_agent_id: string | null
          id: string
          notes: string | null
          order_id: string | null
          return_amount: number
          returned_items: Json | null
          shipping_deduction: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery_agent_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          return_amount?: number
          returned_items?: Json | null
          shipping_deduction?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery_agent_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          return_amount?: number
          returned_items?: Json | null
          shipping_deduction?: number
        }
        Relationships: [
          {
            foreignKeyName: "returns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_delivery_agent_id_fkey"
            columns: ["delivery_agent_id"]
            isOneToOne: false
            referencedRelation: "delivery_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          id: string
          new_value: string | null
          old_value: string | null
          order_id: string | null
          session_id: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          order_id?: string | null
          session_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          order_id?: string | null
          session_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      scan_session_items: {
        Row: {
          id: string
          order_id: string | null
          scanned_at: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          scanned_at?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          scanned_at?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_session_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_session_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_sessions: {
        Row: {
          ended_at: string | null
          id: string
          started_at: string
          status: string
          total_scanned: number
          user_id: string | null
          username: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          total_scanned?: number
          user_id?: string | null
          username?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          total_scanned?: number
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      statistics: {
        Row: {
          id: string
          last_reset: string | null
          total_orders: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_reset?: string | null
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_reset?: string | null
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_passwords: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          password: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          password?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          password?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      treasury: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          type: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_activity_logs: { Args: never; Returns: number }
      reset_order_sequence: { Args: never; Returns: undefined }
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
