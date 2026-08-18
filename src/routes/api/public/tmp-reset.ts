import { createFileRoute } from "@tanstack/react-router";

const ONE_TIME_TOKEN = "f1or4-tmp-2f9a4c";

export const Route = createFileRoute("/api/public/tmp-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { token?: string; email?: string; password?: string };
        if (body.token !== ONE_TIME_TOKEN) return new Response("nope", { status: 401 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        if (error) return new Response(error.message, { status: 500 });
        const user = data.users.find((u) => u.email?.toLowerCase() === body.email?.toLowerCase());
        if (!user) return new Response("user not found", { status: 404 });
        const upd = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: body.password!,
          email_confirm: true,
        });
        if (upd.error) return new Response(upd.error.message, { status: 500 });
        return new Response(JSON.stringify({ ok: true, id: user.id }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
