#!/usr/bin/env node

/**
 * Excel Import Script for Hub71 Calculator
 * 
 * This script imports data from an Excel file with the following structure:
 * - Region column
 * - Role column
 * - Seniority level columns (Intermediate, Advanced, Expert) with base rates
 * 
 * Usage: node excel-import.js [path-to-excel-file]
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(process.cwd(), '../.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or key in environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const delay = ms => new Promise(res => setTimeout(res, ms));

// Get Excel file path from command line or use default
const excelFilePath = process.argv[2] || path.resolve(__dirname, '../data.xlsx');

if (!fs.existsSync(excelFilePath)) {
  console.error(`Error: Excel file not found at ${excelFilePath}`);
  process.exit(1);
}

/**
 * Check if all required tables exist in the database
 */
async function checkTablesExist() {
  console.log('Verifying database schema...');
  
  try {
    // Check regions table
    const { data: regionsData, error: regionsError } = await supabase
      .from('regions')
      .select('id')
      .limit(1);
    
    if (regionsError) {
      console.error('Error checking regions table:', regionsError.message);
      return false;
    }
    
    // Check roles table
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('id')
      .limit(1);
    
    if (rolesError) {
      console.error('Error checking roles table:', rolesError.message);
      return false;
    }
    
    // Check seniority_levels table
    const { data: seniorityLevelsData, error: seniorityLevelsError } = await supabase
      .from('seniority_levels')
      .select('id')
      .limit(1);
    
    if (seniorityLevelsError) {
      console.error('Error checking seniority_levels table:', seniorityLevelsError.message);
      return false;
    }
    
    // Check rates table
    const { data: ratesData, error: ratesError } = await supabase
      .from('rates')
      .select('id')
      .limit(1);
    
    if (ratesError) {
      console.error('Error checking rates table:', ratesError.message);
      return false;
    }
    
    // If we get here, all tables exist
    return true;
  } catch (error) {
    console.error('Error checking tables:', error.message);
    return false;
  }
}

/**
 * Insert seniority levels into the database
 */
async function insertSeniorityLevels() {
  console.log('Inserting seniority levels...');
  
  const levels = [
    { name: 'Intermediate', multiplier: 0.8 },
    { name: 'Advanced', multiplier: 1.0 },
    { name: 'Expert', multiplier: 1.2 }
  ];
  
  for (const level of levels) {
    try {
      // Check if level exists
      const { data: existing } = await supabase
        .from('seniority_levels')
        .select('id')
        .eq('name', level.name);
      
      if (existing && existing.length > 0) {
        // Update existing level
        const { error } = await supabase
          .from('seniority_levels')
          .update({ multiplier: level.multiplier })
          .eq('name', level.name);
        
        if (error) console.error(`Error updating seniority level ${level.name}:`, error);
        else console.log(`Updated seniority level: ${level.name}`);
      } else {
        // Insert new level
        const { error } = await supabase
          .from('seniority_levels')
          .insert(level);
        
        if (error) console.error(`Error inserting seniority level ${level.name}:`, error);
        else console.log(`Inserted seniority level: ${level.name}`);
      }
    } catch (error) {
      console.error(`Error processing seniority level ${level.name}:`, error);
    }
    
    await delay(100);
  }
}

/**
 * Process Excel file and extract data
 */
