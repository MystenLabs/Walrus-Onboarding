/**
 * Run All Examples
 * 
 * This script runs all code examples from the SDK Upload Relay curriculum
 * to verify they work correctly.
 * 
 * Tests are run sequentially to avoid race conditions with blockchain transactions.
 */

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
}

async function runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
  console.log(`\n  → Running: ${name}...`);
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`  ✅ ${name} completed in ${(duration / 1000).toFixed(2)}s`);
    return { name, success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ ${name} failed: ${errorMessage}`);
    return { name, success: false, error: errorMessage, duration };
  }
}

async function main() {
  console.log('🚀 Starting SDK Upload Relay Code Verification\n');
  console.log('='.repeat(60));
  console.log('\nRunning tests sequentially to avoid transaction conflicts...');
  
  const results: TestResult[] = [];
  
  // Import modules dynamically and run tests sequentially
  // This ensures no side effects from static imports
  
  console.log('\n📤 Upload Examples');
  console.log('-'.repeat(40));
  
  // Test 1: Basic Upload
  {
    const { uploadBlob } = await import('./examples/basic-upload-example.js');
    results.push(await runTest('Basic Upload', uploadBlob));
  }
  
  // Wait between tests to avoid transaction conflicts
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 2: Upload with Relay
  {
    const { uploadWithRelay } = await import('./examples/basic-upload-example.js');
    results.push(await runTest('Upload with Relay', uploadWithRelay));
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 3: Hands-On Lab
  {
    const { handsOnLab } = await import('./examples/hands-on-lab.js');
    results.push(await runTest('Hands-On Lab', handsOnLab));
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n📥 Download Examples');
  console.log('-'.repeat(40));
  
  // Test 4: Basic Download (uploads first if no blob ID)
  {
    // Note: downloadBlob requires a blob ID, so we test the main function
    // which handles uploading first if needed
    const downloadModule = await import('./examples/basic-download-example.js');
    // We'll test downloadBlob with a blob we upload first
    const { uploadBlob } = await import('./examples/basic-upload-example.js');
    results.push(await runTest('Download (with upload)', async () => {
      const { blobId } = await uploadBlob();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await downloadModule.downloadBlob(blobId);
    }));
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n🔄 Retry Patterns');
  console.log('-'.repeat(40));
  
  // Test 5: Retry Patterns
  {
    const { uploadWithRetry } = await import('./examples/retry-patterns.js');
    results.push(await runTest('Retry Patterns', async () => {
      const data = new TextEncoder().encode('Retry Test - ' + Date.now());
      await uploadWithRetry(data);
    }));
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n⚠️ Partial Failures');
  console.log('-'.repeat(40));
  
  // Test 6: Partial Failures
  {
    const { uploadWithRecovery } = await import('./examples/partial-failures.js');
    results.push(await runTest('Partial Failures', async () => {
      const data = new TextEncoder().encode('Partial Failure Test - ' + Date.now());
      await uploadWithRecovery(data, 2);
    }));
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n🔍 Integrity Checks');
  console.log('-'.repeat(40));
  
  // Test 7: Integrity Checks
  {
    const { uploadAndVerify } = await import('./examples/integrity-checks.js');
    results.push(await runTest('Integrity Checks', async () => {
      const data = new TextEncoder().encode('Integrity Test - ' + Date.now());
      await uploadAndVerify(data);
    }));
  }
  
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
