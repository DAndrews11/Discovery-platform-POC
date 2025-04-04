import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

interface Claim {
    id: number;
    claim_nb_tx: string;
    claim_title: string;
    description: string;
    source: string;
    category: string;
    status: string;
    created_by: number;
    created_at: string;
    date_published: string;
    updated_at?: string;
    created_by_username?: string;
    published_url?: string;
    comments?: string;
}

interface ValidationReport {
    id: number;
    status: string;
    validator_username: string;
    created_at: string;
    ai_generated_conclusion: string;
    ai_generated_full_report: string;
    notes: string;
}

interface RTIRequest {
    id: number;
    status: string;
    validator_username: string;
    created_at: string;
    ai_generated_rti_request: string;
    notes: string;
}

export default function ClaimAdminPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showValidations, setShowValidations] = useState(false);
    const [showRTIRequests, setShowRTIRequests] = useState(false);
    const [validationReports, setValidationReports] = useState<ValidationReport[]>([]);
    const [rtiRequests, setRTIRequests] = useState<RTIRequest[]>([]);
    const [editedClaim, setEditedClaim] = useState<Partial<Claim>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Status options
    const statusOptions = [
        'Opened',
        'Validation Report Created',
        'Claim Successfully Validated',
        'RTI Request Created',
        'RTI Information Received',
        'Claim Validation Failed',
        'Closed'
    ];

    useEffect(() => {
        fetchClaim();
    }, [id]);

    const fetchClaim = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching claim with ID:', id);
            const response = await axios.get(`/api/claims/${id}`);
            console.log('Claim response:', response.data);
            setClaim(response.data);
            setEditedClaim({
                description: response.data.description,
                comments: response.data.comments,
                status: response.data.status
            });
        } catch (err: any) {
            console.error('Error fetching claim:', err);
            setError(err.message || 'Failed to fetch claim details');
        } finally {
            setLoading(false);
        }
    };

    const fetchValidationReports = async () => {
        try {
            const response = await axios.get(`/api/claims/${id}/validations`);
            setValidationReports(response.data);
            setShowValidations(true);
        } catch (err: any) {
            console.error('Error fetching validation reports:', err);
            setError('Failed to fetch validation reports');
        }
    };

    const fetchRTIRequests = async () => {
        try {
            const response = await axios.get(`/api/rti`, { params: { claimId: id } });
            setRTIRequests(response.data);
            setShowRTIRequests(true);
            setShowValidations(false);
        } catch (err: any) {
            console.error('Error fetching RTI requests:', err);
            setError('Failed to fetch RTI requests');
        }
    };

    const handleSave = async () => {
        if (!claim) return;
        
        setIsSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        
        try {
            const response = await axios.put(`/api/claims/${id}`, editedClaim);
            setClaim(prevClaim => ({
                ...prevClaim!,
                ...editedClaim
            }));
            
            setSaveSuccess(true);
            // Hide success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error updating claim:', err);
            setSaveError(err.message || 'Failed to update claim');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof Claim, value: string) => {
        setEditedClaim(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    const handleBackToSearch = () => {
        navigate('/claims/search');
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">Loading claim details...</div>
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-[#822727] px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-white">Claim Details</h1>
                        <div className="space-x-4">
                            <button
                                onClick={handleBackToSearch}
                                className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                            >
                                Back to Search
                            </button>
                            <button
                                onClick={handleHomeClick}
                                className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                            >
                                Home
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="text-center text-red-600">{error || 'Claim not found'}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#822727] px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4 relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white hover:text-gray-200 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-semibold text-white">Claim Details</h1>
                        
                        {/* Hamburger Menu Dropdown - Moved inside the left container */}
                        {isMenuOpen && (
                            <div className="absolute left-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu">
                                    <button
                                        onClick={fetchValidationReports}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        View Validation Reports
                                    </button>
                                    <button
                                        onClick={fetchRTIRequests}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        View RTI Requests
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={handleBackToSearch}
                            className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                        >
                            Back to Search
                        </button>
                        <button
                            onClick={handleHomeClick}
                            className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                        >
                            Home
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Claim Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Claim Number</label>
                                    <div className="mt-1 text-sm text-gray-900">{claim.claim_nb_tx}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <div className="mt-1 text-sm text-gray-900">{claim.claim_title}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Published URL</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        <a href={claim.published_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                            {claim.published_url}
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={editedClaim.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-100"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Status & Classification</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <div className="mt-1 text-sm text-gray-900">{claim.category}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={editedClaim.status || ''}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-100"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created By</label>
                                    <div className="mt-1 text-sm text-gray-900">{claim.created_by_username}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(claim.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(claim.updated_at || claim.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date Published</label>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(claim.date_published).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">Comments</label>
                                <textarea
                                    value={editedClaim.comments || ''}
                                    onChange={(e) => handleInputChange('comments', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-100"
                                    rows={4}
                                />
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => navigate(`/claims/${id}/validate`)}
                                        className="px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#6b1f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                                    >
                                        Validate Claim Process
                                    </button>
                                    <button
                                        onClick={() => navigate(`/claims/${id}/rti`)}
                                        className="px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#6b1f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                                    >
                                        RTI Request Process
                                    </button>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#6b1f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727] disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                            {saveError && (
                                <div className="mt-2 text-sm text-red-600">
                                    {saveError}
                                </div>
                            )}
                            {saveSuccess && (
                                <div className="mt-2 text-sm text-green-600">
                                    Changes saved successfully!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Validation Reports Section - Updated to table format */}
                    {showValidations && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Validation Reports</h2>
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                {validationReports.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Validator
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {validationReports.map((report) => (
                                                <tr 
                                                    key={report.id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => navigate(`/claims/${id}/validation-report/${report.id}`)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(report.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {report.validator_username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${report.status === 'REPORT_GENERATED' ? 'bg-green-100 text-green-800' : 
                                                            'bg-gray-100 text-gray-800'}`}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                                        View Details →
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500 p-4">No validation reports available.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* RTI Requests Section */}
                    {showRTIRequests && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">RTI Requests</h2>
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                {rtiRequests.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Validator
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {rtiRequests.map((request) => (
                                                <tr 
                                                    key={request.id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => navigate(`/claims/${id}/rti-request/${request.id}`)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(request.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {request.validator_username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${request.status === 'GENERATED' ? 'bg-green-100 text-green-800' : 
                                                            'bg-gray-100 text-gray-800'}`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                                        View Details →
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500 p-4">No RTI requests available.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 