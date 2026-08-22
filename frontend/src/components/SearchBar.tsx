'use client';

import { useState, useRef } from 'react';
import { Search, MapPin, Loader2, Camera, Mic, MicOff } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string, pincode: string) => void;
    isLoading?: boolean;
    onOpenVisualSearch?: () => void;
}

export default function SearchBar({ onSearch, isLoading, onOpenVisualSearch }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [pincode, setPincode] = useState('');
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser. Try Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            // Optionally auto-submit: onSearch(transcript, pincode);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        if (!/^\d{6}$/.test(pincode)) {
            setError('Enter valid 6-digit pincode');
            return;
        }
        setError('');
        onSearch(query, pincode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-[var(--bg-card)] rounded-2xl p-2 border border-[var(--border-color)] glow-cyan">
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search Input */}
                    <div className="flex-1 relative flex items-center">
                        <Search size={18} className="absolute left-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search or ask anything..."
                            className="w-full bg-[var(--bg-secondary)] text-white placeholder-[var(--text-muted)] 
                                       pl-11 pr-24 py-3.5 rounded-xl border border-transparent
                                       focus:border-[var(--accent-cyan)]/50 focus:bg-[var(--bg-card)]
                                       transition-all text-sm"
                        />
                        <div className="absolute right-3 flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={toggleListening}
                                className={`p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-[var(--text-muted)] hover:text-white'}`}
                                title="Voice Search"
                            >
                                {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
                            </button>
                            <button 
                                type="button" 
                                onClick={onOpenVisualSearch}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
                                title="Visual Search"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Pincode Input */}
                    <div className="relative sm:w-40">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => {
                                setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                setError('');
                            }}
                            placeholder="Pincode"
                            className={`w-full bg-[var(--bg-secondary)] text-white placeholder-[var(--text-muted)]
                        pl-11 pr-4 py-3.5 rounded-xl border transition-all text-sm
                        ${error ? 'border-red-500' : 'border-transparent focus:border-[var(--accent-green)]/50'}`}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)]
                     text-black font-semibold px-6 py-3.5 rounded-xl text-sm
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all flex items-center justify-center gap-2 min-w-[120px]"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            'Compare'
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-xs mt-2 ml-2">{error}</p>
            )}

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
                <span className="text-[var(--text-muted)] text-xs">Try:</span>
                {['Milk', 'Bread', 'Coffee', 'Chips'].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                     hover:text-[var(--accent-cyan)] border border-[var(--border-color)]
                     text-xs transition-colors"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </form>
    );
}
