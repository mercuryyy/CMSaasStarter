import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const { supabase, safeGetSession } = locals;
  const { session } = await safeGetSession();

  if (!session) {
    throw redirect(303, "/login");
  }

  console.log('Fetching assistants from database...');
  const { data: assistants, error, status, count } = await supabase
    .from("assistants")
    .select("*")
    .eq("user_id", session.user.id); // Match user_id with the logged-in user id

  if (error) {
    console.error('Error fetching assistants:', error.message);
    return { assistants: [] };
  }

  // console.log('Response status:', status);
  // console.log('Count of records fetched:', count);
  // console.log('Fetched assistants:', assistants);

  return { assistants: assistants || [] };
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
