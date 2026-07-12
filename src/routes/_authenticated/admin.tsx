import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getMyRoles } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-roles"],
    queryFn: () => getMyRoles(),
  });

  useEffect(() => {
    if (!isLoading && data && !data.canManage) {
      // no admin role
    }
  }, [isLoading, data]);

  if (isLoading) {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading admin…</div>;
  }
  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Card className="max-w-md p-6 text-center">
          <h1 className="font-display text-xl font-semibold">Couldn't load admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">{(error as Error).message}</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/auth" })}>Sign in again</Button>
        </Card>
      </div>
    );
  }
  if (!data?.canManage) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Card className="max-w-md p-6 text-center">
          <h1 className="font-display text-xl font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have an admin role. Ask a Super Admin to grant you access.
          </p>
          <Button className="mt-4" onClick={() => navigate({ to: "/" })}>Back to site</Button>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{data.roles.join(", ") || "user"}</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
