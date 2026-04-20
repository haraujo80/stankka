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
      bacen_rates: {
        Row: {
          id: string
          product_type: Database["public"]["Enums"]["debt_product_type"]
          rate_monthly: number
          rate_yearly: number
          reference_period: string
          source: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_type: Database["public"]["Enums"]["debt_product_type"]
          rate_monthly: number
          rate_yearly: number
          reference_period: string
          source?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_type?: Database["public"]["Enums"]["debt_product_type"]
          rate_monthly?: number
          rate_yearly?: number
          reference_period?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          id: string
          institution_name: string
          status: string
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          id?: string
          institution_name: string
          status?: string
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          id?: string
          institution_name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      case_documents: {
        Row: {
          case_id: string
          content: string
          document_type: Database["public"]["Enums"]["kit_document_type"]
          generated_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          document_type: Database["public"]["Enums"]["kit_document_type"]
          generated_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          document_type?: Database["public"]["Enums"]["kit_document_type"]
          generated_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_events: {
        Row: {
          case_id: string
          description: string
          event_type: string
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          description: string
          event_type: string
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          description?: string
          event_type?: string
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          closed_at: string | null
          created_at: string
          debt_id: string
          id: string
          opened_at: string
          outcome_charges_reversed: number | null
          outcome_notes: string | null
          outcome_reduction_pct: number | null
          paid_at: string | null
          payment_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          recommended_channel: string | null
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          debt_id: string
          id?: string
          opened_at?: string
          outcome_charges_reversed?: number | null
          outcome_notes?: string | null
          outcome_reduction_pct?: number | null
          paid_at?: string | null
          payment_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recommended_channel?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          debt_id?: string
          id?: string
          opened_at?: string
          outcome_charges_reversed?: number | null
          outcome_notes?: string | null
          outcome_reduction_pct?: number | null
          paid_at?: string | null
          payment_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recommended_channel?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          cet_monthly: number | null
          contract_date: string | null
          contractual_rate_monthly: number | null
          created_at: string
          creditor: string
          default_since: string | null
          document_url: string | null
          flag: Database["public"]["Enums"]["debt_flag"] | null
          flag_reason: string | null
          id: string
          is_negativada: boolean
          monthly_installment: number | null
          notes: string | null
          original_principal: number | null
          outstanding_balance: number
          paid_installments: number | null
          product_type: Database["public"]["Enums"]["debt_product_type"]
          source: Database["public"]["Enums"]["debt_source"]
          total_installments: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cet_monthly?: number | null
          contract_date?: string | null
          contractual_rate_monthly?: number | null
          created_at?: string
          creditor: string
          default_since?: string | null
          document_url?: string | null
          flag?: Database["public"]["Enums"]["debt_flag"] | null
          flag_reason?: string | null
          id?: string
          is_negativada?: boolean
          monthly_installment?: number | null
          notes?: string | null
          original_principal?: number | null
          outstanding_balance: number
          paid_installments?: number | null
          product_type: Database["public"]["Enums"]["debt_product_type"]
          source?: Database["public"]["Enums"]["debt_source"]
          total_installments?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cet_monthly?: number | null
          contract_date?: string | null
          contractual_rate_monthly?: number | null
          created_at?: string
          creditor?: string
          default_since?: string | null
          document_url?: string | null
          flag?: Database["public"]["Enums"]["debt_flag"] | null
          flag_reason?: string | null
          id?: string
          is_negativada?: boolean
          monthly_installment?: number | null
          notes?: string | null
          original_principal?: number | null
          outstanding_balance?: number
          paid_installments?: number | null
          product_type?: Database["public"]["Enums"]["debt_product_type"]
          source?: Database["public"]["Enums"]["debt_source"]
          total_installments?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          dependents: number | null
          full_name: string | null
          id: string
          monthly_income: number | null
          onboarding_complete: boolean
          phone: string | null
          uf: string | null
          updated_at: string
          work_type: Database["public"]["Enums"]["work_type"] | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          dependents?: number | null
          full_name?: string | null
          id: string
          monthly_income?: number | null
          onboarding_complete?: boolean
          phone?: string | null
          uf?: string | null
          updated_at?: string
          work_type?: Database["public"]["Enums"]["work_type"] | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          dependents?: number | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          onboarding_complete?: boolean
          phone?: string | null
          uf?: string | null
          updated_at?: string
          work_type?: Database["public"]["Enums"]["work_type"] | null
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          purpose: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          granted: boolean
          granted_at?: string | null
          id?: string
          purpose: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          purpose?: string
          revoked_at?: string | null
          user_id?: string
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
      case_status:
        | "aberto"
        | "em_analise"
        | "resposta_recebida"
        | "concluido"
        | "escalado"
        | "recusado"
      debt_flag: "green" | "yellow" | "red"
      debt_product_type:
        | "cartao_credito_rotativo"
        | "cartao_credito_parcelado"
        | "cheque_especial"
        | "credito_pessoal"
        | "consignado_inss"
        | "consignado_publico"
        | "consignado_privado"
        | "financiamento_veiculo"
        | "financiamento_imobiliario"
        | "emprestimo_garantia"
        | "cartao_beneficio"
        | "bnpl"
        | "fatura_servico"
        | "outro"
      debt_source: "manual" | "upload" | "openfinance"
      kit_document_type:
        | "negotiation_letter"
        | "consumidor_gov"
        | "bcb_rdr"
        | "procon"
        | "contraproposta_14181"
        | "jec_petition"
      payment_status: "pendente" | "pago" | "falhou" | "estornado"
      work_type:
        | "clt"
        | "autonomo"
        | "aposentado"
        | "servidor"
        | "desempregado"
        | "outro"
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
    Enums: {
      case_status: [
        "aberto",
        "em_analise",
        "resposta_recebida",
        "concluido",
        "escalado",
        "recusado",
      ],
      debt_flag: ["green", "yellow", "red"],
      debt_product_type: [
        "cartao_credito_rotativo",
        "cartao_credito_parcelado",
        "cheque_especial",
        "credito_pessoal",
        "consignado_inss",
        "consignado_publico",
        "consignado_privado",
        "financiamento_veiculo",
        "financiamento_imobiliario",
        "emprestimo_garantia",
        "cartao_beneficio",
        "bnpl",
        "fatura_servico",
        "outro",
      ],
      debt_source: ["manual", "upload", "openfinance"],
      kit_document_type: [
        "negotiation_letter",
        "consumidor_gov",
        "bcb_rdr",
        "procon",
        "contraproposta_14181",
        "jec_petition",
      ],
      payment_status: ["pendente", "pago", "falhou", "estornado"],
      work_type: [
        "clt",
        "autonomo",
        "aposentado",
        "servidor",
        "desempregado",
        "outro",
      ],
    },
  },
} as const
