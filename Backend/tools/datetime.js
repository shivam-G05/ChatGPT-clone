async function getCurrentDateTime() {
    try {
        const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

        return {
            datetime: now
        };
    } catch (err) {
        return {
            error: true,
            message: "Failed to get current date and time",
            details: err.message
        };
    }
};
module.exports = getCurrentDateTime;
