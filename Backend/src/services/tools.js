// services/tools.js - Built-in Tool Handlers
const axios = require('axios');

/**
 * Tool definitions for Gemini API
 */
const toolDefinitions = [
  {
    name: 'get_weather',
    description: 'Get current weather information for a specific location. Use this when users ask about weather, temperature, or atmospheric conditions.',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name or "city, country code" (e.g., "London" or "London, UK")'
        }
      },
      required: ['location']
    }
  },

{
  name: 'get_datetime',
  description: 'Get current date and time. Defaults to Ghaziabad (Asia/Kolkata) timezone if none is provided.',
  parameters: {
    type: 'object',
    properties: {
      timezone: {
        type: 'string',
        description: 'Timezone (e.g., "Asia/Kolkata", "America/New_York"). Leave empty to use Ghaziabad time (Asia/Kolkata).'
      }
    },
    required: []
  }
},

  {
    name: 'get_news',
    description: 'Get latest news articles. Use this when users ask about recent news, current events, or specific news topics.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for news (e.g., "technology", "sports", "politics")'
        },
        category: {
          type: 'string',
          description: 'News category',
          enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology','politics']
        },
        limit: {
          type: 'number',
          description: 'Number of articles to return (default: 1, max: 10)'
        }
      },
      required: []
    }
  }
];

/**
 * Tool handler implementations
 */
const toolHandlers = {
  
get_weather: async ({ location }) => {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      
      if (!apiKey) {
        return {
          success: false,
          error: 'Weather API key not configured'
        };
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: location,
            appid: apiKey,
            units: 'metric'
          },
          timeout: 5000
        }
      );

      const data = response.data;
      
      return {
        success: true,
        location: `${data.name}, ${data.sys.country}`,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        wind_speed: data.wind.speed,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Weather API error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch weather data'
      };
    }
},

//   get_datetime: async ({ timezone = 'UTC' }) => {
//     try {
//       const now = new Date();
      
//       // Format date for the specified timezone
//       const options = {
//         timeZone: timezone || 'UTC',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         weekday: 'long',
//         timeZoneName: 'short'
//       };

//       const formatter = new Intl.DateTimeFormat('en-US', options);
//       const formatted = formatter.format(now);
      
//       return {
//         success: true,
//         timestamp: now.toISOString(),
//         formatted: formatted,
//         timezone: timezone || 'UTC',
//         unix: Math.floor(now.getTime() / 1000),
//         day_of_week: now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }),
//         date: now.toLocaleDateString('en-US', { timeZone: timezone }),
//         time: now.toLocaleTimeString('en-US', { timeZone: timezone })
//       };
      
//     } catch (error) {
//       console.error('DateTime error:', error.message);
//       return {
//         success: false,
//         error: 'Invalid timezone or error getting date/time'
//       };
//     }
//   },

get_datetime: async ({ timezone = 'Asia/Kolkata' }) => {
  try {
    const now = new Date();

    // Format date for Ghaziabad (IST)
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
      timeZoneName: 'short'
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formatted = formatter.format(now);

    return {
      success: true,
      timestamp: now.toISOString(),
      formatted: formatted,
      timezone: 'Asia/Kolkata',
      unix: Math.floor(now.getTime() / 1000),
      day_of_week: now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }),
      date: now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }),
      time: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })
    };

  } catch (error) {
    console.error('DateTime error:', error.message);
    return {
      success: false,
      error: 'Invalid timezone or error getting date/time'
    };
  }
},

getNews_RSS: async ({ query, category, limit = 5 })=> {
  try {
    const Parser = require('rss-parser');
    const parser = new Parser({
      timeout: 5000,
      headers: {
        'User-Agent': 'ChatGPT-Clone/1.0'
      }
    });

    // RSS Feed URLs based on category
    const feeds = {
      general: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
      technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
      business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
      sports: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
      entertainment: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
      health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en',
      science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en'
    };

    let feedUrl = feeds[category] || feeds.general;

    // If query is provided, use search
    if (query) {
      feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    }

    const feed = await parser.parseURL(feedUrl);
    
    const articles = feed.items.slice(0, limit).map(item => ({
      title: item.title,
      description: item.contentSnippet || item.content || 'No description available',
      source: item.source?.name || 'Google News',
      url: item.link,
      published_at: item.pubDate || item.isoDate,
      author: item.creator || item.author
    }));

    return {
      success: true,
      total_results: articles.length,
      articles: articles,
      query: query || category || 'top headlines'
    };

  } catch (error) {
    console.error('RSS News error:', error.message);
    return {
      success: false,
      error: 'Failed to fetch news from RSS feeds'
    };
  }
}



//   get_news: async ({ query, category, limit = 5 }) => {
//     try {
//       const apiKey = process.env.NEWS_API_KEY;
      
//       if (!apiKey) {
//         return {
//           success: false,
//           error: 'News API key not configured'
//         };
//       }

//       const maxLimit = Math.min(limit || 5, 10);
      
//       // Build API endpoint based on parameters
//       let endpoint = 'https://newsapi.org/v2/';
//       let params = {
//         apiKey: apiKey,
//         pageSize: maxLimit,
//         language: 'en'
//       };

//       if (query) {
//         endpoint += 'everything';
//         params.q = query;
//         params.sortBy = 'publishedAt';
//       } else if (category) {
//         endpoint += 'top-headlines';
//         params.category = category;
//       } else {
//         endpoint += 'top-headlines';
//         params.country = 'us';
//       }

//       const response = await axios.get(endpoint, {
//         params,
//         timeout: 5000
//       });

//       const articles = response.data.articles.map(article => ({
//         title: article.title,
//         description: article.description,
//         source: article.source.name,
//         url: article.url,
//         published_at: article.publishedAt,
//         author: article.author
//       }));

//       return {
//         success: true,
//         total_results: response.data.totalResults,
//         articles: articles,
//         query: query || category || 'top headlines'
//       };
      
//     } catch (error) {
//       console.error('News API error:', error.message);
//       return {
//         success: false,
//         error: error.response?.data?.message || 'Failed to fetch news'
//       };
//     }
//   }


};

/**
 * Execute a tool by name
 */
async function executeTool(toolName, args) {
  const handler = toolHandlers[toolName];
  
  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  return await handler(args);
}

/**
 * Convert tool definitions to Gemini function declarations format
 */
function getGeminiFunctionDeclarations() {
  return toolDefinitions.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }));
}

module.exports = {
  toolDefinitions,
  toolHandlers,
  executeTool,
  getGeminiFunctionDeclarations
};