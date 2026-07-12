import api from "./api";

export const getConsultants = async () => {
  const response = await api.get("/consultants");
  return response.data.data;
};