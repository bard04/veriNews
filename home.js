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
        name: "CurrentsAPI",
        enabled: true,
        url: "http://localhost:5000/currents",
        extractData: (data) => data.news?.map(article => ({
            title: article.title,
            image: article.image || "default-news.png",
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

// Backup news for first-time users (update periodically as needed)
const backupNews = [
    {
        title: "Welcome to VeriNews!",
        image: "default-news.png",
        description: "Your trusted source for the latest verified news.",
        link: "https://www.bbc.com/news"
    },
    {
        title: "Stay Informed",
        image: "default-news.png",
        description: "We bring you news from reliable sources in real time.",
        link: "https://www.aljazeera.com/news/"
    },
    {
        title: "Latest Tech, Business, and Sports Updates",
        image: "default-news.png",
        description: "Get insights into the latest trends and developments.",
        link: "https://edition.cnn.com/"
    }
   
];

// Helper: fetch with timeout (3-second timeout per API request)
function fetchWithTimeout(url, options = {}, timeout = 3000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
        )
    ]);
}

// Display news articles in the container
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
                <img src="${article.image}" alt="News Image" onerror="this.onerror=null; this.src='default-news.jpeg';">
                <p>${article.description}</p>
                <a href="${article.link}" target="_blank">Read More</a>
            </div>
        `;
    });
    newsContainer.innerHTML = newsHTML || "<p>No news available.</p>";
}

// Shuffle news articles for random order
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Fetch fresh news from all APIs with individual timeouts
async function fetchNews() {
    const enabledApis = apis.filter(api => api.enabled);
    let allArticles = [];

    const fetchPromises = enabledApis.map(api => {
        const urlWithTimestamp = `${api.url}&timestamp=${new Date().getTime()}`;
        return fetchWithTimeout(urlWithTimestamp, {}, 5000) // 5-second timeout per API
            .then(response => response.ok ? response.json() : Promise.reject(response.status))
            .then(data => {
                const articles = api.extractData(data);
                allArticles = allArticles.concat(articles);
            })
            .catch(error => console.warn(`Error fetching news from ${api.name}:`, error));
    });

    await Promise.allSettled(fetchPromises);

    if (allArticles.length > 0) {
        shuffleArray(allArticles);
        localStorage.setItem("cachedNews", JSON.stringify(allArticles));
        displayNews(allArticles);
    } else {
        console.warn("No fresh news available.");
        // Only update display with backup news if there's no cached news already.
        if (!localStorage.getItem("cachedNews")) {
            displayNews(backupNews);
        }
        // Otherwise, keep displaying the cached news.
    }
}

// On page load: display cached news if available; otherwise, show backup news.
// Then fetch fresh news in the background.
window.onload = function () {
    const cachedNews = localStorage.getItem("cachedNews");
    if (cachedNews) {
        displayNews(JSON.parse(cachedNews));
    } else {
        displayNews(backupNews);
    }
    fetchNews();
};

// Refresh news every 10 minutes
setInterval(fetchNews, 600000);

// Moving text messages
const messages = [
    "VeriNews - Bringing you the latest & verified news!",
    "Stay informed with breaking news any time!",
    "Your trusted source for news & updates!",
    "Get the latest in business, sports, politics & more!"
];

let index = 0;
const scrollingText = document.getElementById("scrollingText");

function changeMessage() {
    scrollingText.textContent = messages[index];
    index = (index + 1) % messages.length;
}
changeMessage();
setInterval(changeMessage, 5000); // Change text every 5 seconds
