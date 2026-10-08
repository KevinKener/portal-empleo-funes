import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type Categoria = Pick<Tables<"categorias">, "id" | "nombre">

/**
 * Every category, alphabetically. Public data (anon has select on
 * categorias), used by the offers filter. Throws on database errors.
 */
export async function listarCategorias(): Promise<Categoria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categorias").select("id, nombre").order("nombre")

  if (error) throw new Error(`listarCategorias: ${error.message}`)
  return data
}
