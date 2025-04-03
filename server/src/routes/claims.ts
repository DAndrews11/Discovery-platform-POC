import express from 'express';
import { runQuery, getDB } from '../db/utils';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface AuthenticatedRequest extends express.Request {
    user?: {
        userId: number;
        username: string;
    };
}

interface Claim {
    id: number;
    claim_nb_tx: string;
    claim_title: string;
    description: string;
    published_url: string;
    category: string;
    status: string;
    created_by: number;
    created_at: string;
    date_published: string;
    updated_at?: string;
    created_by_username?: string;
}

interface CountResult {
    count: number;
}

interface InsertResult {
    id: number;
}

// Get all claims with optional filters
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        
        // Get total claims count
        const totalClaims = await db.get('SELECT COUNT(*) as count FROM claims');
        
        // Get active claims count (status is not 'Closed')
        const activeClaims = await db.get('SELECT COUNT(*) as count FROM claims WHERE status != ?', ['Closed']);
        
        // Get completed claims count (status is 'Closed')
        const completedClaims = await db.get('SELECT COUNT(*) as count FROM claims WHERE status = ?', ['Closed']);

        res.json({
            total: totalClaims.count,
            active: activeClaims.count,
            completed: completedClaims.count
        });
    } catch (err) {
        console.error('Error fetching claim statistics:', err);
        res.status(500).json({ error: 'Failed to fetch claim statistics' });
    }
});

// Get all claims with optional filters
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const query = `
            SELECT 
                c.*,
                u.username as created_by_username
            FROM claims c
            LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC
        `;
        
        const claims = await runQuery<Claim>(query);
        res.json(claims);
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

// Get a specific claim by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching claim with ID:', id); // Debug log
        
        const query = `
            SELECT 
                c.*,
                u.username as created_by_username
            FROM claims c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        `;
        
        const claims = await runQuery<Claim>(query, [id]);
        console.log('Query result:', claims); // Debug log
        
        if (!claims || claims.length === 0) {
            console.log('No claim found with ID:', id); // Debug log
            return res.status(404).json({ error: 'Claim not found' });
        }
        
        res.json(claims[0]);
    } catch (error) {
        console.error('Error fetching claim:', error);
        res.status(500).json({ error: 'Failed to fetch claim' });
    }
});

// Create a new claim
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { claim_title, description, published_url, category, status = 'Opened', date_published } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Generate claim number (GEN-XXXXX)
        const countResult = await runQuery<{ count: number }>(
            'SELECT COUNT(*) as count FROM claims'
        );
        const claimCount = countResult[0]?.count ?? 0;
        const claimNumber = `GEN-${String(claimCount + 1).padStart(5, '0')}`;

        const insertQuery = `
            INSERT INTO claims (
                claim_nb_tx, claim_title, description, published_url, category, 
                status, created_by, created_at, date_published
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
            RETURNING id
        `;

        const insertResult = await runQuery<{ id: number }>(insertQuery, [
            claimNumber, claim_title, description, published_url, category,
            status, userId, date_published || new Date().toISOString()
        ]);

        const newClaimId = insertResult[0]?.id;

        // Fetch the created claim with user information
        const selectQuery = `
            SELECT 
                c.*,
                u.username as created_by_username
            FROM claims c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        `;
        
        const claims = await runQuery<Claim>(selectQuery, [newClaimId]);
        const createdClaim = claims[0];

        res.status(201).json(createdClaim);
    } catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ error: 'Failed to create claim' });
    }
});

// Update a claim
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const { description, comments, status } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if claim exists
        const existingClaims = await runQuery<Claim>('SELECT * FROM claims WHERE id = ?', [id]);
        if (!existingClaims[0]) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const updateQuery = `
            UPDATE claims 
            SET description = COALESCE(?, description),
                comments = COALESCE(?, comments),
                status = COALESCE(?, status),
                updated_at = datetime('now')
            WHERE id = ?
        `;

        await runQuery(updateQuery, [description, comments, status, id]);

        // Fetch the updated claim with user information
        const selectQuery = `
            SELECT 
                c.*,
                u.username as created_by_username
            FROM claims c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        `;
        
        const claims = await runQuery<Claim>(selectQuery, [id]);
        const updatedClaim = claims[0];

        res.json(updatedClaim);
    } catch (error) {
        console.error('Error updating claim:', error);
        res.status(500).json({ error: 'Failed to update claim' });
    }
});

