import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });

const getSupabaseServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
};

const getCallerTenant = async (client: ReturnType<typeof createClient>, token: string) => {
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const callerId = userData.user.id;
  const { data: callerRow, error: callerError } = await client
    .schema("public")
    .from("users")
    .select("tenant_id, role")
    .eq("id", callerId)
    .maybeSingle();

  if (callerError) {
    throw callerError;
  }

  if (!callerRow?.tenant_id) {
    throw new Error("Caller tenant not found.");
  }

  if (callerRow.role !== "admin") {
    throw new Error("Forbidden");
  }

  return callerRow;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  try {
    const supabase = getSupabaseServiceClient();
    const token = getBearerToken(req);

    if (!token) {
      return jsonResponse({ message: "No token provided." }, 401);
    }

    const callerTenant = await getCallerTenant(supabase, token);

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = String(body?.name ?? "").trim();
    const password = String(body?.password ?? "");
    const role = String(body?.role ?? "").trim();

    if (!email || !name || !password || !role) {
      return jsonResponse({ message: "email, name, password and role are required." }, 400);
    }

    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (createError || !createdUser?.user?.id) {
      return jsonResponse(
        { message: createError?.message || "Failed to create auth user." },
        400,
      );
    }

    const created_user_id = createdUser.user.id;
    const tenant_id = callerTenant.tenant_id;

    const { error: insertError } = await supabase
      .schema("public")
      .from("users")
      .insert({
        id: created_user_id,
        tenant_id,
        role,
        name,
      });

    if (insertError) {
      await supabase.auth.admin.deleteUser(created_user_id);
      return jsonResponse(
        { message: insertError.message || "Failed to create public user." },
        500,
      );
    }

    return jsonResponse(
      {
        id: created_user_id,
        email,
        role,
        tenant_id,
      },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user.";
    if (message === "Unauthorized") {
      return jsonResponse({ message: "No token provided or token is invalid." }, 401);
    }
    if (message === "Forbidden") {
      return jsonResponse({ message: "Forbidden." }, 403);
    }
    return jsonResponse({ message }, 500);
  }
});

