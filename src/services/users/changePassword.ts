import { supabase } from "@/integrations/supabase/client";

/**
 * Change the current user's password by calling the
 * Supabase Edge Function `change-password`.
 *
 * @throws Error when the function returns an error.
 */
export async function changePassword(args: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const { error } = await supabase.functions.invoke("change-password", {
    body: {
      currentPassword: args.currentPassword,
      newPassword: args.newPassword,
    },
  });

  if (error) {
    throw new Error(error.message ?? "Unable to change password");
  }
}