async function processExcel() {
  console.log(`Reading Excel file: ${excelFilePath}`);
  
  // Read Excel file
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with headers
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  if (!data || data.length < 2) {
    console.error('Error: Excel file is empty or has insufficient data');
    process.exit(1);
  }
  
  // Log the first few rows to help with debugging
  console.log('Excel data sample (first 3 rows):');
  data.slice(0, 3).forEach((row, i) => {
    console.log(`Row ${i}:`, row);
  });
  
  // Find header row and column indices
  let headerRowIndex = 0; // Default to first row
  let headerRow = data[headerRowIndex];
  
  // Try to find a row that contains both "region" and "role" (case insensitive)
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (!row) continue;
    
    const hasRegion = row.some(cell => cell && String(cell).toLowerCase().includes('region'));
    const hasRole = row.some(cell => cell && String(cell).toLowerCase().includes('role'));
    
    if (hasRegion && hasRole) {
      headerRowIndex = i;
      headerRow = row;
      console.log(`Found header row at index ${headerRowIndex}`);
      break;
    }
  }
  
  // Find column indices
  let regionColIndex = -1;
  let roleColIndex = -1;
  const seniorityColIndices = {
    'Intermediate': -1,
    'Advanced': -1,
    'Expert': -1
  };
  
  headerRow.forEach((header, index) => {
    if (!header) return;
    
    const headerText = String(header).toLowerCase().trim();
    
    if (headerText.includes('region')) {
      regionColIndex = index;
      console.log(`Found Region column at index ${index}`);
    } 
    
    if (headerText.includes('role')) {
      roleColIndex = index;
      console.log(`Found Role column at index ${index}`);
    } 
    
    // Check for seniority level columns with AED notation as seen in the screenshot
    if (headerText.includes('intermediate') || headerText.includes('intermediate (aed)')) {
      seniorityColIndices['Intermediate'] = index;
      console.log(`Found Intermediate column at index ${index}`);
    } 
    
    if (headerText.includes('advanced') || headerText.includes('advanced (aed)')) {
      seniorityColIndices['Advanced'] = index;
      console.log(`Found Advanced column at index ${index}`);
    } 
    
    if (headerText.includes('expert') || headerText.includes('expert (aed)')) {
      seniorityColIndices['Expert'] = index;
      console.log(`Found Expert column at index ${index}`);
    }
  });
  
  // Validate column indices
  if (regionColIndex === -1) {
    console.error('Error: Region column not found in Excel file');
    process.exit(1);
  }
  
  if (roleColIndex === -1) {
    console.error('Error: Role column not found in Excel file');
    process.exit(1);
  }
  
  const missingSeniorityLevels = Object.entries(seniorityColIndices)
    .filter(([_, index]) => index === -1)
    .map(([name]) => name);
    
  if (missingSeniorityLevels.length > 0) {
    console.warn(`Warning: Could not find columns for seniority levels: ${missingSeniorityLevels.join(', ')}`);
  }
  
  // Extract data from rows
  const regions = new Set();
  const roles = new Set();
  const rates = [];
  
  // Process data rows (skip header row)
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const region = row[regionColIndex];
    const role = row[roleColIndex];
    
    // Skip rows without region or role
    if (!region || !role) continue;
    
    // Add region and role to sets
    regions.add(region);
    roles.add(role);
    
    // Process rates for each seniority level
    for (const [level, colIndex] of Object.entries(seniorityColIndices)) {
      if (colIndex === -1) continue;
      
      const rate = row[colIndex];
      if (rate === null || isNaN(Number(rate))) continue;
      
      rates.push({
        region,
        role,
        seniorityLevel: level,
        rate: Number(rate)
      });
    }
  }
  
  console.log(`Extracted ${regions.size} regions, ${roles.size} roles, and ${rates.length} rates`);
  
  return {
    regions: Array.from(regions).map(name => ({ name, multiplier: getRegionMultiplier(name) })),
    roles: Array.from(roles).map(name => ({ name })),
    rates
  };
}

/**
 * Get region multiplier based on region name
 */
function getRegionMultiplier(regionName) {
  const regionName_lower = regionName.toLowerCase();
  
  // Define region multipliers based on region names
  if (regionName_lower.includes('south east asia')) return 1.0;
  if (regionName_lower.includes('middle east') || regionName_lower.includes('uae')) return 1.2;
  if (regionName_lower.includes('europe') || regionName_lower.includes('uk')) return 1.5;
  if (regionName_lower.includes('us') || regionName_lower.includes('north america')) return 1.8;
  
  // Default multiplier
  return 1.0;
}

/**
 * Insert regions into the database
 */
async function insertRegions(regions) {
  console.log('Inserting regions...');
  
  for (const region of regions) {
    try {
      // Check if region exists
      const { data: existing } = await supabase
        .from('regions')
        .select('id')
        .eq('name', region.name);
      
      if (existing && existing.length > 0) {
        // Update existing region
        const { error } = await supabase
          .from('regions')
          .update({ multiplier: region.multiplier })
          .eq('name', region.name);
        
        if (error) console.error(`Error updating region ${region.name}:`, error);
        else console.log(`Updated region: ${region.name}`);
      } else {
        // Insert new region
        const { error } = await supabase
          .from('regions')
          .insert(region);
        
        if (error) console.error(`Error inserting region ${region.name}:`, error);
        else console.log(`Inserted region: ${region.name}`);
      }
    } catch (error) {
      console.error(`Error processing region ${region.name}:`, error);
    }
    
    await delay(100);
  }
}

/**
 * Insert roles into the database
 */
async function insertRoles(roles) {
  console.log('Inserting roles...');
  
  for (const role of roles) {
    try {
      // Check if role exists
      const { data: existing } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role.name);
      
      if (existing && existing.length > 0) {
        console.log(`Role already exists: ${role.name}`);
      } else {
        // Insert new role
        const { error } = await supabase
          .from('roles')
          .insert(role);
        
        if (error) console.error(`Error inserting role ${role.name}:`, error);
        else console.log(`Inserted role: ${role.name}`);
      }
    } catch (error) {
      console.error(`Error processing role ${role.name}:`, error);
    }
    
    await delay(100);
  }
}

