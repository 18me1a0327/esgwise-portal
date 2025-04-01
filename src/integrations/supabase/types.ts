export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      emission_factors: {
        Row: {
          category: string
          created_at: string
          factor_2023: number
          factor_2024: number
          factor_2025: number
          id: string
          item: string
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          factor_2023: number
          factor_2024: number
          factor_2025: number
          id?: string
          item: string
          unit_of_measure: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          factor_2023?: number
          factor_2024?: number
          factor_2025?: number
          id?: string
          item?: string
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: []
      }
      environmental_data: {
        Row: {
          bio_medical: number | null
          co2_refilled: number | null
          coal_consumption: number | null
          coal_emissions: number | null
          created_at: string
          e_waste: number | null
          electricity_emissions: number | null
          furnace_oil_consumption: number | null
          furnace_oil_emissions: number | null
          hap: number | null
          hazardous_coprocessed: number | null
          hazardous_incinerated: number | null
          hazardous_landfill: number | null
          hsd_consumption: number | null
          hsd_emissions: number | null
          i_recs: number | null
          id: string
          non_hazardous: number | null
          nox: number | null
          petrol_consumption: number | null
          petrol_emissions: number | null
          plastic_waste: number | null
          pm: number | null
          pop: number | null
          r134a_refrigerant: number | null
          r22_refrigerant: number | null
          r32_refrigerant: number | null
          r410_refrigerant: number | null
          r514a_refrigerant: number | null
          rainwater: number | null
          recycled_wastewater: number | null
          renewable_ppa: number | null
          renewable_rooftop: number | null
          sox: number | null
          submission_id: string
          third_party_water: number | null
          total_electricity: number | null
          total_emissions: number | null
          total_hazardous: number | null
          total_waste: number | null
          updated_at: string
          voc: number | null
          waste_oil: number | null
          wastewater_generated: number | null
          water_discharged: number | null
          water_withdrawal: number | null
        }
        Insert: {
          bio_medical?: number | null
          co2_refilled?: number | null
          coal_consumption?: number | null
          coal_emissions?: number | null
          created_at?: string
          e_waste?: number | null
          electricity_emissions?: number | null
          furnace_oil_consumption?: number | null
          furnace_oil_emissions?: number | null
          hap?: number | null
          hazardous_coprocessed?: number | null
          hazardous_incinerated?: number | null
          hazardous_landfill?: number | null
          hsd_consumption?: number | null
          hsd_emissions?: number | null
          i_recs?: number | null
          id?: string
          non_hazardous?: number | null
          nox?: number | null
          petrol_consumption?: number | null
          petrol_emissions?: number | null
          plastic_waste?: number | null
          pm?: number | null
          pop?: number | null
          r134a_refrigerant?: number | null
          r22_refrigerant?: number | null
          r32_refrigerant?: number | null
          r410_refrigerant?: number | null
          r514a_refrigerant?: number | null
          rainwater?: number | null
          recycled_wastewater?: number | null
          renewable_ppa?: number | null
          renewable_rooftop?: number | null
          sox?: number | null
          submission_id: string
          third_party_water?: number | null
          total_electricity?: number | null
          total_emissions?: number | null
          total_hazardous?: number | null
          total_waste?: number | null
          updated_at?: string
          voc?: number | null
          waste_oil?: number | null
          wastewater_generated?: number | null
          water_discharged?: number | null
          water_withdrawal?: number | null
        }
        Update: {
          bio_medical?: number | null
          co2_refilled?: number | null
          coal_consumption?: number | null
          coal_emissions?: number | null
          created_at?: string
          e_waste?: number | null
          electricity_emissions?: number | null
          furnace_oil_consumption?: number | null
          furnace_oil_emissions?: number | null
          hap?: number | null
          hazardous_coprocessed?: number | null
          hazardous_incinerated?: number | null
          hazardous_landfill?: number | null
          hsd_consumption?: number | null
          hsd_emissions?: number | null
          i_recs?: number | null
          id?: string
          non_hazardous?: number | null
          nox?: number | null
          petrol_consumption?: number | null
          petrol_emissions?: number | null
          plastic_waste?: number | null
          pm?: number | null
          pop?: number | null
          r134a_refrigerant?: number | null
          r22_refrigerant?: number | null
          r32_refrigerant?: number | null
          r410_refrigerant?: number | null
          r514a_refrigerant?: number | null
          rainwater?: number | null
          recycled_wastewater?: number | null
          renewable_ppa?: number | null
          renewable_rooftop?: number | null
          sox?: number | null
          submission_id?: string
          third_party_water?: number | null
          total_electricity?: number | null
          total_emissions?: number | null
          total_hazardous?: number | null
          total_waste?: number | null
          updated_at?: string
          voc?: number | null
          waste_oil?: number | null
          wastewater_generated?: number | null
          water_discharged?: number | null
          water_withdrawal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "environmental_data_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "esg_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_submissions: {
        Row: {
          id: string
          period_end: string
          period_start: string
          review_comment: string | null
          reviewed_at: string | null
          reviewer: string | null
          site_id: string
          status: string
          submitted_at: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_end: string
          period_start: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewer?: string | null
          site_id: string
          status?: string
          submitted_at?: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_end?: string
          period_start?: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewer?: string | null
          site_id?: string
          status?: string
          submitted_at?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_submissions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_data: {
        Row: {
          board_30to50: number | null
          board_above50: number | null
          board_members: number | null
          board_under30: number | null
          corruption_incidents: number | null
          created_at: string
          cybersecurity_incidents: number | null
          exp_5to10: number | null
          exp_above10: number | null
          exp_under5: number | null
          id: string
          legal_fines: number | null
          submission_id: string
          updated_at: string
          women_percentage: number | null
        }
        Insert: {
          board_30to50?: number | null
          board_above50?: number | null
          board_members?: number | null
          board_under30?: number | null
          corruption_incidents?: number | null
          created_at?: string
          cybersecurity_incidents?: number | null
          exp_5to10?: number | null
          exp_above10?: number | null
          exp_under5?: number | null
          id?: string
          legal_fines?: number | null
          submission_id: string
          updated_at?: string
          women_percentage?: number | null
        }
        Update: {
          board_30to50?: number | null
          board_above50?: number | null
          board_members?: number | null
          board_under30?: number | null
          corruption_incidents?: number | null
          created_at?: string
          cybersecurity_incidents?: number | null
          exp_5to10?: number | null
          exp_above10?: number | null
          exp_under5?: number | null
          id?: string
          legal_fines?: number | null
          submission_id?: string
          updated_at?: string
          women_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_data_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "esg_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      parameters: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          subcategory_id: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          subcategory_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          subcategory_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parameters_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parameters_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      social_data: {
        Row: {
          accident_insurance: number | null
          attrition: number | null
          consumer_complaints: number | null
          contract_female: number | null
          contract_male: number | null
          created_at: string
          ehs_training: number | null
          esi_coverage: number | null
          fatalities_employees: number | null
          fatalities_workers: number | null
          female_employees: number | null
          female_wages_percentage: number | null
          gmp_training: number | null
          gratuity_coverage: number | null
          health_insurance: number | null
          id: string
          injuries_employees: number | null
          injuries_workers: number | null
          male_employees: number | null
          manhours_employees: number | null
          manhours_workers: number | null
          median_female_salary: number | null
          median_male_salary: number | null
          new_hires: number | null
          other_training: number | null
          parental_benefits: number | null
          performance_reviews: number | null
          pf_coverage: number | null
          reportable_employees: number | null
          reportable_workers: number | null
          submission_id: string
          total_employees: number | null
          updated_at: string
          workplace_complaints: number | null
        }
        Insert: {
          accident_insurance?: number | null
          attrition?: number | null
          consumer_complaints?: number | null
          contract_female?: number | null
          contract_male?: number | null
          created_at?: string
          ehs_training?: number | null
          esi_coverage?: number | null
          fatalities_employees?: number | null
          fatalities_workers?: number | null
          female_employees?: number | null
          female_wages_percentage?: number | null
          gmp_training?: number | null
          gratuity_coverage?: number | null
          health_insurance?: number | null
          id?: string
          injuries_employees?: number | null
          injuries_workers?: number | null
          male_employees?: number | null
          manhours_employees?: number | null
          manhours_workers?: number | null
          median_female_salary?: number | null
          median_male_salary?: number | null
          new_hires?: number | null
          other_training?: number | null
          parental_benefits?: number | null
          performance_reviews?: number | null
          pf_coverage?: number | null
          reportable_employees?: number | null
          reportable_workers?: number | null
          submission_id: string
          total_employees?: number | null
          updated_at?: string
          workplace_complaints?: number | null
        }
        Update: {
          accident_insurance?: number | null
          attrition?: number | null
          consumer_complaints?: number | null
          contract_female?: number | null
          contract_male?: number | null
          created_at?: string
          ehs_training?: number | null
          esi_coverage?: number | null
          fatalities_employees?: number | null
          fatalities_workers?: number | null
          female_employees?: number | null
          female_wages_percentage?: number | null
          gmp_training?: number | null
          gratuity_coverage?: number | null
          health_insurance?: number | null
          id?: string
          injuries_employees?: number | null
          injuries_workers?: number | null
          male_employees?: number | null
          manhours_employees?: number | null
          manhours_workers?: number | null
          median_female_salary?: number | null
          median_male_salary?: number | null
          new_hires?: number | null
          other_training?: number | null
          parental_benefits?: number | null
          performance_reviews?: number | null
          pf_coverage?: number | null
          reportable_employees?: number | null
          reportable_workers?: number | null
          submission_id?: string
          total_employees?: number | null
          updated_at?: string
          workplace_complaints?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_data_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "esg_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
