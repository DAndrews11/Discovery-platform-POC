import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDB } from '../db/utils.js';
import OpenAI from 'openai';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        username: string;
    };
}

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const RTI_METHODOLOGY = {
    step1: {
        title: "Preliminary Review",
        tasks: [
            "Read the full report carefully to gain a comprehensive understanding of the content, purpose, findings, and conclusions",
            "Note initial impressions about clarity, completeness, and transparency"
        ]
    },
    step2: {
        title: "Identify the Scope and Objectives",
        tasks: [
            "Clearly understand the report's stated objectives, scope, and intended audience",
            "Document if these objectives appear fully met or if there are noticeable gaps or ambiguities"
        ]
    },
    step3: {
        title: "Analyze Completeness and Transparency",
        tasks: [
            "Evaluate whether all relevant data, evidence, and supporting documentation referenced are adequately presented",
            "Identify areas that lack clear supporting details or where claims are not fully substantiated"
        ]
    },
    step4: {
        title: "Cross-Check Data and References",
        tasks: [
            "Verify the references cited within the report (such as footnotes, appendices, and data tables)",
            "Determine if essential supporting documents or datasets referenced are publicly available or missing"
        ]
    },
    step5: {
        title: "Highlight Missing or Unclear Information",
        tasks: [
            "Clearly document gaps, unclear conclusions, or missing evidence identified during the analysis",
            "Assess whether these gaps significantly impact the report's overall credibility or your ability to verify its claims"
        ]
    },
    step6: {
        title: "Ensure Compliance with Jurisdictional RTI Laws",
        tasks: [
            "Review applicable local, provincial, or federal Right to Information laws and regulations relevant to the report",
            "Ensure that all potential RTI requests formulated comply with jurisdictional requirements and procedures"
        ]
    },
    step7: {
        title: "Formulate Potential RTI Requests",
        tasks: [
            "Develop clear, specific RTI questions aimed directly at obtaining the missing or incomplete information",
            "Prioritize RTI questions based on their relevance, importance, and potential impact on understanding the report"
        ]
    },
    step8: {
        title: "Evaluate Necessity and Impact",
        tasks: [
            "Critically assess if obtaining the identified information through RTI is essential to achieve clarity or transparency",
            "Decide whether an RTI request is justified or if the existing gaps are minor enough not to warrant additional action"
        ]
    },
    step9: {
        title: "Document the Decision",
        tasks: [
            "Clearly document the decision-making process, highlighting:",
            "- Any RTI requests to proceed with",
            "- Rationale for why an RTI request may or may not be necessary",
            "- The anticipated outcome or benefit of submitting the request"
        ]
    }
};

// Start RTI request process
router.post('/start', authenticateToken, async (req, res) => {
    try {
        const { claim_id, claim_nb_tx, claim_title, date_published, published_url, description, comments } = req.body;

        if (!claim_id) {
            return res.status(400).json({ error: 'Claim ID is required' });
        }
        console.log('Processing RTI request for claim ID:', claim_id);

        // Get the latest validation report for this claim
        const db = await getDB();
        console.log('Fetching latest validation for claim ID:', claim_id);
        const latestValidation = await db.get(`
            SELECT v.*, u.username as validator_username 
            FROM validations v
            JOIN users u ON v.validator_id = u.id
            WHERE v.claim_id = ?
            ORDER BY v.created_at DESC
            LIMIT 1
        `, [claim_id]);
        console.log('Latest validation query result:', latestValidation);

        // Check if we have a validation and it has a conclusion
        if (latestValidation) {
            console.log('Found validation with conclusion:', latestValidation.ai_generated_conclusion);
        } else {
            console.log('No validation found for claim');
        }

        // Prepare the prompt for OpenAI
        const prompt = `Please first summarize the following claim concisely:
${claim_title}
Published: ${date_published}
URL: ${published_url}
Description: ${description}
Comments: ${comments}

${latestValidation ? `Latest Validation Summary:
${latestValidation.ai_generated_conclusion}

` : ''}Please remind the user of the RTI Methodology that will be used to generate any RTI requests as necessary:
${Object.entries(RTI_METHODOLOGY).map(([key, step]) => `${step.title}`).join('\n')}

Please structure your response in a short friendly conversational way, as you are the principal investigator guiding this Right to Information process. You need to ask if there any other considerations before starting the RTI process.

IMPORTANT FORMATTING NOTES:
1. Start with "Claim Summary:" on its own line
2. Follow with the claim summary in a new paragraph
3. Add a blank line before "RTI Methodology:"
4. List each methodology step on a new line with proper numbering
5. End with your question about additional considerations in a new paragraph
6. Do not write this as a letter - no greetings or signatures
7. Use line breaks to separate major sections and enhance readability`;
        // Output the prompt to the console
        console.log('Prompt being sent to OpenAI:', prompt);

        // Get completion from OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }],
        });

        const response = completion.choices[0].message.content || "I'm ready to help you formulate RTI requests for this claim.";

        res.json({ response });
    } catch (error) {
        console.error('Error in /start:', error);
        res.status(500).json({ error: 'Failed to start RTI process' });
    }
});

