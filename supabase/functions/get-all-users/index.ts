import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * This endpoint returns all user profiles from the database.
 * 
 * @TODO This endpoint should be removed or properly secured before production deployment.
 * Currently, it allows any authenticated user to retrieve all user profiles, which is a
 * potential security and privacy concern. This is only intended for development/admin
 * functionality to support user impersonation in the AuthPage component.
 * 
 * Alternatives to consider:
 * - Restrict access to admin users only
 * - Create a separate admin-only endpoint
 * - Implement proper authorization checks
 */

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Fetch all users
    const { data: users, error } = await supabaseClient
      .from('profiles')
      .select('id, name')
      .order('name')

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ data: users }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 