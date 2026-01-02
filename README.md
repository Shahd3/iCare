iCare – AI-Powered Prescription Reminder App

iCare is a mobile prescription reminder application designed to improve medication adherence using adaptive AI techniques.
Unlike traditional reminder apps with fixed alerts, iCare learns from user behavior and intelligently suggests better medication times to match real-life routines.

This project was developed as a final year capstone for the Bachelor of Software Engineering program at Al Ain University.

🚀 Key Features
💊 Smart Medication Scheduling

Create medication reminders with:

Medication name

Type (pill, capsule, solution, injection)

Dosage (preset or custom)

Selected days

Reminder time

All reminders are stored locally for offline use

🧠 Adaptive Reminder System (Reinforcement Learning)

Uses a lightweight Reinforcement Learning (Q-learning / multi-armed bandit) approach

Tracks when users actually take their medication

Learns preferred time offsets (early / late)

Suggests better reminder times based on real behavior

Automatically improves over time without manual configuration

Implemented in bandit.js using:

Epsilon-greedy exploration

Reward shaping

Local policy persistence via AsyncStorage

✅ Medication Intake Tracking

Users can mark medications as taken

Daily history is stored per reminder

Intake timing is used as feedback for the learning algorithm

📊 Daily Dashboard

“Due Today” vs “Other” reminders

Grouped by time

Clean, minimal UI optimized for ease of use

Swipe-to-delete functionality

📱 Modern Mobile UI

Built with React Native + Expo

Bottom tab navigation

Gesture-based interactions

Designed for elderly and non-technical users

🧠 How the AI Works (Short Version)

Each medication has a base reminder time

The system tests small time offsets (e.g. ±15, ±30 minutes)

If the user consistently takes medication closer to a different time:

That offset gains a higher reward

Once enough evidence exists:

iCare suggests a better permanent time

The user stays in control — suggestions are optional

No cloud. No black box. Everything runs locally.

🛠 Tech Stack

Frontend / Mobile

React Native

Expo

React Navigation

React Native Gesture Handler

Storage

AsyncStorage (offline-first)

AI / Logic

Reinforcement Learning (Q-learning inspired bandit)

JavaScript implementation (no heavy ML frameworks)

UI / Icons

Expo Vector Icons

Custom assets

📂 Project Structure
icare/
├── App.js
├── src/
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── AddSchedule.js
│   ├── lib/
│   │   └── bandit.js   # Reinforcement Learning logic
├── assets/
│   ├── images/
│   └── fonts/

⚙️ Installation & Run
git clone https://github.com/Shahd3/iCare.git
cd iCare
npm install
npx expo start


Requires Node.js, Expo CLI, and a mobile simulator or Expo Go app.

📌 Project Scope & Notes

Mobile-only application (not web-based)

Single user (no doctor/caregiver accounts)

Works fully offline

Focused on patient self-management

Designed for extensibility (OCR, chatbot, voice features planned)

🎓 Academic Context

University: Al Ain University

College: College of Engineering

Degree: BSc in Software Engineering

Course: Capstone Project

Year: 2025

Team Members

Abrar Hamdi

Mohammed Tariq

Shahd Alamoodi

Umama Binte Sayed

Supervisor: Dr. Yazeed Ghadi

📄 License

This project is developed for academic purposes.
All rights reserved © 2025.
