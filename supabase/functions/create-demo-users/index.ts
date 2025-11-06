import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = [];

    // Create admin user
    const { data: adminAuthData, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@test.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User'
      }
    });

    if (adminAuthError) {
      results.push({ user: 'admin', error: adminAuthError.message });
    } else {
      // Update profile to super_admin
      const { error: profileError } = await supabaseAdmin
        .from('users_profiles')
        .update({ 
          role: 'super_admin',
          full_name: 'Admin User',
          email: 'admin@test.com'
        })
        .eq('id', adminAuthData.user.id);

      if (profileError) {
        results.push({ user: 'admin', created: true, profile_error: profileError.message });
      } else {
        results.push({ user: 'admin', created: true, role: 'super_admin' });
      }
    }

    // Create regular user
    const { data: userAuthData, error: userAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'user@test.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Regular User'
      }
    });

    if (userAuthError) {
      results.push({ user: 'user', error: userAuthError.message });
    } else {
      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('users_profiles')
        .update({ 
          role: 'customer',
          full_name: 'Regular User',
          email: 'user@test.com'
        })
        .eq('id', userAuthData.user.id);

      if (profileError) {
        results.push({ user: 'user', created: true, profile_error: profileError.message });
      } else {
        results.push({ user: 'user', created: true, role: 'customer' });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});