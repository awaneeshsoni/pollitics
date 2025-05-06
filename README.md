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

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
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
