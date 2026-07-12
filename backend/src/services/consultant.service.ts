import prisma from "../config/prisma";

export const getAllConsultants = () => {
    return prisma.consultant.findMany({
        orderBy: { sortOrder: "asc" },
    });
}