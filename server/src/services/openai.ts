import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Configure dotenv to look in the project root directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Get the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not found in environment variables');
}

// Initialize OpenAI client
export const openai = new OpenAI({
    apiKey
}); 