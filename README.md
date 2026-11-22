# Item & Purchase Management System

Node.js + Express.js + MySQL Web Application for managing Items, Item Types, Purchases, stock availability, and purchase history.

## Features
- Item Types CRUD
- Items CRUD - Create, View, Update, Delete (if no purchase history)
- Active / Inactive status - Inactive items cannot be purchased
- Purchase with multiple Items under one Order ID (ex: PO-00001)
- Backend stock validation - Stock never goes negative
- Stock auto-deduct after successful Purchase
- Purchase Details with JOIN - Purchase + Items + Item Types
- Purchase Update with stock adjustment
- Purchase DELETE NOT allowed - Historical data is protected
- MySQL Transaction for Purchase - All or nothing

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Tool: VS Code, GitHub Desktop

## Prerequisites
- Node.js v18 or above
- MySQL 8.0 or above
- VS Code
- Git

##Check versions:
node -v
npm -v

## Database Setup
```bash
CREATE DATABASE item_purchase_db;
USE item_purchase_db;