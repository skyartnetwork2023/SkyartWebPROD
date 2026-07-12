import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role as string);
    return {
      roles,
      isAdmin: roles.includes("super_admin") || roles.includes("admin"),
      canManage:
        roles.includes("super_admin") ||
        roles.includes("admin") ||
        roles.includes("content_manager"),
      isSuperAdmin: roles.includes("super_admin"),
    };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;

    const [
      products,
      productsPublished,
      productsFeatured,
      categories,
      jobsAll,
      jobsPublished,
      jobsDraft,
      inquiriesNew,
      contactNew,
      recentInquiries,
      recentApplications,
      recentContact,
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true).eq("status", "published"),
      supabase.from("product_categories").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("product_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("product_inquiries").select("id,name,product_name,created_at,status").order("created_at", { ascending: false }).limit(5),
      supabase.from("job_applications").select("id,full_name,job_id,created_at,status").order("created_at", { ascending: false }).limit(5),
      supabase.from("contact_messages").select("id,name,subject,created_at,status").order("created_at", { ascending: false }).limit(5),
    ]);

    return {
      totalProducts: products.count ?? 0,
      activeProducts: productsPublished.count ?? 0,
      featuredProducts: productsFeatured.count ?? 0,
      categories: categories.count ?? 0,
      totalJobs: jobsAll.count ?? 0,
      publishedJobs: jobsPublished.count ?? 0,
      draftJobs: jobsDraft.count ?? 0,
      newInquiries: (inquiriesNew.count ?? 0) + (contactNew.count ?? 0),
      recent: {
        inquiries: recentInquiries.data ?? [],
        applications: recentApplications.data ?? [],
        contact: recentContact.data ?? [],
      },
    };
  });
