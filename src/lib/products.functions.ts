import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { writeAudit } from "@/lib/audit";

const actorEmail = (claims: unknown) => (claims as { email?: string } | null)?.email ?? null;

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/* ------------------------------ PUBLIC READS ------------------------------ */

export const listCategoriesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("product_categories")
    .select("id,name,slug,description,parent_id,sort_order")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listPublishedProducts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().optional().default(""),
        categorySlug: z.string().optional().default(""),
        brand: z.string().optional().default(""),
        sort: z.enum(["newest", "name", "featured"]).optional().default("newest"),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(48).optional().default(12),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let categoryId: string | null = null;
    if (data.categorySlug) {
      const { data: cat } = await supabase
        .from("product_categories")
        .select("id")
        .eq("slug", data.categorySlug)
        .maybeSingle();
      categoryId = cat?.id ?? null;
    }
    let q = supabase
      .from("products")
      .select(
        "id,name,slug,brand,short_description,price,currency,is_featured,is_new_arrival,availability,category_id,created_at,product_images(url,is_primary,sort_order)",
        { count: "exact" },
      )
      .eq("status", "published");
    if (categoryId) q = q.eq("category_id", categoryId);
    if (data.brand) q = q.eq("brand", data.brand);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    if (data.sort === "name") q = q.order("name");
    else if (data.sort === "featured") q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    else q = q.order("created_at", { ascending: false });
    const from = (data.page - 1) * data.pageSize;
    q = q.range(from, from + data.pageSize - 1);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);

    const { data: brandsRaw } = await supabase
      .from("products")
      .select("brand")
      .eq("status", "published")
      .not("brand", "is", null);
    const brands = Array.from(new Set((brandsRaw ?? []).map((b) => b.brand).filter(Boolean))) as string[];

    return {
      items: (rows ?? []).map((r) => ({
        ...r,
        primaryImage:
          [...(r.product_images ?? [])].sort(
            (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
          )[0]?.url ?? null,
      })),
      total: count ?? 0,
      brands,
    };
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: product, error } = await supabase
      .from("products")
      .select(
        "id,name,slug,sku,brand,short_description,full_description,specifications,features,price,currency,availability,is_featured,is_new_arrival,tags,seo_title,seo_description,category_id,product_images(id,url,alt,sort_order,is_primary),product_documents(id,title,url,file_type,size_bytes,sort_order)",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return null;
    const [{ data: category }, { data: related }] = await Promise.all([
      product.category_id
        ? supabase.from("product_categories").select("name,slug").eq("id", product.category_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("products")
        .select("id,name,slug,brand,short_description,product_images(url,is_primary,sort_order)")
        .eq("status", "published")
        .neq("id", product.id)
        .eq(product.category_id ? "category_id" : "id", product.category_id ?? product.id)
        .limit(4),
    ]);
    return {
      ...product,
      category,
      product_images: [...(product.product_images ?? [])].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
      ),
      product_documents: [...(product.product_documents ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      related: (related ?? []).map((r) => ({
        ...r,
        primaryImage:
          [...(r.product_images ?? [])].sort(
            (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
          )[0]?.url ?? null,
      })),
    };
  });

export const createInquiryPublic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        product_id: z.string().uuid().nullable().optional(),
        product_name: z.string().max(200).optional().nullable(),
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(40).optional().nullable(),
        company: z.string().trim().max(150).optional().nullable(),
        quantity: z.number().int().min(1).max(999999).optional().nullable(),
        message: z.string().trim().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { error } = await supabase.from("product_inquiries").insert({
      product_id: data.product_id ?? null,
      product_name: data.product_name ?? null,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      company: data.company ?? null,
      quantity: data.quantity ?? null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- ADMIN --------------------------------- */

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("product_categories")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const categoryInput = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).regex(/^[a-z0-9-]+$/, "Use lowercase, digits, dashes"),
  description: z.string().max(500).optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().min(0).max(9999).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => categoryInput.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      parent_id: data.parent_id ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    };
    if (data.id) {
      const { error } = await context.supabase.from("product_categories").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("product_categories")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("product_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().optional().default(""),
        status: z.enum(["all", "draft", "published"]).optional().default("all"),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(100).optional().default(20),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("products")
      .select("id,name,slug,brand,status,is_featured,price,currency,updated_at,category_id", { count: "exact" });
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    if (data.status !== "all") q = q.eq("status", data.status);
    q = q.order("updated_at", { ascending: false });
    const from = (data.page - 1) * data.pageSize;
    q = q.range(from, from + data.pageSize - 1);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [], total: count ?? 0 };
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: p, error } = await context.supabase
      .from("products")
      .select("*,product_images(*),product_documents(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!p) throw new Error("Product not found");
    return {
      ...p,
      product_images: [...(p.product_images ?? [])].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
      ),
      product_documents: [...(p.product_documents ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    };
  });

const productInput = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/),
  sku: z.string().trim().max(80).optional().nullable(),
  brand: z.string().trim().max(80).optional().nullable(),
  category_id: z.string().uuid().nullable().optional(),
  short_description: z.string().max(500).optional().nullable(),
  full_description: z.string().max(20000).optional().nullable(),
  specifications: z.record(z.string(), z.any()).optional().default({}),
  features: z.array(z.string()).optional().default([]),
  price: z.number().nullable().optional(),
  currency: z.string().max(8).optional().default("TZS"),
  availability: z.enum(["in_stock", "out_of_stock", "pre_order", "discontinued"]).optional().default("in_stock"),
  is_featured: z.boolean().optional().default(false),
  is_new_arrival: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  seo_title: z.string().max(160).optional().nullable(),
  seo_description: z.string().max(400).optional().nullable(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productInput.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      sku: data.sku ?? null,
      brand: data.brand ?? null,
      category_id: data.category_id ?? null,
      short_description: data.short_description ?? null,
      full_description: data.full_description ?? null,
      specifications: data.specifications ?? {},
      features: data.features ?? [],
      price: data.price ?? null,
      currency: data.currency ?? "TZS",
      availability: data.availability ?? "in_stock",
      is_featured: data.is_featured ?? false,
      is_new_arrival: data.is_new_arrival ?? false,
      tags: data.tags ?? [],
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      status: data.status ?? "draft",
    };
    if (data.id) {
      const { error } = await context.supabase.from("products").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      await writeAudit(context.supabase as never, context.userId, actorEmail(context.claims), "update", "product", data.id, { name: data.name, status: payload.status });
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("products").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase as never, context.userId, actorEmail(context.claims), "create", "product", row.id, { name: data.name, status: payload.status });
    return { id: row.id };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(context.supabase as never, context.userId, actorEmail(context.claims), "delete", "product", data.id);
    return { ok: true };
  });

