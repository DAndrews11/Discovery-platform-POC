import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

interface ClaimFormData {
    claim_title: string;
    published_url: string;
    description: string;
    date_published: string;
    category: string;
    comments: string;
}

export default function CreateClaimPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ClaimFormData>({
        claim_title: '',
        published_url: '',
        description: '',
        date_published: new Date().toISOString().split('T')[0],
        category: 'general',
        comments: ''
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError('');
            
            const response = await axios.post('/claims', {
                claim_title: formData.claim_title,
                description: formData.description,
                published_url: formData.published_url,
                category: formData.category,
                date_published: formData.date_published
            });

            navigate(`/claims/${response.data.id}`);
        } catch (err: any) {
            console.error('Error creating claim:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#822727] px-6 py-4">
                    <h1 className="text-2xl font-semibold text-white">Create New Claim</h1>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="claim_title" className="block text-sm font-medium text-gray-700">
                                Claim Title
                            </label>
                            <input
                                type="text"
                                id="claim_title"
                                name="claim_title"
                                required
                                value={formData.claim_title}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                                placeholder="Enter a descriptive title for the claim"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                                placeholder="Provide additional context or details about the claim"
                            />
                        </div>

                        <div>
                            <label htmlFor="published_url" className="block text-sm font-medium text-gray-700">
                                Published URL
                            </label>
                            <input
                                type="url"
                                id="published_url"
                                name="published_url"
                                required
                                value={formData.published_url}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                                placeholder="https://example.com/article"
                            />
                        </div>

                        <div>
                            <label htmlFor="date_published" className="block text-sm font-medium text-gray-700">
                                Publication Date
                            </label>
                            <input
                                type="date"
                                id="date_published"
                                name="date_published"
                                value={formData.date_published}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                            >
                                <option value="general">General</option>
                                <option value="political">Political</option>
                                <option value="scientific">Scientific</option>
                                <option value="health">Health</option>
                                <option value="technology">Technology</option>
                                <option value="environmental">Environmental</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                                Comments
                            </label>
                            <textarea
                                id="comments"
                                name="comments"
                                rows={4}
                                value={formData.comments}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                                placeholder="Add any additional comments or notes"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}

                        <div className="flex justify-start space-x-4 mt-16">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#822727] hover:bg-[#722323] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                            >
                                {submitting ? 'Creating...' : 'Create Claim'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 