// Chat endpoint for RTI request process
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, messages, claim_id } = req.body;

        if (!claim_id) {
            return res.status(400).json({ error: 'Claim ID is required' });
        }

        // Get claim details
        const db = await getDB();
        const claim = await db.get(`
            SELECT claims.*, users.username as created_by_username 
            FROM claims 
            JOIN users ON claims.created_by = users.id 
            WHERE claims.id = ?
        `, [claim_id]);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Get completion from OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: "You are an AI assistant helping to formulate RTI (Right to Information) requests. Your job is not to generate RTI requests, but to help the user understand the claim and the RTI process.  The Generate RTI Request will do the detailed work." 
                },
                ...messages,
                { role: "user", content: message }
            ],
        });

        const response = completion.choices[0].message.content || "I couldn't process that request.";

        res.json({ response });
    } catch (error) {
        console.error('Error in /chat:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Generate RTI request
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { claim_nb_tx, claim_title, date_published, published_url, description, comments } = req.body;

        // Prepare the prompt for generating the RTI request
        const prompt = `Based on the following claim details, generate a draft RTI request:

Claim: ${claim_title}
Published: ${date_published}
URL: ${published_url}
Description: ${description}
Additional Comments: ${comments}

Please format the RTI request according to standard guidelines, including:
1. Clear subject line
2. Proper salutation
3. Brief context
4. Specific information requests
5. Time period specification
6. Relevant reference numbers
7. Closing and signature`;

        // Get completion from OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }],
        });

        const rtiRequest = completion.choices[0].message.content || "Failed to generate RTI request";

        res.json({ rtiRequest });
    } catch (error) {
        console.error('Error in /generate:', error);
        res.status(500).json({ error: 'Failed to generate RTI request' });
    }
});

