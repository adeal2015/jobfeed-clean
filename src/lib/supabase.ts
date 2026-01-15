import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrswuoiwpyqihqddwrue.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc3d1b2l3cHlxaWhxZGR3cnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NzcyNzgsImV4cCI6MjA4MjM1MzI3OH0.fgId6c4k-7NjTGBuTmIWntKALMpmvB_4JrWnrfC0H-k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const USER_ID = '4c5e0492-c8b2-43d7-ab33-42c05655ec34'
