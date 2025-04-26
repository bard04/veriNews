const apis = [
    {
        name: "NewsAPI",
        enabled: true,
        url: "https://newsapi.org/v2/top-headlines?country=ke&apiKey=3fd0407bb0cc411491cbd3c0025bdc8c",
        extractData: (data) => data.articles?.map(article => ({
            title: article.title,
            image: article.urlToImage || "default-news.png",
            description: article.description || "No description available.",
            link: article.url || "#"
        })) || []
    },
    {
        name: "GNewsAPI",
        enabled: true,
        url: "https://gnews.io/api/v4/top-headlines?country=us&token=25119820a88a607d763a36aa7a9a08c0",
        extractData: (data) => data.articles?.map(article => ({
            title: article.title,
            image: article.image || article.urlToImage || "default-news.png",
            description: article.description || "No description available.",
            link: article.url || "#"
        })) || []
    },
    {
        name: "NewsDataAPI",
        enabled: true,
        url: "https://newsdata.io/api/1/news?apikey=pub_767878512ceefd89037d9ece21b6240821f2d&country=us&language=en",
        extractData: (data) => data.results?.map(article => ({
            title: article.title,
            image: article.image_url || "default-news.png",
            description: article.description || "No description available.",
            link: article.link || "#"
        })) || []
    },
    {
        name: "WorldNewsAPI",
        enabled: true,
        url: "https://api.worldnewsapi.com/search-news?api-key=6d7539f44e9b475e999ddb29e15ee218&language=en",
        extractData: (data) => data.news?.map(article => ({
            title: article.title,
            image: article.image || "default-news.png",
            description: article.text || "No description available.",
            link: article.url || "#"
        })) || []
    },
    {
        name: "Mediastack",
        enabled: true,
        url: "https://api.mediastack.com/v1/news?access_key=0f3735fea05b4dae23577fc783a50a09&countries=us&languages=en",
        extractData: (data) => data.data?.map(article => ({
            title: article.title,
            image: article.image || "default-news.png",
            description: article.description || "No description available.",
            link: article.url || "#"
        })) || []
    }
];

const newsContainer = document.querySelector(".item3N");

// Backup news for first-time users
const backupNews = [
    {
        title: "Tech Giants Face New Regulations",
        image: "default-news.png",
        description: "Governments worldwide are introducing new policies to regulate tech companies.",
        link: "https://www.bbc.com/news/technology"
    },
    {
        title: "Global Markets Rally Amid Optimism",
        image: "default-news.png",
        description: "Stock markets saw a significant rise today following positive economic data.",
        link: "https://www.aljazeera.com/economy"
    },
    {
        title: "AI Revolutionizing Industries",
        image: "default-news.png",
        description: "AI is transforming various sectors, from healthcare to finance.",
        link: "https://edition.cnn.com/tech"
    }
];

// Helper function: fetch with timeout (3-second timeout per API request)
function fetchWithTimeout(url, options = {}, timeout = 3000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
        )
    ]);
}

// Function to display news articles in the container
function displayNews(articles) {
    if (!newsContainer) {
        console.error("News container not found");
        return;
    }

    let newsHTML = "";
    articles.forEach(article => {
        newsHTML += `
            <div class="news-item">
                <h3>${article.title}</h3>
                <img src="${article.image}" alt="News Image" onerror="this.onerror=null; this.src='default-news.png';">
                <p>${article.description}</p>
                <a href="${article.link}" target="_blank">Read More</a>
            </div>
        `;
    });

    newsContainer.innerHTML = newsHTML || "<p>No news available.</p>";
}


// Function to shuffle array elements (in-place)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to fetch fresh news from enabled APIs in random order,
// and stop once any API returns articles.
async function fetchNews() {
    const enabledApis = apis.filter(api => api.enabled);
    shuffleArray(enabledApis); // Randomize API order
    let foundArticles = [];
    let successfulApis = 0;

    for (let api of enabledApis) {
        try {
            const urlWithTimestamp = (api.name === "NewsDataAPI")
                ? api.url
                : `${api.url}&timestamp=${new Date().getTime()}`;
            let response = await fetchWithTimeout(urlWithTimestamp, {}, 3000);
            if (!response.ok) throw new Error(`API ${api.name} failed with status: ${response.status}`);
            let data = await response.json();
            const articles = api.extractData(data);
            console.log(`Fetched ${articles.length} articles from ${api.name}`);
            if (articles.length > 0) {
                foundArticles.push(...articles);
                successfulApis++;
                if (successfulApis >= 2) break; // Stop after two successful fetches
            }
        } catch (error) {
            console.warn(`Error fetching news from ${api.name}:`, error);
        }
    }

    if (foundArticles.length > 0) {
        shuffleArray(foundArticles);
        localStorage.setItem("cachedNews", JSON.stringify(foundArticles));
        displayNews(foundArticles);
    } else {
        console.warn("No fresh news available.");
        if (!localStorage.getItem("cachedNews")) {
            displayNews(backupNews);
        }
    }
}



// On page load: 
// - For returning users, display cached news immediately.
// - For first-time users, display backup news.
// Then, fetch fresh news in the background.
window.onload = function () {
    const cachedNews = localStorage.getItem("cachedNews");
    if (cachedNews) {
        displayNews(JSON.parse(cachedNews));
    } else {
        displayNews(backupNews);
    }
    fetchNews();
};

// Refresh news every 5 minutes
setInterval(fetchNews, 300000);

const messages = [
    "VeriNews brings you the latest and verified news from across the world. Get the latest in business, sports, politics and more any time."
];

const scrollingText = document.getElementById("scrollingText");

function changeMessage() {
    scrollingText.textContent = messages[0];  // Use the single, long continuous message
}

changeMessage(); // Initialize the text immediately



