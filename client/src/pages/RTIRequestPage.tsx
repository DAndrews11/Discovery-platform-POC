import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    published_url?: string;
    comments?: string;
}

interface RTIRequest {
    id: number;
    status: string;
    validator_username: string;
    created_at: string;
    ai_generated_rti_request: string;
    notes: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function RTIRequestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProcessStarted, setIsProcessStarted] = useState(false);
    const [rtiRequest, setRTIRequest] = useState<RTIRequest | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const fetchClaim = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/claims/${id}`);
                setClaim(response.data);
            } catch (err: any) {
                console.error('Error fetching claim:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError('Failed to fetch claim details');
            } finally {
                setLoading(false);
            }
        };

        fetchClaim();
    }, [id]);

    const handleStartProcess = async () => {
        console.log('Starting RTI process...');
        if (!claim) {
            console.log('No claim found, returning');
            return;
        }
        
        console.log('Setting processing and thinking states...');
        setIsProcessStarted(true);
        setIsThinking(true);
        
        try {
            console.log('Making API request to /rti/start with claim:', claim);
            const response = await axios.post('/rti/start', {
                claim_id: claim.id,
                claim_nb_tx: claim.claim_nb_tx,
                claim_title: claim.claim_title,
                date_published: claim.date_published,
                published_url: claim.published_url,
                description: claim.description,
                comments: claim.comments
            });

            console.log('Received response from server:', response.data);
            const assistantMessage: Message = { role: 'assistant', content: response.data.response };
            setMessages([assistantMessage]);
        } catch (err: any) {
            console.error('Error starting RTI process:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.error || err.message || 'Failed to start RTI process');
            setIsProcessStarted(false);
        } finally {
            setIsThinking(false);
        }
    };

    const handleSendMessage = async () => {
        if (!currentMessage.trim()) return;

        const newMessage: Message = { role: 'user', content: currentMessage };
        setMessages(prev => [...prev, newMessage]);
        setCurrentMessage('');
        setIsThinking(true);

        try {
            const response = await axios.post('/rti/chat', {
                message: currentMessage,
                claim_id: id,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            });

            const assistantMessage: Message = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            console.error('Error in chat:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError('Failed to get response');
        } finally {
            setIsThinking(false);
        }
    };

    const handleGenerateRTIRequest = async () => {
        try {
            setIsThinking(true);

            const response = await axios.post('/rti/generate-request', {
                claim_id: id,
                messages: messages
            });

            setRTIRequest(response.data);
        } catch (err: any) {
            console.error('Error generating RTI request:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError('Failed to generate RTI request');
        } finally {
            setIsThinking(false);
        }
    };

    const handleViewRTIRequest = () => {
        if (rtiRequest) {
            navigate(`/claims/${id}/rti-request/${rtiRequest.id}`);
        }
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
                <div className="text-center text-red-600">{error || 'Claim not found'}</div>
            </div>
        );
    }

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isThinking ? 'cursor-wait' : ''}`}>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#822727] px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-white">RTI Request</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate(`/claims/${id}`)}
                            className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-white text-[#822727] rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]"
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
                                <div className="mt-1 text-sm text-gray-900">{claim.claim_nb_tx}</div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Claim Title</label>
                                <div className="mt-1 text-sm text-gray-900">{claim.claim_title}</div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <div className="mt-1 text-sm text-gray-900">{claim.status}</div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Date Published</label>
                                <div className="mt-1 text-sm text-gray-900">
                                    {new Date(claim.date_published).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Published URL</label>
                                <div className="mt-1 text-sm text-gray-900">
                                    <a href={claim.published_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                        {claim.published_url}
                                    </a>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <div className="mt-1 text-sm text-gray-900">{claim.description}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Process Preparation</h2>
                                <button
                                    onClick={handleStartProcess}
                                    disabled={isProcessStarted}
                                    className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                        isProcessStarted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6b1f1f]'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
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
                                                                        if (line.startsWith('Claim Summary:') || 
                                                                            line.startsWith('RTI Methodology:')) {
                                                                            return `${line}\n`;
                                                                        }
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
                                            {isThinking && (
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
                                    <div className={`mt-4 ${isThinking ? 'cursor-wait' : ''}`}>
                                        <textarea
                                            rows={6}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#822727] focus:ring-[#822727] sm:text-sm bg-gray-50"
                                            placeholder="Type your message here..."
                                            value={currentMessage}
                                            onChange={(e) => setCurrentMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                            disabled={isThinking}
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                onClick={handleSendMessage}
                                                className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                                    isThinking ? 'opacity-50 cursor-wait' : 'hover:bg-[#6b1f1f]'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                                                disabled={isThinking}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                        <div className="mt-4 flex justify-center">
                                            <button
                                                onClick={handleGenerateRTIRequest}
                                                className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                                    isThinking ? 'opacity-50 cursor-wait' : 'hover:bg-[#6b1f1f]'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                                                disabled={isThinking}
                                            >
                                                Generate RTI Request
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">RTI Request Summary</h2>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-y-auto" style={{ minHeight: '300px', maxHeight: 'fit-content' }}>
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed prose prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1.5 prose-strong:text-gray-900">
                                    {rtiRequest ? rtiRequest.ai_generated_rti_request : 'RTI Request will appear here...'}
                                </pre>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={handleViewRTIRequest}
                                    className={`px-4 py-2 bg-[#822727] text-white rounded-md shadow-sm text-sm font-medium ${
                                        !rtiRequest ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6b1f1f]'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#822727]`}
                                    disabled={!rtiRequest}
                                >
                                    View RTI Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 