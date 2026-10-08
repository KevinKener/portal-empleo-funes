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
      categorias: {
        Row: {
          created_at: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      cursos: {
        Row: {
          created_at: string
          descripcion: string | null
          enlace: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          enlace?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          enlace?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      derivaciones: {
        Row: {
          created_at: string
          curso_id: string
          fecha: string
          id: string
          postulante_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          fecha?: string
          id?: string
          postulante_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          fecha?: string
          id?: string
          postulante_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "derivaciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "derivaciones_postulante_id_fkey"
            columns: ["postulante_id"]
            isOneToOne: false
            referencedRelation: "postulantes"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          constancia_arca_url: string | null
          created_at: string
          cuit: string
          direccion: string
          estado: Database["public"]["Enums"]["estado_verificacion"]
          id: string
          nombre_comercial: string
          perfil_id: string
          razon_social: string
          telefono: string
          updated_at: string
        }
        Insert: {
          constancia_arca_url?: string | null
          created_at?: string
          cuit: string
          direccion: string
          estado?: Database["public"]["Enums"]["estado_verificacion"]
          id?: string
          nombre_comercial: string
          perfil_id: string
          razon_social: string
          telefono: string
          updated_at?: string
        }
        Update: {
          constancia_arca_url?: string | null
          created_at?: string
          cuit?: string
          direccion?: string
          estado?: Database["public"]["Enums"]["estado_verificacion"]
          id?: string
          nombre_comercial?: string
          perfil_id?: string
          razon_social?: string
          telefono?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas: {
        Row: {
          categoria_id: string
          created_at: string
          descripcion: string
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_oferta"]
          fecha_publicacion: string | null
          id: string
          jornada: Database["public"]["Enums"]["jornada"]
          motivo_rechazo: string | null
          requisitos: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          descripcion: string
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_oferta"]
          fecha_publicacion?: string | null
          id?: string
          jornada: Database["public"]["Enums"]["jornada"]
          motivo_rechazo?: string | null
          requisitos?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          descripcion?: string
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_oferta"]
          fecha_publicacion?: string | null
          id?: string
          jornada?: Database["public"]["Enums"]["jornada"]
          motivo_rechazo?: string | null
          requisitos?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          created_at: string
          id: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          updated_at?: string
        }
        Relationships: []
      }
      postulaciones: {
        Row: {
          created_at: string
          decision_empresa:
            | Database["public"]["Enums"]["decision_empresa"]
            | null
          estado: Database["public"]["Enums"]["estado_postulacion"]
          fecha_preseleccion: string | null
          id: string
          motivo_rechazo:
            | Database["public"]["Enums"]["motivo_rechazo_postulacion"]
            | null
          notas_admin: string | null
          oferta_id: string
          postulante_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_empresa?:
            | Database["public"]["Enums"]["decision_empresa"]
            | null
          estado?: Database["public"]["Enums"]["estado_postulacion"]
          fecha_preseleccion?: string | null
          id?: string
          motivo_rechazo?:
            | Database["public"]["Enums"]["motivo_rechazo_postulacion"]
            | null
          notas_admin?: string | null
          oferta_id: string
          postulante_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_empresa?:
            | Database["public"]["Enums"]["decision_empresa"]
            | null
          estado?: Database["public"]["Enums"]["estado_postulacion"]
          fecha_preseleccion?: string | null
          id?: string
          motivo_rechazo?:
            | Database["public"]["Enums"]["motivo_rechazo_postulacion"]
            | null
          notas_admin?: string | null
          oferta_id?: string
          postulante_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "postulaciones_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulaciones_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas_publicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulaciones_postulante_id_fkey"
            columns: ["postulante_id"]
            isOneToOne: false
            referencedRelation: "postulantes"
            referencedColumns: ["id"]
          },
        ]
      }
      postulante_categorias: {
        Row: {
          categoria_id: string
          created_at: string
          id: string
          postulante_id: string
          updated_at: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          id?: string
          postulante_id: string
          updated_at?: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          id?: string
          postulante_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "postulante_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulante_categorias_postulante_id_fkey"
            columns: ["postulante_id"]
            isOneToOne: false
            referencedRelation: "postulantes"
            referencedColumns: ["id"]
          },
        ]
      }
      postulantes: {
        Row: {
          apellido: string
          comprobante_url: string | null
          created_at: string
          cv_url: string | null
          descripcion: string | null
          direccion: string
          dni: string
          estado_domicilio: Database["public"]["Enums"]["estado_verificacion"]
          id: string
          localidad: Database["public"]["Enums"]["localidad"]
          nombre: string
          perfil_id: string
          telefono: string
          updated_at: string
        }
        Insert: {
          apellido: string
          comprobante_url?: string | null
          created_at?: string
          cv_url?: string | null
          descripcion?: string | null
          direccion: string
          dni: string
          estado_domicilio?: Database["public"]["Enums"]["estado_verificacion"]
          id?: string
          localidad: Database["public"]["Enums"]["localidad"]
          nombre: string
          perfil_id: string
          telefono: string
          updated_at?: string
        }
        Update: {
          apellido?: string
          comprobante_url?: string | null
          created_at?: string
          cv_url?: string | null
          descripcion?: string | null
          direccion?: string
          dni?: string
          estado_domicilio?: Database["public"]["Enums"]["estado_verificacion"]
          id?: string
          localidad?: Database["public"]["Enums"]["localidad"]
          nombre?: string
          perfil_id?: string
          telefono?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "postulantes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seguimientos: {
        Row: {
          created_at: string
          fecha: string
          id: string
          notas: string | null
          postulacion_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          postulacion_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fecha?: string
          id?: string
          notas?: string | null
          postulacion_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seguimientos_postulacion_id_fkey"
            columns: ["postulacion_id"]
            isOneToOne: false
            referencedRelation: "candidatos_empresa"
            referencedColumns: ["postulacion_id"]
          },
          {
            foreignKeyName: "seguimientos_postulacion_id_fkey"
            columns: ["postulacion_id"]
            isOneToOne: false
            referencedRelation: "postulaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimientos_postulacion_id_fkey"
            columns: ["postulacion_id"]
            isOneToOne: false
            referencedRelation: "postulaciones_admin"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      candidatos_empresa: {
        Row: {
          apellido: string | null
          categorias: string[] | null
          cv_url: string | null
          decision_empresa:
            | Database["public"]["Enums"]["decision_empresa"]
            | null
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_postulacion"] | null
          fecha_preseleccion: string | null
          localidad: Database["public"]["Enums"]["localidad"] | null
          motivo_rechazo:
            | Database["public"]["Enums"]["motivo_rechazo_postulacion"]
            | null
          nombre: string | null
          oferta_id: string | null
          postulacion_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postulaciones_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulaciones_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas_publicas"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas_publicas: {
        Row: {
          categoria_id: string | null
          categoria_nombre: string | null
          descripcion: string | null
          empresa_nombre: string | null
          fecha_publicacion: string | null
          id: string | null
          jornada: Database["public"]["Enums"]["jornada"] | null
          requisitos: string | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      postulaciones_admin: {
        Row: {
          created_at: string | null
          decision_empresa:
            | Database["public"]["Enums"]["decision_empresa"]
            | null
          estado: Database["public"]["Enums"]["estado_postulacion"] | null
          fecha_preseleccion: string | null
          id: string | null
          motivo_rechazo:
            | Database["public"]["Enums"]["motivo_rechazo_postulacion"]
            | null
          notas_admin: string | null
          oferta_id: string | null
          postulante_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decision_empresa?:
            | Database["public"]["Enums"]["decision_empresa"]
            | null
          estado?: Database["public"]["Enums"]["estado_postulacion"] | null
          fecha_preseleccion?: string | null
          id?: string | null
          motivo_rechazo?:
            | Database["public"]["Enums"]["motivo_rechazo_postulacion"]
            | null
          notas_admin?: string | null
          oferta_id?: string | null
          postulante_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decision_empresa?:
            | Database["public"]["Enums"]["decision_empresa"]
            | null
          estado?: Database["public"]["Enums"]["estado_postulacion"] | null
          fecha_preseleccion?: string | null
          id?: string | null
          motivo_rechazo?:
            | Database["public"]["Enums"]["motivo_rechazo_postulacion"]
            | null
          notas_admin?: string | null
          oferta_id?: string | null
          postulante_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postulaciones_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulaciones_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas_publicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postulaciones_postulante_id_fkey"
            columns: ["postulante_id"]
            isOneToOne: false
            referencedRelation: "postulantes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      actua_como_admin: { Args: never; Returns: boolean }
      confirmar_seleccion: { Args: { p_oferta_id: string }; Returns: number }
      empresa_actual_id: { Args: never; Returns: string }
      empresa_actual_ve_postulante: {
        Args: { p_perfil_postulante: string }
        Returns: boolean
      }
      empresa_actual_verificada: { Args: never; Returns: boolean }
      es_admin: { Args: never; Returns: boolean }
      oferta_es_de_empresa_actual: {
        Args: { p_oferta_id: string }
        Returns: boolean
      }
      oferta_esta_publicada: { Args: { p_oferta_id: string }; Returns: boolean }
      postulante_actual_id: { Args: never; Returns: string }
      postulante_actual_postulo: {
        Args: { p_oferta_id: string }
        Returns: boolean
      }
    }
    Enums: {
      decision_empresa: "tomar" | "descartar"
      estado_oferta:
        | "borrador"
        | "pendiente"
        | "publicada"
        | "rechazada"
        | "cerrada"
      estado_postulacion:
        | "pendiente"
        | "preseleccionado"
        | "entrevista"
        | "contratado"
        | "rechazado"
      estado_verificacion: "pendiente" | "verificado" | "rechazado"
      jornada: "completa" | "media_jornada" | "por_horas" | "temporal"
      localidad: "funes" | "roldan" | "rosario" | "otra"
      motivo_rechazo_postulacion: "cupo_completo" | "no_seleccionado"
      rol_usuario: "postulante" | "empresa" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      decision_empresa: ["tomar", "descartar"],
      estado_oferta: [
        "borrador",
        "pendiente",
        "publicada",
        "rechazada",
        "cerrada",
      ],
      estado_postulacion: [
        "pendiente",
        "preseleccionado",
        "entrevista",
        "contratado",
        "rechazado",
      ],
      estado_verificacion: ["pendiente", "verificado", "rechazado"],
      jornada: ["completa", "media_jornada", "por_horas", "temporal"],
      localidad: ["funes", "roldan", "rosario", "otra"],
      motivo_rechazo_postulacion: ["cupo_completo", "no_seleccionado"],
      rol_usuario: ["postulante", "empresa", "admin"],
    },
  },
} as const