// Delete a claim
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // First delete any associated validations
        await runQuery('DELETE FROM validations WHERE claim_id = ?', [id]);
        
        // Then delete the claim
        const result = await runQuery('DELETE FROM claims WHERE id = ?', [id]);
        
        res.json({ message: 'Claim deleted successfully' });
    } catch (error) {
        console.error('Error deleting claim:', error);
        res.status(500).json({ error: 'Failed to delete claim' });
    }
});

// Get validations for a claim
router.get('/:id/validations', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const db = await getDB();

        // Get all validations for the claim with validator usernames
        const validations = await db.all(`
            SELECT 
                validations.id,
                validations.status,
                validations.notes,
                validations.ai_generated_full_report,
                validations.ai_generated_conclusion,
                validations.created_at,
                users.username as validator_username
            FROM validations 
            JOIN users ON validations.validator_id = users.id 
            WHERE claim_id = ?
            ORDER BY validations.created_at DESC
        `, [id]);

        res.json(validations);
    } catch (error) {
        console.error('Error fetching validations:', error);
        res.status(500).json({ error: 'Failed to fetch validations' });
    }
});

// Get a specific validation report
router.get('/:claimId/validations/:reportId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { claimId, reportId } = req.params;
        const db = await getDB();

        // Get the specific validation with validator username
        const validation = await db.get(`
            SELECT 
                validations.id,
                validations.status,
                validations.notes,
                validations.ai_generated_full_report,
                validations.ai_generated_conclusion,
                validations.created_at,
                users.username as validator_username
            FROM validations 
            JOIN users ON validations.validator_id = users.id 
            WHERE validations.claim_id = ? AND validations.id = ?
        `, [claimId, reportId]);

        if (!validation) {
            return res.status(404).json({ error: 'Validation report not found' });
        }

        res.json(validation);
    } catch (error) {
        console.error('Error fetching validation report:', error);
        res.status(500).json({ error: 'Failed to fetch validation report' });
    }
});

// Delete a validation report
router.delete('/:claimId/validations/:reportId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { claimId, reportId } = req.params;
        const db = await getDB();

        // First check if the validation exists
        const validation = await db.get(
            'SELECT * FROM validations WHERE claim_id = ? AND id = ?',
            [claimId, reportId]
        );

        if (!validation) {
            return res.status(404).json({ error: 'Validation report not found' });
        }

        // Delete the validation
        await db.run(
            'DELETE FROM validations WHERE claim_id = ? AND id = ?',
            [claimId, reportId]
        );

        res.json({ message: 'Validation report deleted successfully' });
    } catch (error) {
        console.error('Error deleting validation report:', error);
        res.status(500).json({ error: 'Failed to delete validation report' });
    }
});

// RTI Request Routes
router.post('/:claimId/rti-request/generate', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { claimId } = req.params;
    const userId = req.user?.userId;

    try {
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const db = await getDB();

        // Get the latest validation report for context
        const latestValidation = await db.get(`
            SELECT * FROM validations 
            WHERE claim_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [claimId]);

        if (!latestValidation) {
            return res.status(400).json({ error: 'No validation report found for this claim' });
        }

        // Get user information
        const user = await db.get('SELECT username FROM users WHERE id = ?', [userId]);

        // TODO: Replace this with actual OpenAI call
        const aiGeneratedRTIRequest = `Sample RTI Request Plan based on validation report:
1. Review latest validation report
2. Identify potential information gaps
3. Draft RTI requests to fill these gaps`;

        // Insert the RTI request record
        const result = await db.run(`
            INSERT INTO rti_requests (
                claim_id,
                status,
                validator_username,
                ai_generated_rti_request,
                created_at
            ) VALUES (?, ?, ?, ?, datetime('now'))
        `, [claimId, 'GENERATED', user.username, aiGeneratedRTIRequest]);

        // Fetch the created RTI request
        const rtiRequest = await db.get(`
            SELECT * FROM rti_requests 
            WHERE id = ?
        `, [result.lastID]);

        res.json(rtiRequest);
    } catch (err) {
        console.error('Error generating RTI request:', err);
        res.status(500).json({ error: 'Failed to generate RTI request' });
    }
});

router.get('/:claimId/rti-requests', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { claimId } = req.params;

    try {
        const db = await getDB();
        const rtiRequests = await db.all(`
            SELECT * FROM rti_requests 
            WHERE claim_id = ? 
            ORDER BY created_at DESC
        `, [claimId]);

        res.json(rtiRequests);
    } catch (err) {
        console.error('Error fetching RTI requests:', err);
        res.status(500).json({ error: 'Failed to fetch RTI requests' });
    }
});

export default router; 