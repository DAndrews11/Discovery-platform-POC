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

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ClaimValidationPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userInput, setUserInput] = useState('');
    const [validationReport, setValidationReport] = useState('');
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [latestReportId, setLatestReportId] = useState<number | null>(null);

    useEffect(() => {
        const fetchClaim = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`/api/claims/${id}`);
                setClaim(response.data);
            } catch (err: any) {
                console.error('Error fetching claim:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClaim();
    }, [id]);

    const handleStartProcess = async () => {
        if (!claim) return;

        setIsProcessStarted(true);
        setIsTyping(true);

        try {
            setError('');
            const response = await axios.post('/api/validate/start', {
                claim_nb_tx: claim.claim_nb_tx,
                claim_title: claim.claim_title,
                date_published: claim.date_published,
                published_url: claim.published_url,
                description: claim.description,
                comments: claim.comments
            });

            const assistantMessage: Message = { role: 'assistant' as const, content: response.data.response };
            setMessages([assistantMessage]);
        } catch (err: any) {
            console.error('Error starting validation:', err);
            setError(err.response?.data?.error || err.message || 'Failed to start validation process');
            setIsProcessStarted(false);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = async () => {
        if (!userInput.trim()) return;

        const newMessage: Message = { role: 'user', content: userInput };
        setMessages(prev => [...prev, newMessage]);
        setUserInput('');
        setIsTyping(true);

        try {
            const response = await axios.post('/api/validate/chat', {
                claim_id: id,
                message: userInput,
                messages: messages
            });
            const assistantMessage: Message = { role: 'assistant' as const, content: response.data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            console.error('Error sending message:', err);
            setError(err.response?.data?.error || err.message || 'Failed to send message');
        } finally {
            setIsTyping(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            setIsTyping(true);
            setIsProcessStarted(true);
            setError('');

            const response = await axios.post('/api/validate/generate-report', {
                claim_id: id,
                messages: messages
            });
            
            setValidationReport(response.data.conclusion);

            // Get the latest validation report ID
            const validationsResponse = await axios.get(`/api/claims/${id}/validations`);
            if (validationsResponse.data && validationsResponse.data.length > 0) {
                setLatestReportId(validationsResponse.data[0].id);
            }
        } catch (err: any) {
            console.error('Error generating report:', err);
            setError(err.response?.data?.error || err.message || 'Failed to generate report');
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const fetchLatestReportId = async () => {
        try {
            const response = await axios.get(`/api/claims/${id}/validations`);
            if (response.data && response.data.length > 0) {
                setLatestReportId(response.data[0].id);
            }
        } catch (err: any) {
            console.error('Error fetching latest report ID:', err);
        }
    };

    useEffect(() => {
        if (validationReport) {
            fetchLatestReportId();
        }
    }, [validationReport]);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error || !claim) return <div className="text-center p-4 text-red-600">{error || 'Claim not found'}</div>;

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isTyping ? 'cursor-wait' : ''}`}>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#822727] px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-white">Claim Validation Process</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate(`/claims/${id}`)}
                            className={`px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium ${
                                isTyping ? 'opacity-50 cursor-wait' : 'hover:bg-gray-50'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                            disabled={isTyping}
                        >
                            Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className={`px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium ${
                                isTyping ? 'opacity-50 cursor-wait' : 'hover:bg-gray-50'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                            disabled={isTyping}
                        >
                            Home
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
                                    <a href={claim.published_url} target="_blank" rel="noopener noreferrer" 
                                       className="text-blue-600 hover:text-blue-800">
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

                    {/* Validation Process Section */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Process Preparation</h2>
                                <button
                                    onClick={handleStartProcess}
                                    className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                        isTyping || isProcessStarted ? 'opacity-50 cursor-wait' : 'hover:bg-[#6b1f1f]'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                                    disabled={isTyping || isProcessStarted}
                                >
                                    Start
                                </button>
                            </div>
                            
                            {isProcessStarted && (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <div className="space-y-3">
                                            {messages.map((message, index) => (
                                                <div key={index} className="flex items-start space-x-3">
                                                    {message.role === 'assistant' ? (
                                                        <div className="flex-shrink-0">
                                                            <img src="/src/components/Icons/PrincipalInvestigator.png" alt="AI Avatar" className="h-10 w-10 rounded-full" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex-shrink-0 w-10 text-right">
                                                            <span className="text-sm font-medium text-gray-700">User:</span>
                                                        </div>
                                                    )}
                                                    <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                                                        <div className={`text-sm ${
                                                            message.role === 'user' 
                                                                ? 'bg-blue-50 text-gray-900 p-3 rounded-lg inline-block max-w-[90%]' 
                                                                : 'text-gray-700 whitespace-pre-line leading-relaxed prose prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-strong:text-gray-900'
                                                        }`}>
                                                            {message.role === 'assistant' 
                                                                ? message.content
                                                                    .split('\n')
                                                                    .map((line, i) => {
                                                                        // Add moderate spacing after sections
                                                                        if (line.startsWith('Claim Summary:') || 
                                                                            line.startsWith('Validation Methodology:')) {
                                                                            return `${line}\n`;
                                                                        }
                                                                        // Add small spacing before numbered items
                                                                        if (/^\d\./.test(line)) {
                                                                            return `${line}`;
                                                                        }
                                                                        return line;
                                                                    })
                                                                    .join('\n')
                                                                : message.content
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {isTyping && (
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <img src="/src/components/Icons/PrincipalInvestigator.png" alt="AI Avatar" className="h-10 w-10 rounded-full" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700">Thinking...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`mt-4 ${isTyping ? 'cursor-wait' : ''}`}>
                                        <textarea
                                            rows={6}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                                            placeholder="Type your message here..."
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={isTyping}
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                onClick={handleSubmit}
                                                className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                                    isTyping ? 'opacity-50 cursor-wait' : 'hover:bg-[#6b1f1f]'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                                                disabled={isTyping}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                        <div className="mt-4 flex justify-center">
                                            <button
                                                onClick={handleGenerateReport}
                                                className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                                    isTyping ? 'opacity-50 cursor-wait' : 'hover:bg-[#6b1f1f]'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                                                disabled={isTyping}
                                            >
                                                Generate Validation Report
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Validation Report Summary</h2>
                            <div className="bg-gray-50 p-4 rounded-lg h-[300px] mb-4">
                                <pre className="whitespace-pre-wrap text-sm">
                                    {validationReport || 'Validation Summary will appear here...'}
                                </pre>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => latestReportId && navigate(`/claims/${id}/validation-report/${latestReportId}`)}
                                    className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                        isTyping || !latestReportId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6b1f1f]'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                                    disabled={isTyping || !latestReportId}
                                >
                                    View Validation Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 