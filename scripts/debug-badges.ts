import { supabase } from '../lib/supabase'
import { fetchBadges } from '../lib/bucket-list-service'
import { calculateBadgeProgress, checkAndAwardBadges } from '../lib/badge-progress-service'

async function debug() {
    console.log('Fetching badges...')
    const { data: badges, error: badgesError } = await (supabase.from('badges').select('*') as any)

    if (badgesError) {
        console.error('Error fetching badges:', badgesError)
        return
    }

    console.log(`Found ${badges?.length || 0} badges:`)
    badges?.forEach((b: any) => {
        console.log(`- ${b.name} (ID: ${b.id}): ${JSON.stringify(b.criteria)}`)
    })

    const { data: profiles, error: profilesError } = await (supabase
        .from('profiles')
        .select('id, email, items_completed, lists_created')
        .limit(5) as any)

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
    }

    console.log('\nRecent profiles:', profiles)

    for (const profile of profiles || []) {
        console.log(`\nDiagnosing user: ${profile.id} (${profile.email || 'no email'})`)
        console.log(`Stats: items_completed=${profile.items_completed}, lists_created=${profile.lists_created}`)

        const progress = await calculateBadgeProgress(profile.id)
        console.log('Progress Map summary:')
        Object.entries(progress).forEach(([badgeId, prog]: [string, any]) => {
            const badge = badges?.find((b: any) => b.id === badgeId)
            console.log(`  - ${badge?.name || badgeId}: ${prog.current}/${prog.target} (${prog.percentage}%) earned=${prog.isEarned}`)
        })

        /*
        const awarded = await checkAndAwardBadges(profile.id)
        console.log('Newly awarded badges during this check:', awarded)
        */
    }
}

debug().catch(console.error)
