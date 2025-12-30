import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas para conexão direta e persistente
const SUPABASE_URL = 'https://sujxdvvnjbxslkjlmzui.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1anhkdnZuamJ4c2xramxtenVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzA5NDcsImV4cCI6MjA4MjU0Njk0N30.T-ipXvu0ZQY8Dbsa0z37s3v-RRL1VyLcMUnDH9KYYfA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false // Como usamos um sistema de PIN customizado para POS, não precisamos de sessão de browser persistente do Supabase Auth
  }
});