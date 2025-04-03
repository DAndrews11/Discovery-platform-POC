import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';  // Import our configured axios instance

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
}

export default function SearchPage() {
    const navigate = useNavigate();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    
    // Search filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [status, setStatus] = useState('');

    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'general', label: 'General' },
        { value: 'political', label: 'Political' },
        { value: 'scientific', label: 'Scientific' },
        { value: 'health', label: 'Health' },
        { value: 'technology', label: 'Technology' },
        { value: 'environmental', label: 'Environmental' }
    ];

    const statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'Opened', label: 'Opened' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Closed', label: 'Closed' }
    ];

    const handleSearch = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Starting search with params:', {
                search: searchTerm,
                category: selectedCategory,
                status,
                dateFrom,
                dateTo
            });
            
            const response = await axios.get('/api/claims', {
                params: {
                    search: searchTerm,
                    category: selectedCategory,
                    status,
                    dateFrom,
                    dateTo
                }
            });

            console.log('Search response:', response.data);
            setClaims(response.data);
            setHasSearched(true);
        } catch (err: any) {
            console.error('Detailed search error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config
            });
            setError(`Failed to fetch claims: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setDateFrom('');
        setDateTo('');
        setStatus('');
        setClaims([]);
        setHasSearched(false);
        setError('');
    };

    const filteredClaims = claims.filter(claim => {
        const matchesSearch = 
            claim.claim_nb_tx.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.claim_title.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !selectedCategory || claim.category === selectedCategory;
        
        const matchesStatus = !status || claim.status === status;
        
        const claimDate = new Date(claim.date_published);
        const matchesDateFrom = !dateFrom || claimDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || claimDate <= new Date(dateTo);

        return matchesSearch && matchesCategory && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // Add navigation handler for Home button
    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#822727] px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-white">Search Claims</h1>
                    <button
                        onClick={handleHomeClick}
                        className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                    >
                        Home
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Search Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                                Search
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                                placeholder="Search by claim number or title"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                            >
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                            >
                                {statuses.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">
                                Date From
                            </label>
                            <input
                                type="date"
                                id="dateFrom"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                            />
                        </div>

                        <div>
                            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">
                                Date To
                            </label>
                            <input
                                type="date"
                                id="dateTo"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Search and Clear Buttons */}
                    <div className="flex justify-start space-x-4 mt-4 mb-8">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#822727] hover:bg-[#6b1f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                        >
                            Search
                        </button>
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Results Table */}
                    {hasSearched && (
                        <div className="mt-8">
                            {loading && <p className="text-center">Loading claims...</p>}
                            {error && <p className="text-red-600 text-center">{error}</p>}
                            
                            {!loading && !error && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Claim Number
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date Published
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created By
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredClaims.map((claim) => (
                                                <tr key={claim.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {claim.claim_nb_tx}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {claim.claim_title}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {claim.category}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(claim.date_published).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${claim.status === 'Opened' ? 'bg-green-100 text-green-800' : 
                                                            claim.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                                                            'bg-gray-100 text-gray-800'}`}>
                                                            {claim.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {claim.created_by_username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            onClick={() => navigate(`/claims/${claim.id}`)}
                                                            className="text-[#822727] hover:text-[#621d1d]"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredClaims.length === 0 && (
                                        <p className="text-center py-4 text-gray-500">No claims found matching your criteria.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 