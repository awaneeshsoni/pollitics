import React, { useState, useEffect } from 'react';

function Login({ onCreateRoom, onJoinRoom }) {
    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [question, setQuestion] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [duration, setDuration] = useState('60');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const codeFromUrl = params.get('room');
        if (codeFromUrl) {
            setRoomCode(codeFromUrl.toUpperCase());
        }
    }, []);

    const handleCreate = (e) => {
        e.preventDefault();
        onCreateRoom(userName, question, [option1, option2], duration);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        onJoinRoom(userName, roomCode);
    };

    const handleResetUrl = () => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setRoomCode('');
        setQuestion('');
        setOption1('');
        setOption2('');
    };

    const canCreate = userName.trim() && question.trim() && option1.trim() && option2.trim() && parseInt(duration, 10) > 5;
    const canJoin = userName.trim() && roomCode.trim().length === 6;

    const isJoinOnly = !!roomCode;

    return (
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg space-y-6 border border-gray-200">
            { !isJoinOnly ? <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Join or Create Poll</h2> :
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Joining Poll</h2> 
        }

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                    id="username"
                    type="text"
                    placeholder="Enter your display name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out"
                />
            </div>

            {!isJoinOnly && (
                <div className="border-t border-gray-200 pt-6 mt-6 space-y-4">
                    <h3 className="text-xl font-semibold text-center text-gray-700 mb-4">Create a New Poll</h3>
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">Poll Question *</label>
                        <input
                            id="question"
                            type="text"
                            placeholder="e.g., What's your favorite season?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="option1" className="block text-sm font-medium text-gray-700 mb-1">Option 1 *</label>
                            <input
                                id="option1"
                                type="text"
                                placeholder="e.g., Summer"
                                value={option1}
                                onChange={(e) => setOption1(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="option2" className="block text-sm font-medium text-gray-700 mb-1">Option 2 *</label>
                            <input
                                id="option2"
                                type="text"
                                placeholder="e.g., Winter"
                                value={option2}
                                onChange={(e) => setOption2(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Voting Duration (seconds) *</label>
                        <input
                            id="duration"
                            type="number"
                            min="10"
                            placeholder="e.g., 60"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 10 seconds.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={!canCreate}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        Create Room & Start Poll
                    </button>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 bg-white text-sm font-medium text-gray-500">OR</span>
                        </div>
                    </div>
                </div>
            )}



            <div className="space-y-4">
                {!isJoinOnly ? <h3 className="text-xl font-semibold text-center text-gray-700 mb-4">Joining an Existing Poll</h3> : ""}
                <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">Room Code *</label>
                    <input
                        id="roomCode"
                        type="text"
                        placeholder="Enter 6-character code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        maxLength="6"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase tracking-widest text-center font-mono text-lg transition"
                        disabled={!!roomCode && isJoinOnly}
                    />
                </div>
                <button
                    onClick={handleJoin}
                    disabled={!canJoin}
                    className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-md shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 ease-in-out"
                >
                    Join Room
                </button>
                {isJoinOnly && (
                    <div className="text-center">
                        <button
                            onClick={handleResetUrl}
                            className="text-sm text-blue-600 hover:underline mt-4"
                        >
                            Create a New Poll Instead
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
