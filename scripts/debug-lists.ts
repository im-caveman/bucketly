
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8')
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/)
            if (match) {
                const key = match[1].trim()
                const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1')
                process.env[key] = value
            }
        })
    }
} catch (e) {
    console.error('Error loading .env.local', e)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log('Starting integration test (Logging)...')
    const userId = '59b95405-1963-476d-a6b8-5041857ee24e' // tsunyoxi

    // 1. Get an existing list to use as origin
    const { data: existingLists } = await supabase
        .from('bucket_lists')
        .select('id, name')
        .eq('user_id', userId)
        .is('origin_id', null)
        .limit(1)

    if (!existingLists || existingLists.length === 0) {
        console.log('User has no lists to test with.')
        return
    }

    const outputList = existingLists[0]
    console.log(`Using list "${outputList.name}" (${outputList.id}) as origin.`)

    // 2. Create a dummy shadow copy
    console.log('Creating shadow copy...')
    const shadowName = `Shadow of ${outputList.name.substring(0, 10)}`
    const { data: shadowList, error: createError } = await supabase
        .from('bucket_lists')
        .insert({
            user_id: userId,
            name: shadowName,
            description: 'Test shadow copy',
            category: 'Travel',
            is_public: false,
            origin_id: outputList.id
        })
        .select('id, name, origin_id')
        .single()

    if (createError) {
        console.error('FAILED to create shadow list:', createError)
        fs.writeFileSync('debug-error.log', JSON.stringify(createError, null, 2))
        return
    }

    console.log(`Created shadow list "${shadowList.name}" (${shadowList.id}) with origin_id=${shadowList.origin_id}`)

    // 3. Test Filtering (Simulate fetchUserBucketLists with onlyOwned=true)
    console.log('\n--- Testing Filter (onlyOwned=true) ---')
    const { data: filteredLists, error: filterError } = await supabase
        .from('bucket_lists')
        .select('id, name, origin_id')
        .eq('user_id', userId)
        .is('origin_id', null)

    const foundShadowInFiltered = filteredLists?.find(l => l.id === shadowList.id)

    if (foundShadowInFiltered) {
        console.error('❌ FAILED: Shadow list APPEARED in filtered results!')
    } else {
        console.log('✅ PASSED: Shadow list was filtered out.')
    }

    // 5. Cleanup
    console.log('\nCleaning up...')
    await supabase.from('bucket_lists').delete().eq('id', shadowList.id)
    console.log('Deleted shadow list.')
}

run().catch(console.error)
