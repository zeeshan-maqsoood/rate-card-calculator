# Hub71 Calculator

A Next.js application for calculating resource rates based on role, region, seniority, workload, and duration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
  - [Supabase Configuration](#supabase-configuration)
  - [Database Schema](#database-schema)
- [Data Import](#data-import)
  - [Excel Import Script](#excel-import-script)
  - [Troubleshooting Import Issues](#troubleshooting-import-issues)
- [API Integration](#api-integration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)

## Overview

The Hub71 Calculator is a web application that calculates resource rates based on various parameters such as role, region, seniority level, workload, and duration. It provides two calculation modes:

1. **SWAT Team Calculator**: Pre-negotiated team rates with a 20% discount
2. **Custom Resource Calculator**: Individual resource rates based on role, region, and seniority

## Features

- Real-time rate calculations
- Currency conversion
- Email quote functionality
- PDF export
- Responsive design for desktop and mobile
- Dark mode support

## Project Structure

The project follows a structured organization:

```
hub71-calculator/
├── src/                      # Source code
│   ├── app/                  # Next.js app router pages
│   ├── components/           # React components
│   │   ├── calculator/       # Calculator-specific components
│   │   ├── layout/           # Layout components
│   │   ├── status/           # Status indicators
│   │   └── ui/               # UI components (buttons, inputs, etc.)
│   ├── hooks/                # Custom React hooks
│   │   └── calculator/       # Calculator-specific hooks
│   ├── lib/                  # Utility libraries
│   │   ├── calculator/       # Calculator utilities
│   │   └── database/         # Database utilities
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── scripts/                  # Utility scripts
└── .env.local                # Environment variables (not in repo)
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account for database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/hub71-calculator.git
cd hub71-calculator
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration

GMAIL_USER=your_gmail_user
GMAIL_APP_PASSWORD=your_gmail_app_password

# Currency API (for exchange rates)
CURRENCY_API_KEY=your_currency_api_key
```

## Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Get your project URL and anon key from the project settings
3. Add these to your `.env.local` file

### Database Schema

Run the following SQL in your Supabase SQL editor to set up the required tables:

```sql
-- Drop existing objects
DROP VIEW IF EXISTS rates_view;
DROP TABLE IF EXISTS rates;
DROP TABLE IF EXISTS seniority_levels;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS regions;

-- Create tables without RLS
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE seniority_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rates (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  region_id INTEGER NOT NULL REFERENCES regions(id),
  seniority_level_id INTEGER NOT NULL REFERENCES seniority_levels(id),
  base_rate INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, region_id, seniority_level_id)
);

-- Create the view
CREATE VIEW rates_view AS
  SELECT 
    r.id,
    ro.name AS role,
    reg.name AS region,
    sl.name AS seniority_level,
    r.base_rate,
    reg.multiplier AS region_multiplier,
    sl.multiplier AS seniority_multiplier,
    ROUND(r.base_rate * reg.multiplier * sl.multiplier) AS calculated_rate
  FROM rates r
  JOIN roles ro ON r.role_id = ro.id
  JOIN regions reg ON r.region_id = reg.id
  JOIN seniority_levels sl ON r.seniority_level_id = sl.id;
```

## Data Import

### Excel Import Script

The project includes a script to import rate data from an Excel file:

1. Prepare your Excel file with the following sheets:
   - `roles`: List of roles
   - `regions`: List of regions with multipliers
   - `seniority_levels`: List of seniority levels with multipliers
   - `rates`: Base rates for each role/region/seniority combination

2. Run the import script:

```bash
# Navigate to the scripts directory first
cd scripts

# Install script dependencies if not already installed
npm install

# Run the import script
node excel-import.js
```

### Troubleshooting Import Issues

If you encounter issues during import:

1. Verify your Excel file format matches the expected structure
2. Check that your Supabase credentials are correct in `.env.local`
3. Ensure the database tables have been created correctly
4. Check the console for specific error messages

## API Integration

### Currency Conversion API

The calculator uses an external API for currency conversion:

1. Sign up for an API key at your chosen currency API provider
2. Add the API key to your `.env.local` file
3. The application will automatically fetch exchange rates

### Email API

For sending email quotes:

1. Configure your SMTP settings in the `.env.local` file
2. The application will use these settings to send emails

## Usage

### Calculator Modes

#### SWAT Team Calculator

The SWAT Team calculator applies:
- Fixed Middle East region
- Advanced seniority level
- 20% pre-negotiated discount
- Configurable workload (40% to 100%)
- Duration discounts (up to 15% for 4+ months)

#### Custom Resource Calculator

The Custom Resource calculator allows selection of:
- Any available region
- Any available role
- Any available seniority level
- Always calculated at full-time workload

### Currency Conversion

Select your preferred currency from the dropdown to see rates converted from the base currency (AED).

### Email Quotes

Fill in the email form to send a quote to yourself or clients with the calculated rates.

## Troubleshooting

### Connection Issues

If you encounter connection issues with Supabase:

1. Verify your Supabase URL and anon key are correct
2. Check that your Supabase project is active
3. Ensure your IP address is not blocked by any firewall rules
4. Verify that the tables exist in your Supabase project

### Application Issues

If the application is not working correctly:

1. Check browser console for JavaScript errors
2. Verify that all environment variables are set correctly
3. Ensure all dependencies are installed (`npm install`)
4. Try clearing your browser cache
5. Restart the development server
