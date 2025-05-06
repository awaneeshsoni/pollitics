const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const rooms = {};

const broadcastRoomState = (roomCode) => {
    if (rooms[roomCode]) {
        const room = rooms[roomCode];
        const currentVotes = room.options.reduce((acc, option) => {
            acc[option] = room.votes[option] || 0;
            return acc;
        }, {});

        const state = {
            users: Array.from(room.users.values()),
            votes: currentVotes,
            timer: room.timer,
            isVotingActive: room.isVotingActive,
            question: room.question,
            options: room.options,
        };
        io.to(roomCode).emit('roomState', state);
    }
};

const startTimer = (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.timerInterval) return;

    room.timer = room.duration;
    room.isVotingActive = true;

    room.timerInterval = setInterval(() => {
        if (!rooms[roomCode]) {
            clearInterval(room.timerInterval);
            return;
        }

        if (room.timer > 0) {
            room.timer--;
            io.to(roomCode).emit('timerUpdate', room.timer);
        } else {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
            room.isVotingActive = false;

            const finalVotes = room.options.reduce((acc, option) => {
                acc[option] = room.votes[option] || 0;
                return acc;
            }, {});
            io.to(roomCode).emit('pollEnded', finalVotes);
            broadcastRoomState(roomCode);
        }
    }, 1000);
};

app.get('/', (req,res) => {
    res.send('<h1>hi there</h1>');
})

io.on('connection', (socket) => {
    socket.on('createRoom', ({ userName, question, options, duration }) => {
        if (!userName?.trim()) return socket.emit('error', 'Username cannot be empty.');
        if (!question?.trim()) return socket.emit('error', 'Poll question cannot be empty.');
        if (!Array.isArray(options) || options.length !== 2 || options.some(opt => !opt?.trim())) {
            return socket.emit('error', 'Please provide exactly two non-empty options.');
        }
        const timerDuration = parseInt(duration, 10);
        if (isNaN(timerDuration) || timerDuration <= 5) {
            return socket.emit('error', 'Duration must be a number greater than 5 seconds.');
        }
        const trimmedUserName = userName.trim();
        const trimmedOptions = options.map(opt => opt.trim());
        if (trimmedOptions[0].toLowerCase() === trimmedOptions[1].toLowerCase()) {
            return socket.emit('error', 'Options cannot be the same.');
        }

        const roomCode = uuidv4().substring(0, 6).toUpperCase();

        rooms[roomCode] = {
            users: new Map(),
            votes: { [trimmedOptions[0]]: 0, [trimmedOptions[1]]: 0 },
            voters: new Set(),
            question: question.trim(),
            options: trimmedOptions,
            duration: timerDuration,
            timer: timerDuration,
            timerInterval: null,
            isVotingActive: true,
        };

        rooms[roomCode].users.set(socket.id, trimmedUserName);
        socket.join(roomCode);

        const initialVotes = { [trimmedOptions[0]]: 0, [trimmedOptions[1]]: 0 };

        socket.emit('roomCreated', {
            roomCode,
            initialState: {
                users: [trimmedUserName],
                votes: initialVotes,
                timer: timerDuration,
                isVotingActive: true,
                question: rooms[roomCode].question,
                options: rooms[roomCode].options,
            }
        });

        startTimer(roomCode);
    });

    socket.on('joinRoom', ({ roomCode, userName }) => {
        const room = rooms[roomCode];
        if (!userName?.trim()) return socket.emit('error', 'Username cannot be empty.');
        if (!roomCode || !room) return socket.emit('error', 'Room not found.');

        const trimmedUserName = userName.trim();
        const nameExists = Array.from(room.users.values())
            .some(name => name.toLowerCase() === trimmedUserName.toLowerCase());
        if (nameExists) {
            return socket.emit('error', `Username "${trimmedUserName}" is already taken in this room.`);
        }

        room.users.set(socket.id, trimmedUserName);
        socket.join(roomCode);

        const currentVotes = room.options.reduce((acc, option) => {
            acc[option] = room.votes[option] || 0;
            return acc;
        }, {});

        socket.emit('joinSuccess', {
            roomCode,
            initialState: {
                users: Array.from(room.users.values()),
                votes: currentVotes,
                timer: room.timer,
                isVotingActive: room.isVotingActive,
                question: room.question,
                options: room.options,
            }
        });

        broadcastRoomState(roomCode);
    });

    socket.on('vote', ({ roomCode, option }) => {
        const room = rooms[roomCode];
        if (!room) return socket.emit('error', 'Room not found.');
        if (!room.isVotingActive) return socket.emit('error', 'Voting has ended.');

        const voterUserName = room.users.get(socket.id);
        if (!voterUserName) {
            return socket.emit('error', 'Error processing vote. Try rejoining.');
        }

        if (room.voters.has(voterUserName)) {
            return socket.emit('error', 'You have already voted.');
        }
        if (!room.options.includes(option)) {
            return socket.emit('error', 'Invalid voting option.');
        }

        room.votes[option] = (room.votes[option] || 0) + 1;
        room.voters.add(voterUserName);

        const currentVotes = room.options.reduce((acc, opt) => {
            acc[opt] = room.votes[opt] || 0;
            return acc;
        }, {});
        io.to(roomCode).emit('updateVotes', currentVotes);
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            if (room.users.has(socket.id)) {
                const userName = room.users.get(socket.id);
                room.users.delete(socket.id);

                if (room.users.size === 0) {
                    if (room.timerInterval) clearInterval(room.timerInterval);
                    delete rooms[roomCode];
                } else {
                    broadcastRoomState(roomCode);
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});