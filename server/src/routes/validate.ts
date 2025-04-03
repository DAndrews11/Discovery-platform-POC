import express from 'express';
import { getDB } from '../db/utils.js';
import { authenticateToken } from '../middleware/auth.js';
import { openai } from '../services/openai.js';
import OpenAI from 'openai';

const router = express.Router();

// Static validation methodology steps
const VALIDATION_METHODOLOGY = {
    step1: {
        title: "Clearly Define the Claim",
        tasks: [
            "Identify and document:",
            "- Exact wording of the claim",
            "- Source and date of publication",
            "- Key details provided in the initial claim (e.g., dates, locations, names, figures)"
        ]
    },
    step2: {
        title: "Verify Through Official Sources",
        tasks: [
            "Check official websites, press releases, or announcements from relevant authorities (government websites, corporate pages, official social media accounts)",
            "Look for direct confirmations or related documentation (official statements, budgets, timelines, reports)"
        ]
    },
    step3: {
        title: "Cross-Reference with Independent Online Media",
        tasks: [
            "Search reputable online news organizations (local, national, international) to validate or challenge the claim",
            "Note discrepancies, additional details, or corroborating evidence reported independently"
        ]
    },
    step4: {
        title: "Gather Stakeholder and Community Feedback Digitally",
        tasks: [
            "Scan social media platforms, local forums, and community discussion boards for reactions and discussions about the claim",
            "Document and verify public sentiment, eyewitness accounts, or independent photographic/video evidence shared publicly"
        ]
    },
    step5: {
        title: "Review Public Records and Documentation",
        tasks: [
            "Access online transparency portals, Freedom of Information (FOI) databases, public budget reports, or inspection and compliance records",
            "Confirm that records align with the claim's stated facts and timelines"
        ]
    },
    step6: {
        title: "Consult Additional Credible Third-party Sources",
        tasks: [
            "Check websites of independent authorities, industry experts, watchdog organizations, or NGOs to further substantiate or challenge the claim",
            "Identify expert opinions, analysis, or independent verification reports online"
        ]
    },
    step7: {
        title: "Analyze and Document Findings",
        tasks: [
            "Clearly document evidence gathered from each step",
            "Highlight confirmations, contradictions, or gaps uncovered in verification"
        ]
    },
    step8: {
        title: "Prepare a Verification Summary Report",
        tasks: [
            "Summarize the results clearly, identifying:",
            "- Verified facts",
            "- Discrepancies found",
            "- Unverifiable elements",
            "Cite all online sources with clear references (URLs, timestamps, documents)"
        ]
    }
};

interface ValidationRecord {
    validator_username: string;
    status: string;
    notes: string;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Claim {
    id: number;
    claim_nb_tx: string;
    claim_title: string;
    description: string;
    published_url: string;
    category: string;
    created_by_username: string;
}

// New endpoint for starting validation process
router.post('/start', authenticateToken, async (req, res) => {
    try {
        const {
            claim_nb_tx,
            claim_title,
            date_published,
            published_url,
            description,
            comments
        } = req.body;

        // Prepare the prompt for OpenAI
        const prompt = `Please first summarize the following claim concisely:
Claim Number: ${claim_nb_tx}
Claim Title: ${claim_title}
Date Published: ${date_published}
Source URL: ${published_url}
Description: ${description}
Additional Comments: ${comments}

Please remind the user of the Validation Methodology that will be used to validate this claim:
1. Clearly Define the Claim
2. Verify Through Official Sources
3. Cross-Reference with Independent Online Media
4. Gather Stakeholder and Community Feedback Digitally
5. Review Public Records and Documentation
6. Consult Additional Credible Third-party Sources
7. Analyze and Document Findings
8. Prepare a Verification Summary Report

Please structure your response in a short friendly conversational way, as you are the principal investigator guiding this validation process. You need to ask if there any other considerations before starting the validation process.

IMPORTANT FORMATTING NOTES:
1. Start with "Claim Summary:" on its own line
2. Follow with the claim summary in a new paragraph
3. Add a blank line before "Validation Methodology:"
4. List each methodology step on a new line with proper numbering
5. End with your question about additional considerations in a new paragraph
6. Do not write this as a letter - no greetings or signatures
7. Use line breaks to separate major sections and enhance readability`;

        // Output the prompt to the console
        console.log('Prompt being sent to OpenAI:', prompt);

        // Simple OpenAI API call
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are a principal investigator preparing to validate an online published claim. Your responses should be to the point, friendly, and conversational as this is the start of the validation process."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content || 'No response generated';

        res.json({
            response: response
        });
    } catch (error) {
        console.error('Error starting validation:', error);
        res.status(500).json({ error: 'Internal server error during validation start' });
    }
});

// Chat endpoint for ongoing validation conversation
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, claim_id, messages } = req.body;
        const db = await getDB();

        // Get the claim details for context
        const claim = await db.get<Claim>(
            'SELECT claims.*, users.username as created_by_username FROM claims JOIN users ON claims.created_by = users.id WHERE claims.id = ?',
            [claim_id]
        );

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Prepare the conversation history for context
        const conversationHistory = messages.map((msg: Message) => ({
            role: msg.role,
            content: msg.content
        }));

        // Prepare the system message with validation context
        const systemMessage = {
            role: "system",
            content: `You are a principal investigator helping to validate a claim. The claim details are:
Claim Number: ${claim.claim_nb_tx}
Title: ${claim.claim_title}
Description: ${claim.description}
Source: ${claim.published_url}
Category: ${claim.category}

Your role is to help investigate this claim following our validation methodology. Be thorough but concise in your responses.
Keep the conversation focused on validating this specific claim.
If the user asks about something unrelated, politely redirect them back to the claim validation process.`
        };

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                systemMessage,
                ...conversationHistory,
                { role: "user", content: message }
            ],
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content || 'No response generated';

        res.json({
            response: response
        });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Internal server error during chat' });
    }
});

