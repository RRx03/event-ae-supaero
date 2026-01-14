import { createClient } from '@supabase/supabase-js'


const supabaseUrl="https://toxjxyjemxmzphbnfspc.supabase.co"
const supabaseKey="sb_publishable_zeT5YVC_o2_AfvFrYH53vA_QcMpHJvF"

export const supabase = createClient(supabaseUrl, supabaseKey)