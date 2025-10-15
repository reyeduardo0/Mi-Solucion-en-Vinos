import { createClient } from '@supabase/supabase-js';

// --- ATENCIÓN ---
// Reemplaza los siguientes valores con la URL y la Anon Key de tu proyecto de Supabase.
// Puedes encontrarlos en la configuración de tu proyecto, en la sección "API".
const supabaseUrl = 'https://ppkakwwqkcoayjvkfqrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwa2Frd3dxa2NvYXlqdmtmcXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzQyNjksImV4cCI6MjA3NjExMDI2OX0.VTWRzspPqzMqYPgcLl9DUJ3pmT_iip0NuU-O1dTYik4';

// Fix on line 10: Removed the check for placeholder credentials.
// Since the supabaseUrl and supabaseAnonKey constants are hardcoded with actual values,
// this check is always false and causes a TypeScript error due to comparing
// incompatible string literal types. The warning is no longer necessary.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);