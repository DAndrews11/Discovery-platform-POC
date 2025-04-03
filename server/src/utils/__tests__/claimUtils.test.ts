import { generateClaimNumber } from '../claimUtils.js';

describe('generateClaimNumber', () => {
    it('should generate a claim number with the correct format', async () => {
        const category = 'Test';
        const claimNumber = await generateClaimNumber(category);
        
        // Check format: TES-00001
        expect(claimNumber).toMatch(/^TES-\d{5}$/);
    });
}); 