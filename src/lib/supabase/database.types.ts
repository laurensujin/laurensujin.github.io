export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          college: string
          created_at: string
          degree: string
          graduation: string
          id: string
          major: string
          school: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          college?: string
          created_at?: string
          degree?: string
          graduation?: string
          id?: string
          major?: string
          school?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          college?: string
          created_at?: string
          degree?: string
          graduation?: string
          id?: string
          major?: string
          school?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string
          created_at: string
          height: number | null
          id: string
          kind: string
          mime_type: string
          original_filename: string | null
          path: string
          size_bytes: number
          title: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string
          created_at?: string
          height?: number | null
          id?: string
          kind: string
          mime_type: string
          original_filename?: string | null
          path: string
          size_bytes?: number
          title?: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string
          created_at?: string
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string
          original_filename?: string | null
          path?: string
          size_bytes?: number
          title?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      photography_sets: {
        Row: {
          after_image: Json | null
          before_image: Json | null
          caption: string
          created_at: string
          id: string
          photographer_credit: string
          retouching_credit: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          after_image?: Json | null
          before_image?: Json | null
          caption?: string
          created_at?: string
          id?: string
          photographer_credit?: string
          retouching_credit?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          after_image?: Json | null
          before_image?: Json | null
          caption?: string
          created_at?: string
          id?: string
          photographer_credit?: string
          retouching_credit?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          about: string
          id: number
          image: Json | null
          location: string
          name: string
          title: string
          updated_at: string
        }
        Insert: {
          about?: string
          id?: number
          image?: Json | null
          location?: string
          name?: string
          title?: string
          updated_at?: string
        }
        Update: {
          about?: string
          id?: number
          image?: Json | null
          location?: string
          name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_drafts: {
        Row: {
          content: Json
          project_id: string
          updated_at: string
        }
        Insert: {
          content?: Json
          project_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_drafts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_featured: boolean
          published_at: string | null
          slug: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          slug?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      resume_files: {
        Row: {
          created_at: string
          filename: string
          id: string
          is_active: boolean
          path: string
          size_bytes: number
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          is_active?: boolean
          path: string
          size_bytes?: number
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          is_active?: boolean
          path?: string
          size_bytes?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_email: string
          favicon: Json | null
          footer_copyright: string
          footer_credit: string
          footer_location: string
          hero_cta_label: string
          hero_description: string
          hero_headline: string
          hero_location: string
          id: number
          og_image: Json | null
          photography_description: string
          photography_label: string
          photography_subtitle: string
          selected_work_label: string
          seo_description: string
          seo_title: string
          site_name: string
          updated_at: string
        }
        Insert: {
          contact_email?: string
          favicon?: Json | null
          footer_copyright?: string
          footer_credit?: string
          footer_location?: string
          hero_cta_label?: string
          hero_description?: string
          hero_headline?: string
          hero_location?: string
          id?: number
          og_image?: Json | null
          photography_description?: string
          photography_label?: string
          photography_subtitle?: string
          selected_work_label?: string
          seo_description?: string
          seo_title?: string
          site_name?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string
          favicon?: Json | null
          footer_copyright?: string
          footer_credit?: string
          footer_location?: string
          hero_cta_label?: string
          hero_description?: string
          hero_headline?: string
          hero_location?: string
          id?: number
          og_image?: Json | null
          photography_description?: string
          photography_label?: string
          photography_subtitle?: string
          selected_work_label?: string
          seo_description?: string
          seo_title?: string
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          show_in_footer: boolean
          show_in_profile: boolean
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          show_in_footer?: boolean
          show_in_profile?: boolean
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          show_in_footer?: boolean
          show_in_profile?: boolean
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      reorder_photography_sets: { Args: { ids: string[] }; Returns: undefined }
      reorder_projects: { Args: { ids: string[] }; Returns: undefined }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

