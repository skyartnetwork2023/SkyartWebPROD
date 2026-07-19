import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // First, let Supabase process any auth callback parameters in the URL
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If no session yet, check if there are auth parameters to process
    if (!sessionData.session) {
      const params = new URLSearchParams(location.search);
      if (params.has("access_token") || params.has("code")) {
        // Supabase SDK should auto-process these, but let's give it a moment
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