/**
 * Insert rates into the database
 */
async function insertRates(rates) {
  console.log('Inserting rates...');
  
  for (const rateData of rates) {
    try {
      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', rateData.role);
      
      if (roleError || !roleData || roleData.length === 0) {
        console.error(`Error getting role ID for ${rateData.role}:`, roleError || 'Role not found');
        continue;
      }
      
      // Get region ID
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('id')
        .eq('name', rateData.region);
      
      if (regionError || !regionData || regionData.length === 0) {
        console.error(`Error getting region ID for ${rateData.region}:`, regionError || 'Region not found');
        continue;
      }
      
      // Get seniority level ID
      const { data: levelData, error: levelError } = await supabase
        .from('seniority_levels')
        .select('id')
        .eq('name', rateData.seniorityLevel);
      
      if (levelError || !levelData || levelData.length === 0) {
        console.error(`Error getting seniority level ID for ${rateData.seniorityLevel}:`, levelError || 'Seniority level not found');
        continue;
      }
      
      const rate = {
        role_id: roleData[0].id,
        region_id: regionData[0].id,
        seniority_level_id: levelData[0].id,
        base_rate: rateData.rate
      };
      
      // Check if rate exists
      const { data: existingRate, error: existingRateError } = await supabase
        .from('rates')
        .select('id')
        .eq('role_id', rate.role_id)
        .eq('region_id', rate.region_id)
        .eq('seniority_level_id', rate.seniority_level_id);
      
      if (existingRateError) {
        console.error('Error checking existing rate:', existingRateError);
        continue;
      }
      
      if (existingRate && existingRate.length > 0) {
        // Update existing rate
        const { error } = await supabase
          .from('rates')
          .update({ base_rate: rate.base_rate })
          .eq('id', existingRate[0].id);
        
        if (error) console.error(`Error updating rate:`, error);
        else console.log(`Updated rate for ${rateData.role} in ${rateData.region} (${rateData.seniorityLevel})`);
      } else {
        // Insert new rate
        const { error } = await supabase
          .from('rates')
          .insert(rate);
        
        if (error) console.error(`Error inserting rate:`, error);
        else console.log(`Inserted rate for ${rateData.role} in ${rateData.region} (${rateData.seniorityLevel})`);
      }
    } catch (error) {
      console.error(`Error processing rate:`, error);
    }
    
    await delay(100);
  }
}

/**
 * Verify imported data
 */
async function verifyData() {
  console.log('Verifying imported data...');
  
  try {
    // Check regions
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('id, name')
      .order('name');
    
    if (regionsError) {
      console.error('Error checking regions:', regionsError);
    } else {
      console.log(`Found ${regions.length} regions in database`);
    }
    
    // Check roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name')
      .order('name');
    
    if (rolesError) {
      console.error('Error checking roles:', rolesError);
    } else {
      console.log(`Found ${roles.length} roles in database`);
    }
    
    // Check seniority levels
    const { data: levels, error: levelsError } = await supabase
      .from('seniority_levels')
      .select('id, name')
      .order('name');
    
    if (levelsError) {
      console.error('Error checking seniority levels:', levelsError);
    } else {
      console.log(`Found ${levels.length} seniority levels in database`);
    }
    
    // Check rates
    const { data: rates, error: ratesError } = await supabase
      .from('rates')
      .select('id')
      .limit(1);
    
    if (ratesError) {
      console.error('Error checking rates:', ratesError);
    } else {
      const { count, error: countError } = await supabase
        .from('rates')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error counting rates:', countError);
      } else {
        console.log(`Found ${count} rates in database`);
      }
    }
  } catch (error) {
    console.error('Error verifying data:', error);
  }
}

/**
 * Main function to run the import process
 */
async function main() {
  try {
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.error('ERROR: Required tables do not exist in the database.');
      console.error('Please run the SQL statements in the Supabase SQL Editor first.');
      process.exit(1);
    }
    
    // Insert seniority levels
    await insertSeniorityLevels();
    
    // Process Excel file
    const { regions, roles, rates } = await processExcel();
    
    // Insert data into database
    await insertRegions(regions);
    await insertRoles(roles);
    await insertRates(rates);
    
    // Verify imported data
    await verifyData();
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import process:', error);
    process.exit(1);
  }
}

// Run the import process
main();
