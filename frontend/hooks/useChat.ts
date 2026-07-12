import { useEffect, useState } from "react";
import { getConsultants } from "@/services/consultant.service";

export interface Consultant {
  id: string;
  name: string;
  slug: string;
}

export const useChat = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState("homeopathy");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadConsultants = async () => {
      try {
        const data = await getConsultants();
        setConsultants(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadConsultants();
  }, []);

  return {
    consultants,
    selectedConsultant,
    setSelectedConsultant,
    message,
    setMessage,
  };
};