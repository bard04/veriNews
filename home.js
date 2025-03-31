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
        url: "https://newsdata.io/api/1/news?apikey=pub_767878512ceefd89037d9ece21b6240821f2d&country=ke&language=en",
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


async function fetchNews() {
    const enabledApis = apis.filter(api => api.enabled);
    let displayedNews = false;

    const fetchPromises = enabledApis.map(api =>
        fetch(api.url)
            .then(response => response.ok ? response.json() : Promise.reject(response.status))
            .then(data => {
                const articles = api.extractData(data);
                if (articles.length > 0 && !displayedNews) {
                    displayedNews = true;
                    displayNews(articles);
                }
            })
            .catch(error => console.warn(`Error fetching news from ${api.name}:`, error))
    );

    Promise.allSettled(fetchPromises).then(() => {
        if (!displayedNews) {
            newsContainer.innerHTML = "<p>Failed to load news. Please try again later.</p>";
        }
    });
}

// ** Display News Instantly **
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

// ** Load Cached News First, Then Fetch Updates **
window.onload = function () {
    fetchNews();
};

// ** Refresh News Every 10 Minutes Without Blocking Display **
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