// Generate RTI request
router.post('/generate-request', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { claim_id, messages } = req.body;
        const db = await getDB();

        // Get the claim details
        const claim = await db.get(`
            SELECT claims.*, users.username as created_by_username 
            FROM claims 
            JOIN users ON claims.created_by = users.id 
            WHERE claims.id = ?
        `, [claim_id]);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Get the latest validation for context
        const latestValidation = await db.get(`
            SELECT v.*, u.username as validator_username 
            FROM validations v
            JOIN users u ON v.validator_id = u.id
            WHERE v.claim_id = ?
            ORDER BY v.created_at DESC
            LIMIT 1
        `, [claim_id]);

        // Create a structured methodology string
        const methodologySteps = Object.entries(RTI_METHODOLOGY)
            .map(([key, step]) => {
                return `${step.title}:\n${step.tasks.map(task => `  ${task}`).join('\n')}`;
            })
            .join('\n\n');

        // Include the conversation history in the prompt
        const conversationSummary = messages
            .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
            .join('\n\n');

        // Prepare the prompt for OpenAI
        const prompt = `Please generate a comprehensive RTI (Right to Information) request in the form of a letter or emailfor the following claim, taking into account the conversation history and following our structured methodology:

CLAIM DETAILS:
Claim Title: ${claim.claim_title}
Description: ${claim.description}
Source: ${claim.published_url}
Category: ${claim.category}

${latestValidation ? `LATEST VALIDATION REPORT:
${latestValidation.ai_generated_report}

` : ''}CONVERSATION HISTORY:
${conversationSummary}

RTI METHODOLOGY USED:
${methodologySteps}

Please provide a final RTI request that includes:
1. A clear subject line
2. Brief context about the claim and why information is being requested
3. Specific, well-structured information requests based on gaps identified
4. Clear timeline requirements
5. References to relevant RTI laws and regulations
6. Contact information requirements
7. Any necessary attachments or supporting documents needed

Format the request with clear sections and bullet points for readability.`;

        console.log('\n=== Generating RTI Request ===');
        console.log('Prompt:', prompt);
        console.log('=====================================\n');

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert in formulating Right to Information (RTI) requests. Your task is to generate a comprehensive RTI request based on the claim details, validation history, conversation history, and methodology provided that could be used as an email to the appropriate authority."
            }, {
                role: "user",
                content: prompt
            }],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const rtiRequest = completion.choices[0].message.content || 'Failed to generate RTI request';
        
        console.log('\n=== AI Generated RTI Request ===');
        console.log(rtiRequest);
        console.log('===========================\n');

        // Save the RTI request
        if (req.user?.userId) {
            const result = await db.run(`
                INSERT INTO rti_requests (
                    claim_id,
                    validator_id,
                    status,
                    notes,
                    ai_generated_rti_request,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now'))
            `, [claim_id, req.user.userId, 'GENERATED', '', rtiRequest]);

            // Update the claim's status
            await db.run(
                'UPDATE claims SET status = ? WHERE id = ?',
                ['RTI Request Created', claim_id]
            );

            // Get the created RTI request with validator username
            const createdRequest = await db.get(`
                SELECT r.*, u.username as validator_username
                FROM rti_requests r
                JOIN users u ON r.validator_id = u.id
                WHERE r.id = ?
            `, [result.lastID]);

            res.json(createdRequest);
        } else {
            res.status(401).json({ error: 'User not authenticated' });
        }
    } catch (error) {
        console.error('Error generating RTI request:', error);
        res.status(500).json({ error: 'Failed to generate RTI request' });
    }
});

// Get all RTI requests for a claim
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { claimId } = req.query;
    if (!claimId) {
        return res.status(400).json({ error: 'Claim ID is required' });
    }

    try {
        const db = await getDB();
        const rtiRequests = await db.all(`
            SELECT r.*, u.username as validator_username
            FROM rti_requests r
            JOIN users u ON r.validator_id = u.id
            WHERE r.claim_id = ? 
            ORDER BY r.created_at DESC
        `, [claimId]);

        res.json(rtiRequests);
    } catch (err) {
        console.error('Error fetching RTI requests:', err);
        res.status(500).json({ error: 'Failed to fetch RTI requests' });
    }
});

// Get a specific RTI request
router.get('/:requestId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { claimId } = req.query;
    const { requestId } = req.params;
    if (!claimId) {
        return res.status(400).json({ error: 'Claim ID is required' });
    }

    try {
        const db = await getDB();
        const rtiRequest = await db.get(`
            SELECT r.*, u.username as validator_username
            FROM rti_requests r
            JOIN users u ON r.validator_id = u.id
            WHERE r.claim_id = ? AND r.id = ?
        `, [claimId, requestId]);

        if (!rtiRequest) {
            return res.status(404).json({ error: 'RTI request not found' });
        }

        res.json(rtiRequest);
    } catch (err) {
        console.error('Error fetching RTI request:', err);
        res.status(500).json({ error: 'Failed to fetch RTI request' });
    }
});

export default router; 