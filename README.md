# Credit Jambo Credit Management System

A comprehensive **microservices-based credit management platform** built with **NestJS**, offering savings accounts, loans, credit management, and automated banking operations.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Overview

**Credit Jambo** is a modern, scalable credit management system designed to handle core banking operations — including customer management, savings accounts with tiered interest rates, loan processing, credit management, and automated financial operations through scheduled cron jobs.

## Architecture

This project follows a **microservices monorepo** architecture using **Yarn workspaces**, consisting of:

- **Customer Service** – Customer-facing REST API  
- **Admin Service** – Admin panel and management API  
- **Notification Service** – Multi-channel notification delivery  
- **Crons Service** – Scheduled banking operations  
- **Common Library** – Shared utilities and infrastructure  

### Communication Patterns

- **REST API** – Customer and admin endpoints  
- **gRPC** – Inter-service communication  
- **RabbitMQ** – Asynchronous message processing  
- **WebSocket** – Real-time notifications  
- **Redis** – Caching and session management  

## Services

### 1. Customer Service
**Port:** `3001`  
**Purpose:** Customer-facing banking operations  

**Modules:**
- Authentication & User Management  
- Savings Accounts (tiers: BASIC, SILVER, GOLD, PLATINUM)  
- Loan Management (request, repayment tracking)  
- Credit Account Management  
- Transaction History  
- File Storage (MinIO integration)  

### 2. Admin Service
**Port:** `3002`  
**Purpose:** Administrative operations and analytics  

**Modules:**
- Admin Authentication  
- Customer Management (suspend, update credit limits)  
- Loan Management (approve, reject, disburse)  
- Transaction Management  
- Analytics Dashboard  
- Admin Action Audit Logs  

### 3. Notification Service
**Port:** `3003`  
**Purpose:** Multi-channel notification delivery  

**Features:**
- Email notifications (SMTP)  
- WebSocket real-time notifications  
- Slack alerts  
- 60+ email templates  
- RabbitMQ queue processing  

### 4. Crons Service
**Purpose:** Automated banking operations  

**Scheduled Jobs:**
- Daily interest accrual for savings accounts  
- Loan overdue payment detection  
- Late fee application  
- Loan defaulting  
- Tier upgrade evaluation  
- Payment reminders  

## Features

### Banking Features
- ✅ Multi-tiered savings accounts with variable interest rates  
- ✅ Loan origination and repayment tracking  
- ✅ Credit scoring and limit management  
- ✅ Automated interest calculation  
- ✅ Late fee assessment  
- ✅ Transaction history and reporting  

### Customer Features
- ✅ User registration with KYC status  
- ✅ Account tier upgrades  
- ✅ Deposit and withdrawal operations  
- ✅ Loan requests and repayment  
- ✅ Real-time balance inquiries  
- ✅ Transaction filtering  

### Admin Features
- ✅ Customer account management  
- ✅ Loan approval workflow  
- ✅ Credit limit adjustments  
- ✅ Credit score updates  
- ✅ Analytics dashboard  
- ✅ Audit trail logging  

### Automated Operations
- ✅ Daily interest accrual  
- ✅ Overdue loan detection  
- ✅ Automated tier upgrades  
- ✅ Payment reminders  
- ✅ Default management  

## Technology Stack

### Core Framework
- **NestJS** `10.4.15`  
- **TypeScript**  
- **Node.js** `20.18.0+`  

### Database & ORM
- **PostgreSQL** – Primary database  
- **ClickHouse** – Analytics database  
- **TypeORM** `0.3.20`  

### Communication
- **gRPC** (`@grpc/grpc-js` `1.12.6`)  
- **RabbitMQ** (`amqplib` `0.10.5`)  
- **WebSocket** – Real-time notifications  

### Caching & Storage
- **Redis** (`ioredis` `5.4.2`)  
- **MinIO** `8.0.3` – Object storage  

### Authentication & Security
- **JWT** – Token-based authentication  
- **bcryptjs** – Password hashing  
- **Role-based access control**  

### Scheduling & Jobs
- **@nestjs/schedule** `6.0.1`  

### Documentation
- **Swagger** `8.1.0`  

### Monitoring & Logging
- **Pino** (`nestjs-pino` `4.2.0`)  

### Validation
- **class-validator** `0.14.1`  
- **class-transformer** `0.5.1`  

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 20.18.0  
- **Yarn** ≥ 4.5.3  
- **PostgreSQL**  
- **Redis**  
- **RabbitMQ**  
- **MinIO** *(optional, for file storage)*  
- **ClickHouse** *(optional, for analytics)*  

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/ishimweemmy/eport-be.git
cd eport-be
````

### 2. Install dependencies

```bash
yarn install
```

### 3. Set up environment variables

Create `.env` files for each service based on `.env.example`.

## Running the Application

### Development Mode

```bash
# Customer Service
yarn workspace @eport/customer-service start:dev

# Admin Service
yarn workspace @eport/admin-service start:dev

# Notification Service
yarn workspace @eport/notification-service start:dev

# Crons Service
yarn workspace @eport/crons-service start:dev

# Integration Service
yarn workspace @eport/integration-service start:dev
```

### Production Mode

```bash
# Build all services
yarn build

# Run with PM2
pm2 start ecosystem.config.js

# Or using Docker Compose
docker-compose up -d
```

## API Documentation

Once services are running, access **Swagger UI**:

* **Customer API:** [http://localhost:4010/api/documentation#/](http://localhost:4010/api/documentation#/)
* **Admin API:** [http://localhost:4060/api/documentation#/](http://localhost:4060/api/documentation#/)
* **Notification API:** [http://localhost:5002/api/documentation#/](http://localhost:5002/api/documentation#/)

### Key Endpoints

#### Customer Service

```bash
POST   /auth/login              - Customer login
POST   /auth/register           - Customer registration
POST   /auth/refresh            - Refresh access token
GET    /user/profile            - Get user profile
PUT    /user/profile            - Update profile

POST   /savings                 - Create savings account
POST   /savings/deposit         - Deposit funds
POST   /savings/withdraw        - Withdraw funds
GET    /savings/:id             - Get account details

POST   /loans                   - Request loan
GET    /loans/:id               - Get loan details
GET    /loans/:id/schedule      - Get repayment schedule
POST   /loans/:id/repay         - Make repayment

GET    /transactions            - Get transaction history
```

#### Admin Service

```bash
POST   /auth/login              - Admin login
GET    /customers               - List all customers
GET    /customers/:id           - Get customer details
PUT    /customers/:id/suspend   - Suspend customer
PUT    /customers/:id/credit    - Update credit limit

GET    /loans                   - List all loans
PUT    /loans/:id/approve       - Approve loan
PUT    /loans/:id/reject        - Reject loan
PUT    /loans/:id/disburse      - Disburse loan

GET    /analytics/dashboard     - Get dashboard metrics
GET    /transactions            - List all transactions
```

---

## Testing

### Run Unit Tests

```bash
# All tests
yarn test

# Specific service
yarn workspace @eport/customer-service test

# Watch mode
yarn test:watch
```

### Run E2E Tests

```bash
yarn test:e2e
```

### Test Coverage

```bash
yarn test:cov
```

## Deployment

* PM2 process manager recommended for production.
* Docker Compose supported for containerized deployment.
* Ensure proper environment variables are set for each service.

**Developed with ❤️ using NestJS, TypeScript, and PostgreSQL**