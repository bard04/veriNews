const express = require("express");
const fetch = require("node-fetch"); // Ensure node-fetch is installed
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());

// CurrentsAPI Route
app.get("/currents", async (req, res) => {
    try {
        const apiUrl = "https://api.currentsapi.services/v1/latest-news?apiKey=E_ZlqYjmx8DPqtmYy3H0wD7EXXZSCzmZztw-sXcN-f5A4YEr";
        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(`CurrentsAPI Error: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ error: "CurrentsAPI request failed" });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Error fetching CurrentsAPI news" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
