# Full-Stack Text-to-Speech (TTS) Web Application
A responsive, full-stack browser-based web application designed to convert written text into spoken audio across multiple languages, voice tones, and genders. 

## 🚀 Project Overview
This project consists of two main parts:
* **Frontend***: Built with React and Vite, featuring a modern UI with separate modular components, live character counting, language selection, voice tone customization, and transcript downloading.
* **Backend **: Built with Node.js and Express using a structured MVC pattern (controllers, routes, and middleware) to handle voice configurations and text processing.

## 🛠️ Backend Architecture
A Node.js and Express backend server built using a structured MVC pattern to handle voice configurations and text-to-speech processing

### Directory Structure & Components
* **`controllers/`**: Contains request handler logic (e.g., `ttscontroller.js`)
* **`routes/`**: Defines API endpoints (e.g., `ttsroutes.js`)
* **`middleware/`**: Error handling and validation middleware
* **`server.js`**: Main entry point initializing the Express application

### API Endpoints
* **`GET /api/voices`**: Returns supported languages and voice options
* **`POST /api/tts`**: Validates and processes text-to-speech requests

## 🚀 Quick Setup Instructions

### 2. Run Backend (`http://localhost:5000`)
```powershell
cd backend
npm install
node server.js
