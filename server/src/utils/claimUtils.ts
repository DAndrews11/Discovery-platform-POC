import { runQuery } from '../db/utils.js';

interface ClaimRecord {
    claim_nb_tx: string;
}

export async function generateClaimNumber(category: string): Promise<string> {
    // Get the first 3 letters of the category and capitalize them
    const prefix = category.substring(0, 3).toUpperCase();
    
    // Get the current highest number for this category
    const result = await runQuery<ClaimRecord>(
        `SELECT claim_nb_tx FROM claims 
         WHERE claim_nb_tx LIKE ? 
         ORDER BY claim_nb_tx DESC 
         LIMIT 1`,
        [`${prefix}-%`]
    );

    let nextNumber = 1;
    if (result && result.length > 0) {
        // Extract the number from the last claim number and increment it
        const lastClaimNumber = result[0].claim_nb_tx;
        const lastNumber = parseInt(lastClaimNumber.split('-')[1]);
        nextNumber = lastNumber + 1;
    }

    // Format the number with leading zeros
    const formattedNumber = nextNumber.toString().padStart(5, '0');
    
    return `${prefix}-${formattedNumber}`;
} 