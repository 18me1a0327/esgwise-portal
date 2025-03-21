
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
  
  return data || [];
};

export const createUser = async (user: Omit<User, "id" | "created_at">): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }
  
  return data;
};

export const updateUser = async (id: string, user: Partial<Omit<User, "id" | "created_at">>): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating user:", error);
    throw error;
  }
  
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
