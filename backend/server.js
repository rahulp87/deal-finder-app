const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
// Use the port Render provides, or default to 3001 for local development
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Define a scraper function for RedFlagDeals
async function scrapeRedFlagDeals(product) {
    try {
        const searchUrl = `https://www.redflagdeals.com/search/#!/q/${encodeURIComponent(product)}`;
        // We will pretend to fetch and parse for this example, as direct scraping is complex.
        // In a real scenario, you'd use axios to get the page and cheerio to parse it.
        // For this functional example, let's return some realistic mock data.
        console.log(`Scraping RedFlagDeals for: ${product}`);
        
        // Simulating a network request delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // This is where you would parse the HTML with Cheerio.
        // For example:
        // const { data } = await axios.get(searchUrl);
        // const $ = cheerio.load(data);
        // const items = [];
        // $('.thread_title a').each((_, element) => { ... });
        // For now, returning mock data that resembles a real result.
        
        const mockResults = [
            {
                title: `[Amazon.ca] ${product} - On sale now!`,
                price: '$999.99',
                retailer: 'Amazon.ca',
                url: 'https://www.redflagdeals.com'
            },
            {
                title: `[Best Buy] ${product} Deal`,
                price: '$1049.99',
                retailer: 'Best Buy',
                url: 'https://www.redflagdeals.com'
            },
             {
                title: `[Walmart] ${product} Clearance`,
                price: '$979.00',
                retailer: 'Walmart',
                url: 'https://www.redflagdeals.com'
            }
        ];
        
        // Filter mock results to be more dynamic
        return mockResults.filter(item => item.title.toLowerCase().includes(product.toLowerCase().split(' ')[0]));

    } catch (error) {
        console.error('Error scraping RedFlagDeals:', error);
        return []; // Return an empty array on error
    }
}


app.get('/api/search', async (req, res) => {
    const { product } = req.query;

    if (!product) {
        return res.status(400).json({ error: 'Product query parameter is required' });
    }

    try {
        // In the future, you can add more scraper functions here
        const redFlagDealsResults = await scrapeRedFlagDeals(product);

        // Combine results from all sources
        const allResults = [...redFlagDealsResults];

        res.json(allResults);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deals' });
    }
});

app.listen(PORT, () => {
    console.log(`Deal finder server running on http://localhost:${PORT}`);
});

