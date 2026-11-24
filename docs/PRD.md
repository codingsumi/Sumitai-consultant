# Sumit AI - Product Requirements Document (PRD)

Version: 1.0
Status: Draft
Author: Sumit Jaiswal
Last Updated: 2026-07-19

---

# 1. Overview

Sumit AI is an AI Consultant Platform where users can chat with specialized AI experts across multiple domains such as Homeopathy, Ayurveda, Allopathy, Yoga, Nutrition, and Mental Wellness.

Instead of using one generic AI assistant, users interact with domain-specific consultants powered by custom system prompts and knowledge.

---

# 2. Vision

Build India's most trusted AI consultation platform that provides accurate, personalized, and easy-to-understand guidance from specialized AI consultants.

---

# 3. Goals

- Fast AI consultation
- Multiple expert consultants
- Conversation history
- High-quality AI responses
- Simple ChatGPT-like UI
- Mobile-first experience

---

# 4. Target Users

- Patients
- Health-conscious users
- Students
- Parents
- Working professionals

---

# 5. Consultants

## Homeopathy

Slug:
homeopathy

Purpose:
Natural medicine consultation.

---

## Ayurveda

Slug:
ayurveda

Purpose:
Ayurvedic herbs, lifestyle and immunity guidance.

---

## Allopathy

Slug:
allopathy

Purpose:
General medical guidance.

---

## Yoga

Slug:
yoga

Purpose:
Yoga poses, breathing and flexibility.

---

## Nutrition

Slug:
nutrition

Purpose:
Diet planning and healthy eating.

---

## Mental Wellness

Slug:
mental-wellness

Purpose:
Stress management and emotional wellbeing.

---

# 6. Core Features

## Authentication

- Email OTP login / register (Resend, no passwords)
- Continue as Guest (name-based session)
- HTTP-only session cookies
- Guest → registered account conversion (claim + migrate chats)
- User profiles (name, avatar, account type, logout, delete)

---

## Chat

- Create chat
- Continue previous chat
- Streaming response
- Markdown support
- Copy response
- Regenerate response
- Stop generation

---

## Consultant Selection

User selects consultant before starting a chat.

---

## Chat History

- List chats
- Search chats
- Delete chat
- Rename chat

---

## AI

- GPT-5.5
- LangChain
- Conversation Memory
- System Prompt
- Context Injection

---

# 7. User Flow

Home

↓

Select Consultant

↓

Ask Question

↓

AI Response

↓

Continue Conversation

↓

Chat Saved Automatically

---

# 8. Tech Stack

Frontend

- Next.js
- React
- TailwindCSS

Backend

- Node.js
- Express

Database

- PostgreSQL
- Prisma ORM

AI

- OpenAI
- LangChain

Deployment

- Docker
- AWS

---

# 9. Database

Users (registered + guest)

EmailOTP

GuestSession

Session

Consultants

Chats (owned by user)

Messages

---

# 10. Non Functional Requirements

- Fast (<3 sec first token)
- Secure
- Responsive
- Scalable
- Streaming support

---

# 11. Future Features

- Voice Chat
- Image Analysis
- Doctor Verification
- Appointment Booking
- Prescription OCR
- Multi-language
- File Upload
- AI Memory
- RAG
- Knowledge Base
- AI Agents

---

# 12. Success Metrics

- Daily Active Users
- Average Chat Length
- User Retention
- Response Time
- User Satisfaction

---

# 13. MVP Scope

Included

- Authentication
- Consultant selection
- AI chat
- Streaming
- Chat history
- Multiple consultants

Excluded

- Payments
- Voice
- Image analysis
- File upload
- Admin Panel
- RAG