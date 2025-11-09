import { supabase } from "./supabaseClient";

/**
 * Check if the current user is an approved member
 */
export const isApprovedMember = async (userId) => {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("member_credentials")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "approved")
    .single();

  if (error) {
    // If no record found or other error, user is not approved
    return false;
  }

  return !!data;
};

/**
 * Get member credentials for a user
 */
export const getMemberCredentials = async (userId) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("member_credentials")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return null;
  }

  return data;
};
