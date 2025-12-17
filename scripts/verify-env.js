const fs = require('fs');

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    '\x1b[31m%s\x1b[0m', // Red color
    `Error: The following environment variables are required but missing: ${missingEnvVars.join(
      ', '
    )}`
  );
  console.error(
    '\x1b[33m%s\x1b[0m', // Yellow color
    'Please add them to your .env.local file or your deployment platform environment variables.'
  );
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables are present.');
