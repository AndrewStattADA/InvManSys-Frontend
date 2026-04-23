# Getting Started
## Prerequisites
    Node.js (v18.0.0 or higher)
    npm or yarn

## Installation
### Clone the repository:
* git clone https://github.com/AndrewStattADA/InvManSys-Frontend.git
* cd InvManSys-Frontend
### Install dependencies:
* npm install

### Configure Environment Variables:
    Create a .env file in the root directory:
    VITE_API_URL=https://your-backend-api.onrender.com/api/

# Run the App
    npm run dev

# Testing
## To execute the test suite:
    npm test
## Coverage Reports
    npm test -- --coverage

# Technical Decisions
## State-Based Dashboard vs. Deep Routing
    Decision: Using useState to toggle dashboard views (inventory, admin, audit) instead of deep nested routes.
    Reasoning: Enhances security by ensuring sensitive components are only mounted when the authenticated state is validated, preventing "ghost" access via URL manipulation.

## Centralized Axios Instance
    Decision: Implementation of axiosInstance.js.
    Reasoning: Standardizes the API base URL and ensures that tokens are consistently attached to outgoing requests, reducing boilerplate code in individual components.

## Card-Based UI Design
    Decision: Transitioned from table-based views to a responsive grid-card layout.
    Reasoning: Improves mobile usability and allows for better visual emphasis on critical data points like "Low Stock" status.


# Frontend Render URL
    https://invmansys-frontend.onrender.com 

# AI Usage
    AI was used to comment code, create tests and bug fix