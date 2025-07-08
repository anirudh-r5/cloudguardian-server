# CloudGuardian Server

CloudGuardian is a cross-cloud identity and access review system designed to help administrators monitor and manage user identities and cloud resources across AWS, Azure, and other major cloud providers from a centralized backend. This repository contains the server-side application that interfaces with authentication providers and multiple cloud platforms.

## Features
🔐 Federated identity integration with OAuth2, SAML, and OpenID Connect providers
☁️ Cross-cloud support for querying metadata from AWS, Azure, and GCP APIs
📊 Tracks identities and associated resources for orphan detection and access reviews
🚨 Alerting system for misconfigured or suspicious resources
📦 GraphQL API exposed to the frontend and third-party integrations
🧩 Modular and extensible backend architecture
⚡ Built with performance and scalability in mind using NestJS (Node.js and Fastify)

## Tech Stack
- Language: TypeScript
- Runtime: Node.js
- Framework: NestJS (Node.js and Fastify)
- Database: PostgreSQL on Supabase
- Auth: Supabase (OAuth2 / Entra ID integration)

## Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/anirudh-r5/cloudguardian-server.git
   cd cloudguardian-server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create a `.env` file using `.env.example` as a reference
   - Add your cloud provider credentials and Supabase 

4. **Run in Development**
   ```bash
   npm run start:dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Run Tests**
   ```bash
   npm test
   ```
