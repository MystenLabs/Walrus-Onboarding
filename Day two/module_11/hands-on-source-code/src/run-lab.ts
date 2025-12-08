import { createQuilt } from '../03-creation-process/ts/create-quilt.js';
import { retrieveFromQuilt } from '../04-retrieval-process/ts/retrieve-quilt.js';

async function runLab() {
  console.log('=== Starting Hands-On Lab ===\n');
  
  console.log('--- Step 1: Create Quilt ---');
  await createQuilt();
  
  console.log('\n--- Step 2: Retrieve Quilt ---');
  await retrieveFromQuilt();
  
  console.log('\n=== Lab Completed Successfully ===');
}

runLab().catch((error) => {
  console.error(error);
  process.exit(1);
});

