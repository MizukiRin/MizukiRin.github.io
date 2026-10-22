// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { siteConfig } from '../config';

export const SUPABASE_URL = 'https://jneraogzlodghqptctmh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZXJhb2d6bG9kZ2hxcHRjdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1ODQ0NTksImV4cCI6MjEwODE2MDQ1OX0.J34fH25wIlNhFPc7xTuBlmLn7og0CoIaZK5t_45mPCI';
export const BUCKET_NAME = 'daily-images';
export const AUTHOR_GITHUB = siteConfig.github; // 'MizukiRin'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});

export interface DailyPost {
    id: string;
    content: string;
    images?: string[];
    tags?: string[];
    author_github: string;
    is_private?: boolean;
    created_at: string;
}
