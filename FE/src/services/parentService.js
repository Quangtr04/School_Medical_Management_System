import api from "../configs/config-axios";

export const getChildren = () => api.get("/parent/students");
export const getCheckups = () => api.get("/parent/checkups/approved");
export const getVaccinations = () => api.get("/parent/vaccine-campaigns");
