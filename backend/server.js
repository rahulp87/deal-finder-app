const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Use CORS to allow your frontend to make requests to this server
app.use(cors());

// --- Scraper Functions ---
// This is where you will add the logic for each site you want to scrape.

/**
 * Scrapes RedFlagDeals' "Hot Deals" forum for a given product query.
 * @param {string} query - The product to search for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of deal objects.
 */
async function scrapeRedFlagDeals(query) {
    const deals = [];
    try {
        // We target the 'Hot Deals' forum (f=9) for the most relevant results.
        const searchUrl = `https://forums.redflagdeals.com/search.php?q=${encodeURIComponent(query)}&f=9`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);

        // Each search result is in a list item with the class 'threadbit'
        $('li.threadbit').each((i, el) => {
            const titleElement = $(el).find('.thread-title a');
            const title = titleElement.text().trim();
            const url = "https://forums.redflagdeals.com" + titleElement.attr('href');

            // Attempt to extract price and retailer from the title text. This is tricky and may not always be perfect.
            const priceMatch = title.match(/\$?(\d+\.\d{2})/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : null;

            // For now, we'll list the source as the retailer. A more advanced scraper could try to parse retailer names.
            const retailer = 'RedFlagDeals Forum';

            // Only add the deal if we could find a title and a potential price
            if (title && price) {
                deals.push({
                    retailer: retailer,
                    price: price,
                    url: url,
                    title: title, // We'll use the thread title as the description
                    stock: 'N/A' // Stock status is not available from forum listings
                });
            }
        });
    } catch (error) {
        console.error('Error scraping RedFlagDeals:', error.message);
        // Don't throw an error, just return empty array if a source fails.
    }
    return deals;
}

/**
 * Placeholder for scraping another source like Flipp.
 * @param {string} query - The product to search for.
 * @returns {Promise<Array<object>>}
 */
async function scrapeFlipp(query) {
    console.log(`(Placeholder) Scraping Flipp for: ${query}`);
    // --- Future implementation for scraping Flipp would go here ---
    return [];
}


// --- API Endpoint ---
// This endpoint takes a 'product' query and runs all scrapers.
app.get('/api/search', async (req, res) => {
    const { product } = req.query;

    if (!product) {
        return res.status(400).json({ error: 'Product query parameter is required' });
    }

    try {
        // Run all scraper functions in parallel for efficiency
        const scraperPromises = [
            scrapeRedFlagDeals(product),
            scrapeFlipp(product)
            // Add more scraper function calls here in the future
        ];

        const results = await Promise.all(scraperPromises);
        const allDeals = results.flat(); // Flatten the array of arrays into a single array

        if (allDeals.length === 0) {
            return res.json([]);
        }

        // Sort all found deals by price, lowest first
        const sortedDeals = allDeals.sort((a, b) => a.price - b.price);
        
        res.json(sortedDeals);

    } catch (error) {
        console.error('An error occurred during the scraping process:', error);
        res.status(500).json({ error: 'Failed to fetch deals from sources.' });
    }
});

app.listen(PORT, () => {
    console.log(`Deal finder server running on http://localhost:${PORT}`);
});

