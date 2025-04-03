import { generateClaimNumber } from './utils/claimUtils.js';

async function testClaimNumberGeneration() {
  try {
    console.log('Testing claim number generation...');
    
    // Test with different categories
    const categories = ['Test', 'Research', 'Analysis'];
    
    for (const category of categories) {
      const claimNumber = await generateClaimNumber(category);
      console.log(`Category: ${category}, Generated Claim Number: ${claimNumber}`);
    }
    
    console.log('Claim number generation test completed successfully!');
  } catch (error) {
    console.error('Error testing claim number generation:', error);
  }
}

// Run the test
testClaimNumberGeneration(); 