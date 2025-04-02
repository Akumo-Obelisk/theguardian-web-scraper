const PORT = 8000; // Port for the server
const axios = require('axios'); // Axios for HTTP requests
const cheerio = require('cheerio'); // Cheerio for parsing HTML
const express = require('express'); // Express for server setup

const app = express(); // Initialize Express app
const url = 'https://www.theguardian.com/international'; // URL to scrape

axios(url) // Make a GET request to the URL
  .then(async (response) => { // Handle the response
    const html = response.data; // Get the HTML from the response
    const $ = cheerio.load(html); // Load the HTML into Cheerio for parsing
    const articles = [];  // Array to store results
    const articleLinks = [];

    $('a.dcr-2yd10d', html).each(function() {
        const articleUrl = $(this).attr('href'); // Extract the article URL
        const title = $(this).attr('aria-label'); // Extract the title from aria-label attribute

        if (articleUrl && title) {
            const fullUrl = articleUrl.startsWith('https') ? articleUrl : `https://www.theguardian.com${articleUrl}`;
            articleLinks.push({ title, url: fullUrl });
        }
    });

    // Fetch meta descriptions for each article
    for (let article of articleLinks) {
        try {
            const articleResponse = await axios.get(article.url);
            const articleHtml = articleResponse.data;
            const $$ = cheerio.load(articleHtml);
            const metaDescription = $$('meta[name="description"]').attr('content') || 'No description available';
            
            articles.push({
                title: article.title,
                url: article.url,
                description: metaDescription
            });

        } catch (err) {
            console.log(`Error fetching article: ${article.url}`, err);
        }
    }

    console.log(articles);  // Output the results
  })
  .catch(err => console.log('Error fetching data:', err));  // Error handling

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server and log the port number
