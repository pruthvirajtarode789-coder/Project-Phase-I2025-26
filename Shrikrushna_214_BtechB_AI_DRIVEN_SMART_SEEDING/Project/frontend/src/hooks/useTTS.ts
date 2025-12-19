import { useState, useEffect, useCallback } from 'react';

interface UseTTSResult {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
    supported: boolean;
}

const TTS_API_URL = 'http://localhost:5001/api/tts';

export const useTTS = (language: 'en' | 'hi' | 'mr'): UseTTSResult => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        // Check if browser supports audio playback
        setSupported(true);
    }, []);

    const speak = useCallback(async (text: string) => {
        if (!supported || !text.trim()) return;

        try {
            // Cancel any current speech
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            setIsSpeaking(true);

            // Create cache key
            const cacheKey = `${language}:${text}`;

            // Check cache first
            let audioBase64 = audioCache.get(cacheKey);

            if (!audioBase64) {
                // Fetch from API
                const response = await fetch(TTS_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text, language }),
                });

                if (response.ok) {
                    const data = await response.json();
                    audioBase64 = data.audio;

                    // Cache the audio
                    setAudioCache(prev => new Map(prev).set(cacheKey, audioBase64!));
                } else {
                    const errorData = await response.json();

                    // If fallback is indicated, use Web Speech API
                    if (errorData.fallback) {
                        console.warn('TTS API unavailable, falling back to Web Speech API');
                        useWebSpeechFallback(text, language);
                        return;
                    }

                    throw new Error('TTS API request failed');
                }
            }

            // Create and play audio
            const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
            setCurrentAudio(audio);

            audio.onended = () => {
                setIsSpeaking(false);
                setCurrentAudio(null);
            };

            audio.onerror = () => {
                console.error('Audio playback error, falling back to Web Speech API');
                useWebSpeechFallback(text, language);
            };

            await audio.play();

        } catch (error) {
            console.error('TTS error:', error);
            // Fallback to Web Speech API
            useWebSpeechFallback(text, language);
        }
    }, [supported, language, currentAudio, audioCache]);

    const useWebSpeechFallback = (text: string, lang: 'en' | 'hi' | 'mr') => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            const langMap: Record<string, string> = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'mr': 'mr-IN'
            };
            utterance.lang = langMap[lang] || 'en-IN';

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            setIsSpeaking(false);
        }
    };

    const cancel = useCallback(() => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
        }

        // Also cancel Web Speech API if it's running
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        setIsSpeaking(false);
    }, [currentAudio]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentAudio) {
                currentAudio.pause();
            }
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [currentAudio]);

    return { speak, cancel, isSpeaking, supported };
};
