import { supabase } from './supabase.js';

export const login = async (username, password) => {
    const { user, error } = await supabase.auth.signIn({
        email: username,
        password: password,
    });
    return { user, error };
};

export const signup = async (username, password) => {
    const { user, error } = await supabase.auth.signUp({
        email: username,
        password: password,
    });
    return { user, error };
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};