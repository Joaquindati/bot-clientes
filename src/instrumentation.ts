/**
 * Next.js Instrumentation
 * This file runs once when the server starts (both dev and production)
 * Perfect for environment variable validation and startup logging
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { checkEnvironmentVariables } = await import('./lib/env-check');

    console.log('\n🚀 Server starting - Running environment check...\n');
    checkEnvironmentVariables();
  }
}
