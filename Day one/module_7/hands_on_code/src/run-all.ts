/**
 * Run All Examples
 * 
 * This script runs all code examples from the SDK Upload Relay curriculum
 * to verify they work correctly.
 */

import { uploadBlob, uploadWithRelay } from './examples/basic-upload-example.js';
import { downloadBlob } from './examples/basic-download-example.js';
import { handsOnLab } from './examples/hands-on-lab.js';
import { uploadWithRetry } from './examples/retry-patterns.js';
import { uploadWithRecovery } from './examples/partial-failures.js';
import { uploadAndVerify } from './examples/integrity-checks.js';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
}

async function runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    return { name, success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { name, success: false, error: errorMessage, duration };
  }
}

async function main() {
  console.log('🚀 Starting SDK Upload Relay Code Verification\n');
  console.log('='.repeat(60));
  
  const results: TestResult[] = [];
  
  // Run tests sequentially to avoid overwhelming the network
  console.log('\n📤 Running Upload Examples...\n');
  
  results.push(await runTest('Basic Upload', async () => {
    console.log('  → Testing basic upload...');
    await uploadBlob();
  }));
  
  // Small delay between tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.push(await runTest('Upload with Relay', async () => {
    console.log('  → Testing upload with relay...');
    await uploadWithRelay();
  }));
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.push(await runTest('Hands-On Lab', async () => {
    console.log('  → Testing hands-on lab...');
    await handsOnLab();
  }));
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.push(await runTest('Retry Patterns', async () => {
    console.log('  → Testing retry patterns...');
    const data = new TextEncoder().encode('Retry Test - ' + Date.now());
    await uploadWithRetry(data);
  }));
  
  results.push(await runTest('Partial Failures', async () => {
    console.log('  → Testing partial failure handling...');
    const data = new TextEncoder().encode('Partial Failure Test - ' + Date.now());
    await uploadWithRecovery(data, 2); // Limit retries for testing
  }));
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.push(await runTest('Integrity Checks', async () => {
    console.log('  → Testing integrity checks...');
    const data = new TextEncoder().encode('Integrity Test - ' + Date.now());
    await uploadAndVerify(data);
  }));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const duration = (result.duration / 1000).toFixed(2);
    console.log(`${status} ${result.name} (${duration}s)`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log('-'.repeat(60));
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. This may be expected in test environments.');
    console.log('   Network issues or node availability can cause failures.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

