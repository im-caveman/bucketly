
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
try {
    let envConfig: Record<string, string> = {}
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8')
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key && value) envConfig[key.trim()] = value.trim()
        })
    }

    const url = envConfig['NEXT_PUBLIC_SUPABASE_URL']
    const key = envConfig['SUPABASE_SERVICE_ROLE_KEY']

    if (!url || !key) {
        console.error('Missing credentials')
        process.exit(1)
    }

    const supabase = createClient(url, key)

    async function checkSchema() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1)

        if (error) {
            console.error('Error:', error)
        } else {
            if (data && data.length > 0) {
                console.log('Columns in profiles table:', Object.keys(data[0]))
            } else {
                console.log('No profiles found to inspect.')
            }
        }
    }

    checkSchema()
} catch (e) { console.error(e) }
