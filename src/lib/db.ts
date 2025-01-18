import { supabase } from './supabase';

// 用户相关操作
export async function createUserProfile(userId: string, profile: any) {
  return supabase
    .from('users')
    .insert([
      {
        auth0_id: userId,
        ...profile,
        created_at: new Date().toISOString()
      }
    ]);
}

// 辩论相关操作
export async function createDebate(data: any) {
  return supabase
    .from('debates')
    .insert([
      {
        ...data,
        created_at: new Date().toISOString()
      }
    ]);
} 