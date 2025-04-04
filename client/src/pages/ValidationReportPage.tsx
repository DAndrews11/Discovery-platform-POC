import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

interface ValidationReport {
    id: number;
    status: string;
    validator_username: string;
    created_at: string;
    ai_generated_conclusion: string;
    ai_generated_full_report: string;
    notes: string;
}

export default function ValidationReportPage() {
    const { claimId, reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<ValidationReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`/api/claims/${claimId}/validations/${reportId}`);
                setReport(response.data);
            } catch (err: any) {
                console.error('Error fetching validation report:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [claimId, reportId]);

    const handleBack = () => {
        navigate(`/claims/${claimId}`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">Loading validation report...</div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-red-600">{error || 'Report not found'}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#822727] px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-white">Validation Report</h1>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Summary */}
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Validator</p>
                                            <p className="mt-1">{report.validator_username}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Status</p>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${report.status === 'REPORT_GENERATED' ? 'bg-green-100 text-green-800' : 
                                                'bg-gray-100 text-gray-800'}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Date Generated</p>
                                            <p className="mt-1">{new Date(report.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Conclusion</p>
                                        <div className="bg-white rounded p-3 border border-gray-200">
                                            <p className="whitespace-pre-wrap text-sm">{report.ai_generated_conclusion}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Full Report */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Full Report</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="bg-white rounded p-3 border border-gray-200">
                                    <p className="whitespace-pre-wrap text-sm">{report.ai_generated_full_report}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 