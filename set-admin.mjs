// Quick script to check and update admin status
// Run this in the browser console while logged in

import { supabase } from './lib/supabase'

async function checkAndSetAdmin() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.log('❌ No user logged in')
        return
    }

    console.log('✅ Current user:', user.email, user.id)

    // Check current profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('❌ Error fetching profile:', profileError)
        return
    }

    console.log('📋 Current profile:', profile)

    // Update email and admin status
    const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
            email: 'tsunyoxi@gmail.com',
            is_admin: true
        })
        .eq('id', user.id)
        .select()

    if (updateError) {
        console.error('❌ Error updating profile:', updateError)
        return
    }

    console.log('✅ Profile updated:', updated)
    console.log('🎉 You are now an admin! Refresh the page.')
}

checkAndSetAdmin()
