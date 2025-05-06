import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import PollRoom from './components/PollRoom';

const SERVER_URL = import.meta.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function App() {
    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isInRoom, setIsInRoom] = useState(false);
    const [pollState, setPollState] = useState({
        users: [], votes: {}, question: '', options: [], timer: 0, isVotingActive: false,
    });
    const [votedOption, setVotedOption] = useState(null);
    const [error, setError] = useState('');
    const socketRef = useRef(null);

    const clearErrorTimeoutRef = useRef(null);

    const displayError = useCallback((message) => {
        setError(message);
        if (clearErrorTimeoutRef.current) {
            clearTimeout(clearErrorTimeoutRef.current);
        }
        clearErrorTimeoutRef.current = setTimeout(() => setError(''), 5000); 
    }, []);

    const checkLocalStorageVote = useCallback((currentRoomCode, currentUserName, currentOptions) => {
        if (currentRoomCode && currentUserName && Array.isArray(currentOptions)) {
            const savedVote = localStorage.getItem(`vote-${currentRoomCode}-${currentUserName}`);
            if (savedVote && currentOptions.includes(savedVote)) {
                setVotedOption(savedVote);
                return true; 
            } else if (savedVote) {
                localStorage.removeItem(`vote-${currentRoomCode}-${currentUserName}`);
            }
        }
        setVotedOption(null); 
        return false;
    }, []);

    useEffect(() => {
        if (socketRef.current) return; 

        const socket = io(SERVER_URL);
        socketRef.current = socket; 

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setError('');
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason !== 'io client disconnect') {
                 displayError('Connection lost. Attempting to reconnect...');
                 setIsInRoom(false); 
                 setVotedOption(null);
                 setPollState({ users: [], votes: {}, question: '', options: [], timer: 0, isVotingActive: false });
            }
        });

        socket.on('connect_error', (err) => {
             console.error('Connection Error:', err);
             displayError(`Failed to connect to poll server (${err.message}).`);
             setIsInRoom(false);
             socketRef.current = null; 
        });

        socket.on('error', (errorMessage) => {
            console.error('Server Error:', errorMessage);
            displayError(errorMessage);
        });

        socket.on('roomCreated', ({ roomCode: newRoomCode, initialState }) => {
            console.log('Received roomCreated:', newRoomCode, initialState);
            setRoomCode(newRoomCode);
            setPollState(initialState);
            setVotedOption(null); 
            localStorage.removeItem(`vote-${newRoomCode}-${userName}`); 
            setIsInRoom(true);
            setError('');
        });

        socket.on('joinSuccess', ({ roomCode: joinedRoomCode, initialState }) => {
            console.log('Received joinSuccess:', joinedRoomCode, initialState);
            setRoomCode(joinedRoomCode);
            setPollState(initialState);
            checkLocalStorageVote(joinedRoomCode, userName, initialState.options);
            setIsInRoom(true); 
            setError('');
        });

        socket.on('roomState', (state) => {
            console.log('Received roomState update:', state);
            setPollState(state);
            checkLocalStorageVote(roomCode, userName, state.options);
        });

        socket.on('updateVotes', (votes) => {
            console.log('Received updateVotes:', votes);
            setPollState(prevState => ({ ...prevState, votes }));
        });

        socket.on('timerUpdate', (timer) => {
             setPollState(prevState => ({ ...prevState, timer }));
        });

        socket.on('pollEnded', (finalVotes) => {
            console.log('Received pollEnded:', finalVotes);
            setPollState(prevState => ({
                ...prevState,
                votes: finalVotes,
                isVotingActive: false,
                timer: 0,
            }));
        });

        return () => {
            console.log('Cleaning up socket connection...');
            if (clearErrorTimeoutRef.current) {
                 clearTimeout(clearErrorTimeoutRef.current);
            }
            if (socket) {
                socket.disconnect();
            }
            socketRef.current = null;
        };
    }, []); 


    useEffect(() => {
        if (isInRoom && roomCode && userName && pollState.options?.length > 0) {
             checkLocalStorageVote(roomCode, userName, pollState.options);
        }
    }, [isInRoom, roomCode, userName, pollState.options, checkLocalStorageVote]);


    const handleCreateRoom = useCallback((name, question, options, duration) => {
        if (!name.trim()) return displayError("Username is required.");
        if (!question.trim()) return displayError("Question is required.");
        if (!options || options.length !== 2 || options.some(o => !o.trim())) return displayError("Two non-empty options required.");
        const dur = parseInt(duration, 10);
        if (isNaN(dur) || dur <= 5) return displayError("Duration must be > 5 seconds.");

        const currentSocket = socketRef.current;
        if (currentSocket?.connected) {
            setUserName(name.trim()); 
            setError('');
            currentSocket.emit('createRoom', {
                userName: name.trim(), question: question.trim(), options: options.map(o => o.trim()), duration: dur
            });
        } else {
            displayError("Not connected to server. Please wait or refresh.");
        }
    }, [displayError]); 

    const handleJoinRoom = useCallback((name, code) => {
        if (!name.trim()) return displayError("Username is required.");
        const trimmedCode = code.trim().toUpperCase();
        if (!trimmedCode || trimmedCode.length !== 6) return displayError("Valid 6-character room code required.");

        const currentSocket = socketRef.current;
        if (currentSocket?.connected) {
            const trimmedName = name.trim();
            setUserName(trimmedName); 
            setError('');
            currentSocket.emit('joinRoom', { userName: trimmedName, roomCode: trimmedCode });
        } else {
            displayError("Not connected to server. Please wait or refresh.");
        }
    }, [displayError]); 

    const handleVote = useCallback((option) => {
        if (votedOption) return displayError("You have already voted.");
        if (!pollState.isVotingActive) return displayError("Voting has ended for this poll.");

        const currentSocket = socketRef.current;
        if (!currentSocket?.connected) return displayError("Cannot vote: Not connected.");

        setError('');
        currentSocket.emit('vote', { roomCode, option });
        setVotedOption(option); 
        localStorage.setItem(`vote-${roomCode}-${userName}`, option);

    }, [votedOption, pollState.isVotingActive, roomCode, userName, displayError]); 
    return (
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-8">
                Poll-itics
            </h1>

            {error && (
                <div
                 className="w-full max-w-lg mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-md text-center relative"
                 role="alert"
                 aria-live="assertive"
                >
                    <span>{error}</span>
                    <button
                        onClick={() => setError('')}
                        className="absolute top-0 right-0 mt-1 mr-2 text-red-500 hover:text-red-700 font-bold text-xl"
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            {!isInRoom ? (
                <Login onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
            ) : (
                <PollRoom
                    roomCode={roomCode}
                    pollState={pollState}
                    userName={userName}
                    votedOption={votedOption}
                    onVote={handleVote}
                />
            )}
        </div>
    );
}

export default App;