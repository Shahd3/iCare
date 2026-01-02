# iCare

**AI‑Powered Prescription Reminder Mobile Application**

A smart, offline‑first mobile app that helps users take their medication on time. iCare goes beyond fixed alarms by learning from user behavior and suggesting better reminder times using lightweight reinforcement learning.

---

## Overview

Most reminder apps fire alerts at static times. Real life isn’t static.

iCare adapts. It observes when users actually take their medication and gradually adjusts reminder timing to better match their routine. The result is higher adherence with zero manual tweaking.

Developed as a **final year capstone project** for the **BSc in Software Engineering** at **Al Ain University**.

---

## Core Features

### Medication Reminders

* Create reminders with medication name, type, dosage, days, and time
* Fully offline storage
* Simple flow designed for non‑technical users

### Adaptive Reminder Intelligence

* Lightweight reinforcement learning (Q‑learning inspired bandit)
* Learns preferred time offsets (early / late)
* Improves suggestions over time based on real intake behavior
* No cloud, no heavy ML frameworks

### Intake Tracking

* Mark medication as taken
* Daily intake history stored locally
* Intake timing used as feedback for learning

### Dashboard

* Clear separation of today’s reminders
* Time‑based grouping
* Swipe‑to‑delete support

---

## How the Learning Logic Works

1. Each reminder starts with a base time
2. Small offsets are tested (±15–30 minutes)
3. If a user consistently takes medication closer to an offset, it receives a higher reward
4. Over time, the system suggests a better reminder time
5. The user always stays in control

Learning logic is implemented locally in `bandit.js` using an epsilon‑greedy strategy.

---

## Tech Stack

**Mobile**

* React Native
* Expo
* React Navigation

**Storage**

* AsyncStorage (offline‑first)

**Logic / AI**

* Reinforcement learning (bandit approach)
* Pure JavaScript implementation

---

## Project Structure

```
iCare/
├── App.js
├── src/
│   ├── pages/
│   │   ├── Dashboard.js
│   │   └── AddSchedule.js
│   └── lib/
│       └── bandit.js
├── assets/
```

---

## Installation

```bash
git clone https://github.com/Shahd3/iCare.git
cd iCare
npm install
npx expo start
```

Requires Node.js and Expo CLI.

---

## Scope

* Mobile application only
* Single user (patient‑focused)
* No doctor or caregiver roles
* Fully offline
* Designed for future extensions (OCR, chatbot, voice input)

---

## Academic Information

**University:** Al Ain University
**Degree:** BSc in Software Engineering
**Course:** Capstone Project
**Year:** 2025

### Team

* Abrar Hamdi
* Mohammed Tariq
* Shahd Alamoodi
* Umama Binte Sayed

**Supervisor:** Dr. Yazeed Ghadi

---

## License

Academic project. All rights reserved © 2025.
