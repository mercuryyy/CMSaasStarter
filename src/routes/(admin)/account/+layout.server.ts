// src/routes/(admin)/account/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();

  if (!session) {
    throw redirect(303, "/login");
  }

  const { data: profile } = await locals.supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return { session, profile, supabase: locals.supabase };
};
