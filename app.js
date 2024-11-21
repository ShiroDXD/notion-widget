const express = require('express');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const https = require('https');

// Create an agent that ignores SSL errors
const agent = new https.Agent({
    rejectUnauthorized: false,
});

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
    agent, // Pass the custom agent
});

// Initialize Notion Client
//const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Define your Notion database or page ID
const databaseId = process.env.NOTION_DATABASE_ID;

app.get('/get-event-date', async (req, res) => {
    try {
        // Query the Notion database
        const response = await notion.databases.query({
            database_id: databaseId,
        });

        console.log('Notion Response:', JSON.stringify(response, null, 2));

        // Check if there are any results
        if (response.results.length === 0) {
            return res.status(404).json({ error: 'No events found in the database.' });
        }

        // Assuming the event you need is the first result
        const event = response.results[0];
        console.log('Event:', event);

        // Check if the Event Date property exists and is valid
        const eventDateProperty = event.properties['Event Date'];
        if (!eventDateProperty || !eventDateProperty.date || !eventDateProperty.date.start) {
            return res.status(400).json({ error: 'Event Date property is missing or invalid.' });
        }

        const eventDate = eventDateProperty.date.start;
        res.json({ eventDate });
    } catch (error) {
        console.error('Error fetching event date:', error);
        //res.status(500).json({ error: 'Failed to fetch event date from Notion' });
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
