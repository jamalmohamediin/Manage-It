// src/localStorageService.ts
import localforage from "localforage";

localforage.config({
  name: "ManageIt",
  storeName: "patient_data", // like a table name
});

// Save data
export const savePatientForm = async (data: any) => {
  await localforage.setItem("patient_form_draft", data);
};

// Load data
export const loadPatientForm = async () => {
  return await localforage.getItem("patient_form_draft");
};

// Clear draft
export const clearPatientForm = async () => {
  await localforage.removeItem("patient_form_draft");
};
