#!/usr/bin/env node
// Production database setup script with migration failure handling

import { execSync } from 'child_process';

function runCommand(command, description) {
  console.log(`\n==> ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✓ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`✗ ${description} failed`);
    return false;
  }
}

async function main() {
  console.log('Starting production database setup...\n');

  // Step 1: Generate Prisma Client
  if (!runCommand('npx prisma generate', 'Generating Prisma Client')) {
    process.exit(1);
  }

  // Step 2: Try to deploy migrations
  console.log('\n==> Deploying migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✓ Migrations deployed successfully');
  } catch (error) {
    console.log('\n⚠ Migration deployment failed. Attempting to resolve...');
    
    // Try to resolve failed migrations
    console.log('\n==> Marking failed migrations as resolved...');
    try {
      // Mark the first migration as resolved
      execSync('npx prisma migrate resolve --applied 20240530213853_create_session_table', { 
        stdio: 'inherit' 
      });
      console.log('✓ First migration marked as resolved');
      
      // Try deploying again
      console.log('\n==> Retrying migration deployment...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✓ Migrations deployed successfully');
    } catch (resolveError) {
      console.error('\n✗ Could not resolve migrations automatically');
      console.error('Manual intervention may be required');
      process.exit(1);
    }
  }

  console.log('\n✓ Production database setup complete!\n');
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});

