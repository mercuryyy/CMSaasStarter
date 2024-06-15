import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const { supabase, safeGetSession } = locals;
  const { session } = await safeGetSession();

  if (!session) {
    throw redirect(303, "/login");
  }

  console.log('Fetching assistants from database...');
  const { data: assistants, error } = await supabase.from("assistants").select("*");
  if (error) {
    console.error('Error fetching assistants:', error);
    return { assistants: [] };
  }

  console.log('Fetched assistants:', assistants);
  return { assistants };
};

export const actions = {
  signout: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) {
      await supabase.auth.signOut();
      throw redirect(303, "/");
    }
  },
};
