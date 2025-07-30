# Hub71 Calculator - Database Connection Guide

## Database Connection

To connect to the Supabase database for the Hub71 Calculator, you need the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These should be placed in your `.env.local` or `.env` file in the root directory of the project.

## Setting Up Environment Variables

1. Create a `.env.local` file in the root directory of the project
2. Add the following lines, replacing the placeholders with your actual Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Connecting in JavaScript

To connect to the database in your JavaScript code:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;




## Run SQL Query Before Running Excel-Import File in supabase SQL editor

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

  ## Troubleshooting Connection Issues

If you encounter connection issues:

1. Verify your Supabase URL and anon key are correct
2. Check that your Supabase project is active
3. Ensure your IP address is not blocked by any firewall rules
4. Verify that the tables exist in your Supabase project






  ## Running Import Scripts

  To import data from an Excel file:

  ```bash
  # Navigate to the scripts directory first
  cd scripts
  # Install dependencies
  npm install

  # Then run the script
  node excel-import.js

  