// Generate validation report endpoint
router.post('/generate-report', authenticateToken, async (req, res) => {
    try {
        const { claim_id, messages } = req.body;
        const db = await getDB();

        // Get the claim details
        const claim = await db.get<Claim>(
            'SELECT claims.*, users.username as created_by_username FROM claims JOIN users ON claims.created_by = users.id WHERE claims.id = ?',
            [claim_id]
        );

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Get validation history
        const validationHistory: ValidationRecord[] = await db.all(
            'SELECT validations.*, users.username as validator_username FROM validations JOIN users ON validations.validator_id = users.id WHERE claim_id = ? ORDER BY created_at DESC',
            [claim_id]
        );

        // Create a structured methodology string
        const methodologySteps = Object.entries(VALIDATION_METHODOLOGY)
            .map(([key, step]) => {
                return `${step.title}:\n${step.tasks.map(task => `  ${task}`).join('\n')}`;
            })
            .join('\n\n');

        // Include the conversation history in the prompt
        const conversationSummary = messages
            .map((msg: Message) => `${msg.role.toUpperCase()}: ${msg.content}`)
            .join('\n\n');

        // Prepare the prompt for OpenAI
        const prompt = `Please generate a comprehensive validation report for the following claim, taking into account the conversation history and following our structured methodology:

CLAIM DETAILS:
Claim Title: ${claim.claim_title}
Description: ${claim.description}
Source: ${claim.published_url}
Category: ${claim.category}

CONVERSATION HISTORY:
${conversationSummary}

PREVIOUS VALIDATIONS:
${validationHistory.map(v => `- ${v.validator_username}: ${v.status} - ${v.notes}`).join('\n')}

VALIDATION METHODOLOGY:
${methodologySteps}

Please provide a final comprehensive report that includes:
1. A clear executive summary of the claim validation
2. Key findings from each step of the methodology
3. Evidence and sources consulted
4. Final determination (True/False/Needs More Investigation)
5. Confidence level in the determination
6. Recommendations for further verification if needed

Format the report with clear sections and bullet points for readability.`;

        console.log('\n=== Generating Validation Report ===');
        console.log('Prompt:', prompt);
        console.log('=====================================\n');

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert fact-checker and investigator. Your task is to generate a comprehensive validation report based on the claim details, conversation history, and methodology provided."
            }, {
                role: "user",
                content: prompt
            }],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const report = completion.choices[0].message.content || 'Failed to generate report';
        
        console.log('\n=== AI Generated Report ===');
        console.log(report);
        console.log('===========================\n');

        // Extract conclusion from the report
        const conclusionPrompt = `Based on the following validation report, please provide a one-paragraph conclusion that summarizes the final determination and confidence level:

${report}

Keep your response focused only on the conclusion, determination (True/False/Needs More Investigation), and confidence level.`;

        const conclusionCompletion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are a fact-checker summarizing the conclusion of a validation report. Be concise and clear."
            }, {
                role: "user",
                content: conclusionPrompt
            }],
            max_tokens: 200,
            temperature: 0.7,
        });

        const conclusion = conclusionCompletion.choices[0].message.content || 'No conclusion generated';

        // Save the report and conclusion as a validation
        if (req.user?.userId) {
            await db.run(
                'INSERT INTO validations (claim_id, validator_id, status, notes, ai_generated_full_report, ai_generated_conclusion) VALUES (?, ?, ?, ?, ?, ?)',
                [claim_id, req.user.userId, 'REPORT_GENERATED', '', report, conclusion]
            );

            // Update the claim's status
            await db.run(
                'UPDATE claims SET status = ? WHERE id = ?',
                ['Validation Report Created', claim_id]
            );
        }

        res.json({ report, conclusion });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error during report generation' });
    }
});

export default router; 