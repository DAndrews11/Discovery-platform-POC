import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PrincipalInvestigator from '../components/Icons/PrincipalInvestigator.png';
import axios from '../utils/axios';

// SVG icons as components
const DocumentPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const DocumentSearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

interface ClaimStats {
    total: number;
    active: number;
    completed: number;
}

export default function WelcomePage() {
    const [stats, setStats] = useState<ClaimStats>({ total: 0, active: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/claims/stats');
            setStats(response.data);
        } catch (err: any) {
            console.error('Error fetching stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center py-16 sm:py-20">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Welcome to the</span>
                    <span className="block text-[#822727]">Discovery Platform</span>
                </h1>
                <div className="flex items-start justify-center mt-6">
                    <div className="flex items-start max-w-5xl">
                        <img 
                            src={PrincipalInvestigator} 
                            alt="Principal Investigator Avatar" 
                            className="w-16 h-16 object-contain mr-2"
                        />
                        <p className="text-left text-base text-gray-500 sm:text-lg md:text-xl whitespace-nowrap pt-1">
                            - Your platform for validating and verifying public claims using AI-powered analysis.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Actions Grid */}
            <div className="mt-10">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {/* Create New Claim Card */}
                    <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#822727] rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                        <div>
                            <span className="rounded-lg inline-flex p-3 bg-[#822727]/10 text-[#822727] ring-4 ring-white">
                                <DocumentPlusIcon />
                            </span>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-medium">
                                <Link to="/claims/new" className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Create New Claim
                                </Link>
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Submit a new claim for validation and analysis using our AI-powered platform.
                            </p>
                        </div>
                    </div>

                    {/* Search Claims Card */}
                    <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#822727] rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                        <div>
                            <span className="rounded-lg inline-flex p-3 bg-[#822727]/10 text-[#822727] ring-4 ring-white">
                                <DocumentSearchIcon />
                            </span>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-medium">
                                <Link to="/claims/search" className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Search Claims
                                </Link>
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Browse and search through existing claims, view validation reports, and track progress.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="mt-16">
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Claims</dt>
                        <dd className="mt-1 text-3xl font-semibold text-[#822727]">
                            {loading ? (
                                <span className="text-gray-400">...</span>
                            ) : error ? (
                                <span className="text-red-600 text-sm">Error loading stats</span>
                            ) : (
                                stats.total
                            )}
                        </dd>
                    </div>
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Claims</dt>
                        <dd className="mt-1 text-3xl font-semibold text-[#822727]">
                            {loading ? (
                                <span className="text-gray-400">...</span>
                            ) : error ? (
                                <span className="text-red-600 text-sm">Error loading stats</span>
                            ) : (
                                stats.active
                            )}
                        </dd>
                    </div>
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed Claims</dt>
                        <dd className="mt-1 text-3xl font-semibold text-[#822727]">
                            {loading ? (
                                <span className="text-gray-400">...</span>
                            ) : error ? (
                                <span className="text-red-600 text-sm">Error loading stats</span>
                            ) : (
                                stats.completed
                            )}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
} 