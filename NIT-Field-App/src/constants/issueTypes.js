/**
 * issueTypes.js — NIT REPORT
 * Comprehensive hierarchy for Safety and Service issues across Site, Office, and Accommodation.
 */

export const ISSUE_HIERARCHY = {
  SITE: {
    Safety: {
      Welfare: ["Drinking/potable water", "Toilet facility", "Hygiene items (hand wash, sanitation/cleaning material)"],
      Environment: ["Water leakage", "Waste Removal", "Oil Spillage"],
      Injuries: ["Cut/abrasions/bruises", "Burn", "Fracture"],
      Fire: ["Electrical connection", "Housekeeping", "Fire extinguisher"]
    },
    Service: {
      Transport: ["The bus is dirty", "The bus is late", "Bad driver"],
      Maintenance: ["Appliances", "Plumbing", "Lighting"],
      Supplies: ["General Supplies Request"]
    }
  },
  OFFICE: {
    Safety: {
      Welfare: ["Drinking/potable water", "Toilet facility", "Cleaning"],
      Electrical: ["Overloaded power outlets", "Damaged cables", "Missing outlet covers"],
      Fire: ["Material storage", "Fire extinguisher", "Emergency evacuation plan"],
      Workstation: ["Furniture", "Congested space/area", "Lighting/Illumination"]
    },
    Service: {
      Maintenance: ["Appliances", "Bathroom", "Lighting"],
      Supplies: ["New table", "New chair", "Notebook and pens"]
    }
  },
  ACCOMMODATION: {
    Safety: {
      Welfare: ["Drinking/potable water", "Toilet facility", "Hygiene items (cleaning material)"],
      Environment: ["Water leakage", "Waste Removal", "Pest control"],
      Fire: ["Electrical connection", "Housekeeping", "Fire extinguisher"]
    },
    Service: {
      Transport: ["The bus is dirty", "The bus is late", "Bad driver"],
      Housing: ["No water or electricity", "Not clean", "Crowded"],
      Maintenance: ["Appliances", "Plumbing", "Lighting"]
    }
  }
};

export const PRIORITIES = ["Critical", "High", "Medium", "Low"];
export const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Rarely"];
