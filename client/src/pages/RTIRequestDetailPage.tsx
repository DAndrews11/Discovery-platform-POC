import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

interface Claim {
    id: number;
    claim_nb_tx: string;
    claim_title: string;
    description: string;
    published_url: string;
    status: string;
    date_published: string;
    comments: string;
    category: string;
    created_by_username: string;
    created_at: string;
    updated_at?: string;
}

interface RTIRequest {
    id: number;
    claim_id: number;
    validator_id: number;
    validator_username: string;
    status: string;
    notes: string;
    ai_generated_rti_request: string;
    created_at: string;
}

export default function RTIRequestDetailPage() {
    const { id, requestId } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [rtiRequest, setRTIRequest] = useState<RTIRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                // Fetch claim details
                const claimResponse = await axios.get(`/claims/${id}`);
                setClaim(claimResponse.data);
                
                // Fetch RTI request details
                const rtiResponse = await axios.get(`/rti/${requestId}`, {
                    params: { claimId: id }
                });
                setRTIRequest(rtiResponse.data);
                
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, requestId]);

    const handleBack = () => {
        navigate(`/claims/${id}`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (error || !claim || !rtiRequest) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-red-600">{error || 'Data not found'}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#822727] px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-white">RTI Request Details</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                        >
                            Back to Claim
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Claim Summary Section */}
                    <div className="mb-6 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Claim #</label>
                                <div className="mt-1">{claim.claim_nb_tx}</div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Claim Title</label>
                                <div className="mt-1">{claim.claim_title}</div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <div className="mt-1">{claim.status}</div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Date Published</label>
                                <div className="mt-1">{new Date(claim.date_published).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Published URL</label>
                                <div className="mt-1">
                                    <a href={claim.published_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                        {claim.published_url}
                                    </a>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <div className="mt-1">{claim.description}</div>
                            </div>
                        </div>
                    </div>

                    {/* RTI Request Details Section */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">RTI Request Details</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">{rtiRequest.status}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Generated By</label>
                                    <div className="mt-1">{rtiRequest.validator_username}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                                    <div className="mt-1">{new Date(rtiRequest.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RTI Request Content Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">RTI Request Content</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm font-mono">
                                {rtiRequest.ai_generated_rti_request}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 