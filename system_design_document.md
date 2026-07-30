# AutoOps AI - System Design & Architecture Document

*Instructions for Candidate: Fill out your thought process for each section below. Explain WHAT you are choosing and WHY you are choosing it over alternatives. Focus on tradeoffs.*

## 1. System Overview
*Briefly describe the goal of the system and the primary user flow.*
**My Thoughts:**
(Write your thoughts here...)

## 2. Core Technologies
*What programming language and web framework are you using? Why? What are the tradeoffs?*
**My Thoughts:**
We are using Node.js and Express. Node.js is widely used in industry for its non-blocking asynchronous I/O and vast ecosystem (npm). Express provides a minimalistic and unopinionated framework for rapidly developing APIs. 
Tradeoffs: Express lacks built-in features compared to opinionated frameworks like NestJS (or Django/FastAPI in Python), requiring us to piece together libraries (for validation, ORM, etc.), but it gives us maximum flexibility.

## 3. Background Task Processing
*How will you handle long-running tasks like cloning repos and running test suites? Why use BullMQ/Redis instead of built-in async features?*
**My Thoughts:**
(Write your thoughts here...)

## 4. AI Agent Orchestration
*How will you structure the AI agents? Will you use LangChain (JS), LangGraph (JS), or custom code? How do the agents share state and communicate?*
**My Thoughts:**
(Write your thoughts here...)

## 5. State Management & Database
*How will you track the status of a job (e.g., "In Progress", "Failed", "Success")? What database will you use and why?*
**My Thoughts:**
(Write your thoughts here...)

## 6. Scalability & Error Handling
*What happens if the Docker container running the tests crashes? What happens if the OpenAI API rate limits us? How does the system scale if 100 users submit repos at once?*
**My Thoughts:**
(Write your thoughts here...)
