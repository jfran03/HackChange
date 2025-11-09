import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetUserId = process.argv[2];

if (!supabaseUrl || !serviceRoleKey || !targetUserId) {
  console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/makeAdmin.js <user_id>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

(async () => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('user_id', targetUserId);

  if (error) {
    console.error('Failed to promote user:', error.message);
    process.exit(1);
  }

  console.log('User promoted to admin:', targetUserId);
})();
