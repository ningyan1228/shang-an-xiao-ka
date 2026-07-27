import { supabase } from '../../lib/supabase/client';
import { supabaseErrorMessage } from '../../lib/supabase/errors';
export async function signUp(email:string,password:string,displayName:string){if(!supabase)throw new Error('云端同步尚未配置。');const emailRedirectTo=`${window.location.origin}${import.meta.env.BASE_URL}#/login`;const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo,data:{display_name:displayName}}});if(error)throw new Error(supabaseErrorMessage(error));}
export async function signIn(email:string,password:string){if(!supabase)throw new Error('云端同步尚未配置。');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw new Error(supabaseErrorMessage(error));}
export async function signOut(){if(!supabase)return;const {error}=await supabase.auth.signOut();if(error)throw new Error(supabaseErrorMessage(error));}
