/**
 * Environment Variables Validation and Debug Logging for CloudWatch
 * This file checks all required env vars on app startup and logs to CloudWatch
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'AUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

const OPTIONAL_ENV_VARS = [
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'EMAIL_REPLY_TO',
  'CRON_SECRET',
] as const;

interface EnvCheckResult {
  allPresent: boolean;
  missing: string[];
  present: string[];
  optional: {
    present: string[];
    missing: string[];
  };
}

export function checkEnvironmentVariables(): EnvCheckResult {
  const missing: string[] = [];
  const present: string[] = [];
  const optionalPresent: string[] = [];
  const optionalMissing: string[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      missing.push(envVar);
    } else {
      present.push(envVar);
    }
  }

  // Check optional variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      optionalMissing.push(envVar);
    } else {
      optionalPresent.push(envVar);
    }
  }

  const result: EnvCheckResult = {
    allPresent: missing.length === 0,
    missing,
    present,
    optional: {
      present: optionalPresent,
      missing: optionalMissing,
    },
  };

  // Log to CloudWatch (console.log/error in Lambda/Amplify goes to CloudWatch)
  console.log('=== ENVIRONMENT VARIABLES CHECK ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Node Environment:', process.env.NODE_ENV);

  if (result.allPresent) {
    console.log('✅ All required environment variables are present');
  } else {
    console.error('❌ MISSING REQUIRED ENVIRONMENT VARIABLES:', result.missing);
  }

  console.log('\n--- Required Variables Status ---');
  result.present.forEach((envVar) => {
    const value = process.env[envVar] || '';
    const maskedValue = maskSensitiveValue(envVar, value);
    console.log(`✅ ${envVar}: ${maskedValue}`);
  });

  result.missing.forEach((envVar) => {
    console.error(`❌ ${envVar}: MISSING`);
  });

  console.log('\n--- Optional Variables Status ---');
  result.optional.present.forEach((envVar) => {
    const value = process.env[envVar] || '';
    const maskedValue = maskSensitiveValue(envVar, value);
    console.log(`✅ ${envVar}: ${maskedValue}`);
  });

  result.optional.missing.forEach((envVar) => {
    console.log(`⚠️  ${envVar}: Not configured (optional)`);
  });

  console.log('=== END ENVIRONMENT VARIABLES CHECK ===\n');

  return result;
}

/**
 * Masks sensitive values for logging
 */
function maskSensitiveValue(key: string, value: string): string {
  // Don't mask public variables
  if (key.startsWith('NEXT_PUBLIC_')) {
    return value;
  }

  // For URLs, show only the protocol and domain
  if (key.includes('URL') && value.startsWith('http')) {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.hostname}:****`;
    } catch {
      return '[CONFIGURED]';
    }
  }

  // For secrets, show first 4 and last 4 characters
  if (value.length > 20) {
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }

  return '[CONFIGURED]';
}

/**
 * Throws an error if required environment variables are missing
 * Use this in critical paths where the app cannot function without env vars
 */
export function validateRequiredEnvVars(): void {
  const result = checkEnvironmentVariables();

  if (!result.allPresent) {
    const errorMessage = `Missing required environment variables: ${result.missing.join(', ')}`;
    console.error('FATAL ERROR:', errorMessage);
    throw new Error(errorMessage);
  }
}
