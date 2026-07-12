export const getConsultants = (_: any, res: any) => {
    res.json({
        success: true,
        message: "Consultants retrieved successfully",
        data: [
            "Homeopathy",
            "Ayurveda",
            "Allopathy",
            "Yoga",
        ]
    });
};