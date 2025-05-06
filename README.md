# Real-Time Voting App

This is a real-time voting application built with **React** on the frontend and **Express + Socket.IO** on the backend. It allows users to create/join virtual rooms and vote, with live updates shared among all users in the same room.

---

## 📁 Project Structure

/
├── client/ 
├── server/ 
└── README.md

---

## 🚀 Features

- 🔗 **Room-based Voting**: Users can join different rooms using a unique code.
- 🗳️ **Live Vote Updates**: Votes are updated in real-time for everyone in the same room.
- 🔄 **State Synchronization**: Socket.IO ensures synchronized vote states across clients.
- 🎯 **Minimal UI**: Clean and focused interface for joining rooms and casting votes.

---

```bash
## 🛠️ Setup Instructions

1. Clone the Repository

git clone https://github.com/your-username/pollitics.git
cd pollitics

2. Install Dependencies

Server
Navigate to the server folder and install the necessary dependencies:

cd server
npm install

Client
Navigate to the client folder and install the necessary dependencies:

cd ../client
npm install


3. Run the App

Start the Server
To start the backend server:
cd server
npm run dev

Start the Client
To start the frontend React app:
cd ../client
npm start

Create a .env file in /client folder and add the link of backend server as VITE_APP_SERVER_URL.

```
---

## 🧠 State Sharing and Room Management

Each room is uniquely identified by a 6-character room code and represented by an object stored in the 'rooms' object. 
The room state includes a 'Map' of connected users ('users'), a 'votes' object tracking counts for two options, and a 'Set' ('voters') to ensure each user votes only once. The 'question', 'options', and 'duration' define the poll, while 'timer' and 'timerInterval' manage the countdown. The 'isVotingActive' flag indicates if voting is still ongoing. State updates are shared across clients using Socket.IO events like 'roomState', 'updateVotes', and 'pollEnded', ensuring real-time synchronization whenever a user joins, leaves, or casts a vote.
