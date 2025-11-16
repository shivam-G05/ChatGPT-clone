const axios = require("axios");

async function getNews(topic) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${process.env.NEWS_API}`;
    const response = await axios.get(url);

    return response.data.articles.slice(0, 5).map(a => ({
        title: a.title,
        url: a.url,
        source: a.source?.name
    }));
}

module.exports = getNews;
