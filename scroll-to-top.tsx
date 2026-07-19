import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, FolderTree, Briefcase, FileText,
  MessageSquare, Mail, Users, Zap, LogOut, History, Layers, MailOpen,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const catalog = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/inquiries", label: "Product Inquiries", icon: MessageSquare },
];
const content = [
  { to: "/admin/content", label: "Site Content", icon: Layers },
];
const careers = [
  { to: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { to: "/admin/applications", label: "Applications", icon: FileText },
];
const inbox = [
  { to: "/admin/contact", label: "Contact Messages", icon: Mail },
  { to: "/admin/subscribers", label: "Newsletter", icon: MailOpen },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/audit", label: "Audit Log", icon: History },
];

export function AdminSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const nav = useNavigate();

  async function signOut() {
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // Continue with local cache cleanup even if remote sign-out fails.
    }

    // Clear any persisted Supabase auth tokens to avoid stale-session lock-in.
    if (typeof window !== "undefined") {
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith("sb-") && key.includes("auth-token")) {
          window.localStorage.removeItem(key);
        }
      }
    }

    toast.success("Signed out");
    nav({ to: "/auth", replace: true });
  }

  const renderGroup = (label: string, items: typeof catalog) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((i) => {
            const active = path === i.to || (i.to !== "/admin" && path.startsWith(i.to));
            return (
              <SidebarMenuItem key={i.to}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link to={i.to} className="flex items-center gap-2">
                    <i.icon className="h-4 w-4" />
                    {!collapsed && <span>{i.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2 px-2 py-1 font-display font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <Zap className="h-4 w-4" />
          </span>
          {!collapsed && <span>SkyArt Admin</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Catalog", catalog)}
        {renderGroup("Content", content)}
        {renderGroup("Careers", careers)}
        {renderGroup("Inbox", inbox)}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sign out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
