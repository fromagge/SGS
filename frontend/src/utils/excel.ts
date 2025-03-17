import * as XLSX from 'xlsx';
import Papa from 'papaparse';

 // Required columns
 const requiredColumns = [
    'First name',
    'Last/Organization/Group/Household name',
  ];
  
  // At least one of these columns must be present
  const atLeastOneRequired = [
    'Email Addresses\\Email address',
    'Phones\\Number',
  ];
  
  // All possible columns (for reference)
  const allPossibleColumns = [
    'First name',
    'Last/Organization/Group/Household name',
    'System record ID',
    'Date changed',
    'Email Addresses\\Email address',
    'Email Addresses\\Date changed',
    'Todays Visitors Attribute\\Value',
    'Todays Visitors Attribute\\Date changed',
    'Addresses\\Address line 1',
    'Addresses\\Address line 2',
    'Addresses\\City',
    'Addresses\\ZIP',
    'Addresses\\State abbreviation',
    'Addresses\\Country abbreviation',
    'Phones\\Number',
    'Phones\\Date changed'
  ];
  

/**
 * Validates Excel and CSV files to ensure they contain required columns
 * @param file - The file to validate
 * @returns An object containing validation result and any error messages
 */
export const validateDataFile = async (file: File): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
 
  try {
    let headers: string[] = [];
    
    // Check file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'xlsx' || fileExt === 'xls') {
      // Process Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      if (jsonData.length > 0) {
        headers = jsonData[0] as string[];
      }
    } else if (fileExt === 'csv') {
      // Process CSV file
      const text = await file.text();
      const result = Papa.parse(text, { header: true });
      
      if (result.data.length > 0 && result.meta.fields) {
        headers = result.meta.fields;
      }
    } else {
      errors.push('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV file.');
      return { isValid: false, errors };
    }
    
    // Check required columns
    for (const col of requiredColumns) {
      if (!headers.includes(col)) {
        errors.push(`Required column "${col}" is missing.`);
      }
    }
    
    // Check if at least one of the required columns is present
    const hasAtLeastOneRequired = atLeastOneRequired.some(col => headers.includes(col));
    if (!hasAtLeastOneRequired) {
      errors.push(`At least one of these columns is required: ${atLeastOneRequired.join(', ')}`);
    }
    
    // Validate that only allowed columns are present
    const invalidColumns = headers.filter(col => !allPossibleColumns.includes(col));
    if (invalidColumns.length > 0) {
      errors.push(`The following columns are not allowed: ${invalidColumns.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating file:', error);
    errors.push('Failed to validate file. Please check the file format and try again.');
    return { isValid: false, errors };
  }
}; 