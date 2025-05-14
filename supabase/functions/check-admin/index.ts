import { serve } from 'https://deno.land/x/supabase_functions@1.0.0/mod.ts';

serve(async (req) => {
  const { email } = await req.json();
  const adminEmails = Deno.env.get('ADMIN_EMAILS')?.split(',') || [];
  const isAdmin = adminEmails.includes(email);
  return new Response(JSON.stringify({ isAdmin }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
