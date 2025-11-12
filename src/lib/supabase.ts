const SUPABASE_JS_URL = "https://esm.sh/@supabase/supabase-js@2.45.2?bundle" as const;

type SupabaseModule = {
  createClient: (
    url: string,
    key: string,
    options?: {
      auth?: {
        persistSession?: boolean;
        autoRefreshToken?: boolean;
        detectSessionInUrl?: boolean;
        storage?: Storage | undefined;
      };
    }
  ) => SupabaseClient;
};

type SupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: unknown } | null; error: unknown }>;
    getUser: () => Promise<{ data: { user: unknown } | null; error: unknown }>;
    onAuthStateChange: (
      callback: (event: string, session: unknown | null) => void
    ) => { data: { subscription: { unsubscribe: () => void } } };
    signInWithOAuth: (options: { provider: string }) => Promise<unknown>;
    signOut: () => Promise<unknown>;
  };
  from: (table: string) => {
    select: (
      columns: string,
      options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }
    ) => Promise<{ data: unknown; error: unknown; count?: number | null }>;
    insert?: (values: unknown) => Promise<unknown>;
    order?: (column: string, options?: { ascending?: boolean }) => Promise<unknown>;
  };
  channel: (
    identifier: string
  ) => {
    on: (
      event: string,
      filter: Record<string, unknown>,
      callback: () => void
    ) => ReturnType<SupabaseClient["channel"]>;
    subscribe: () => ReturnType<SupabaseClient["channel"]>;
  };
  removeChannel: (channel: ReturnType<SupabaseClient["channel"]>) => void;
};

type SupabaseLoader = () => Promise<SupabaseModule>;

const resolveEnvValue = (key: string, fallback = "") => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] ?? fallback;
  }
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key] ?? fallback;
  }
  return fallback;
};

const supabaseUrl = resolveEnvValue("VITE_SUPABASE_URL", "");
const supabaseAnonKey = resolveEnvValue("VITE_SUPABASE_ANON_KEY", "");

const importSupabase: SupabaseLoader = async () => {
  const existing = (globalThis as any).supabase;
  if (existing?.createClient) {
    return existing;
  }

  const module = await import(/* @vite-ignore */ SUPABASE_JS_URL);
  if (!(globalThis as any).supabase && module?.createClient) {
    (globalThis as any).supabase = module;
  }
  return module as SupabaseModule;
};

let clientPromise: Promise<SupabaseClient> | null = null;

const createSupabaseClient = async () => {
  const module = await importSupabase();
  const { createClient } = module ?? {};

  if (typeof createClient !== "function") {
    throw new Error("Supabase client factory not available.");
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });

  return client;
};

export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = createSupabaseClient();
  }
  return clientPromise;
}

export async function getCurrentSession() {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
}

export type { SupabaseClient };
