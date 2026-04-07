/**
 * employeeService.js - NIT Field App
 * This file is a placeholder for the future external API.
 * When you have the API link, just replace the URL below.
 */
import axios from 'axios';

// --- PLACEHOLDER FOR EXTERNAL API ---
const EXTERNAL_API_URL = 'https://your-api-endpoint.com/employees'; 

export const fetchEmployeeData = async (empNo) => {
    try {
        // Example structure of the expected call:
        // const response = await axios.get(`${EXTERNAL_API_URL}/${empNo}`);
        // return response.data; // Expected: { name: '...', employeeId: '...', site: '...' }
        
        // For now, it returns null or simulation
        console.log(`[EmployeeService] Fetching data for ID: ${empNo} from External API...`);
        return null; 
    } catch (error) {
        console.error('[EmployeeService] Error fetching from external API:', error);
        throw error;
    }
};
