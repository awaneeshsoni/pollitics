import React, { useState } from 'react';

function PollRoom({ roomCode, pollState, userName, votedOption, onVote }) {
    const { users = [], votes = {}, question = 'Loading...', options = [], timer = 0, isVotingActive = false } = pollState || {};
    const [copied, setCopied] = useState(false);

    const totalVotes = Array.isArray(options) ? options.reduce((sum, option) => sum + (votes[option] || 0), 0) : 0;

    const getVotePercentage = (option) => {
        if (totalVotes === 0 || !votes[option] || !Array.isArray(options)) return 0;
        return Math.round((votes[option] / totalVotes) * 100);
    };

    const copyRoomLink = async () => {
        const link = `${window.location.origin}?room=${roomCode}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 order-2 sm:order-1">
                    Room Code: <span className="font-bold text-indigo-600 tracking-wider">{roomCode}</span>
                </h2>
                <div className="text-sm text-gray-500 order-1 sm:order-2">
                    Logged in as: <span className="font-medium text-gray-800">{userName}</span>
                </div>
            </div>

            <div className={`text-center text-xl font-bold mb-6 py-2 px-4 rounded-md ${timer <= 10 && timer > 0 && isVotingActive ? 'text-red-600 bg-red-100 animate-pulse' : 'text-gray-800 bg-gray-100'}`}>
                Time Left: <span className="tabular-nums">{timer}s</span>
            </div>

            <h3 className="text md:text-xl text-center text-gray-800 mb-8 break-words">
                {question}
            </h3>

            {!isVotingActive && timer <= 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md shadow" role="alert">
                    <p className="font-bold text-center">Voting has ended!</p>
                </div>
            )}

            <div className="flex flex-row flex-wrap justify-around mb-5 align-center">
                {Array.isArray(options) && options.length > 0 ? options.map((option) => {
                    const hasVotedForThis = votedOption === option;
                    return (
                        <div key={option} className={`mb-2 transition-all duration-300 ease-in-out ${hasVotedForThis ? 'border-green-400 bg-green-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:shadow-sm'}`}>
                            <button
                                onClick={() => onVote(option)}
                                disabled={!!votedOption || !isVotingActive}
                                className={`px-5 py-1 text-base font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap
                                        ${!isVotingActive ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : ''}
                                        ${isVotingActive && !votedOption ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500' : ''}
                                        ${isVotingActive && votedOption && !hasVotedForThis ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}
                                        ${votedOption && hasVotedForThis ? 'bg-green-600 text-white ring-2 ring-green-700 cursor-default' : ''}
                                    `}
                            >
                                {option}
                            </button>
                        </div>
                    );
                }) : (
                    <p className="text-center text-gray-500 py-4">Loading options or poll not started...</p>
                )}
            </div>
            <div className="space-y-5 mb-8">
                {Array.isArray(options) && options.length > 0 ? options.map((option) => {
                    const percentage = getVotePercentage(option);
                    const hasVotedForThis = votedOption === option;
                    const currentVotes = votes[option] || 0;
                    return (
                        <div key={option} className={`border rounded-lg p-4 transition-all duration-300 ease-in-out ${hasVotedForThis ? 'border-green-400 bg-green-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:shadow-sm'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-grow w-full mt-3 sm:mt-0 sm:ml-4">
                                    <div className="flex justify-between items-baseline text-sm font-medium text-gray-700 mb-1">
                                        <span>{option}: {currentVotes} {currentVotes === 1 ? 'vote' : 'votes'}</span>
                                        <span className="font-bold">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                                        <div
                                            className={`h-1 rounded-full transition-all duration-500 ease-out ${hasVotedForThis ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${percentage}%` }}
                                            role="progressbar"
                                            aria-valuenow={percentage}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-center text-gray-500 py-4">Loading options or poll not started...</p>
                )}
            </div>


            <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-700">
                        Online Participants ({Array.isArray(users) ? users.length : 0}):
                    </h4>
                    <button
                        onClick={copyRoomLink}
                        className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        {copied ? 'Copied!' : 'Copy Room Link'}
                    </button>
                </div>
                <ul className="list-none space-y-1 text-gray-600 max-h-40 overflow-y-auto pr-2 text-sm">
                    {Array.isArray(users) && users.map((user, index) => (
                        <li key={index} className={`truncate px-2 py-1 rounded ${user === userName ? 'font-bold text-indigo-700 bg-indigo-50' : 'text-gray-600'}`}>
                            {user} {user === userName ? '(You)' : ''}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default PollRoom;