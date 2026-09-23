# CodeAlpha Task 1 - Data Redundancy Removal System

## Technology
- Node.js
- Express.js
- SQLite
- HTML/CSS

## Features
- Validates required fields.
- Creates SHA-256 hash for each record.
- Uses a UNIQUE database constraint to prevent duplicate data.
- Displays unique records.
- Allows record deletion.

## Run
```bash
npm install
npm start
```
Open: http://localhost:5000

## Demo
1. Add a record.
2. Add exactly the same record again.
3. The system rejects it as duplicate.
4. Add a different record and it is stored.

## CodeAlpha mapping
Task 1 asks for redundant/false-positive classification, validation, duplicate prevention, unique verified entries, and database accuracy/efficiency.