/* image + document metadata (files uploaded from client directly to storage) */

export const addProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        product_id: z.string().uuid(),
        url: z.string().url(),
        storage_path: z.string().min(1),
        alt: z.string().max(200).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.product_id);
    const sort_order = count ?? 0;
    const is_primary = (count ?? 0) === 0;
    const { data: row, error } = await context.supabase
      .from("product_images")
      .insert({
        product_id: data.product_id,
        url: data.url,
        storage_path: data.storage_path,
        alt: data.alt ?? null,
        sort_order,
        is_primary,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removeProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: img } = await context.supabase
      .from("product_images")
      .select("storage_path,product_id,is_primary")
      .eq("id", data.id)
      .maybeSingle();
    if (img?.storage_path) {
      await context.supabase.storage.from("product-images").remove([img.storage_path]);
    }
    const { error } = await context.supabase.from("product_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (img?.is_primary && img.product_id) {
      const { data: next } = await context.supabase
        .from("product_images")
        .select("id")
        .eq("product_id", img.product_id)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      if (next) await context.supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
    }
    return { ok: true };
  });

export const setPrimaryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), product_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("product_images").update({ is_primary: false }).eq("product_id", data.product_id);
    const { error } = await context.supabase.from("product_images").update({ is_primary: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), sort_order: z.number().int().min(0) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("product_images")
      .update({ sort_order: data.sort_order })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addProductDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        product_id: z.string().uuid(),
        title: z.string().trim().min(1).max(160),
        url: z.string().url(),
        storage_path: z.string().min(1),
        file_type: z.string().max(80).optional().nullable(),
        size_bytes: z.number().int().nonnegative().optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("product_documents")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.product_id);
    const { data: row, error } = await context.supabase
      .from("product_documents")
      .insert({
        product_id: data.product_id,
        title: data.title,
        url: data.url,
        storage_path: data.storage_path,
        file_type: data.file_type ?? null,
        size_bytes: data.size_bytes ?? null,
        sort_order: count ?? 0,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removeProductDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc } = await context.supabase
      .from("product_documents")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (doc?.storage_path) {
      await context.supabase.storage.from("product-documents").remove([doc.storage_path]);
    }
    const { error } = await context.supabase.from("product_documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* inquiries */

export const adminListInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.enum(["all", "new", "responded", "closed"]).optional().default("all"),
        search: z.string().optional().default(""),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("product_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.search)
      q = q.or(
        `name.ilike.%${data.search}%,email.ilike.%${data.search}%,product_name.ilike.%${data.search}%`,
      );
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "responded", "closed"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("product_inquiries")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* signed URL helper for upload not needed — client uses supabase.storage.upload directly.
   we generate long-lived signed URLs for private buckets via server. */

export const createStorageSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        bucket: z.enum(["product-images", "product-documents"]),
        path: z.string().min(1),
        expiresIn: z.number().int().min(60).max(315360000).optional().default(315360000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from(data.bucket)
      .createSignedUrl(data.path, data.expiresIn);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
