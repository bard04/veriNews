const apis = [
    {
        name: "NewsAPI",
        enabled: true,
        url: "https://newsapi.org/v2/top-headlines?country=ke&apiKey=3fd0407bb0cc411491cbd3c0025bdc8c",
        extractData: (data) => data.articles?.map(article => ({
            title: article.title,
            image: article.urlToImage, 
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
            image: article.image || article.urlToImage,
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
            image: article.image_url,
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
            image: article.image,
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
            image: article.image,
            description: article.description || "No description available.",
            link: article.url || "#"
        })) || []
    }
];

const newsContainer = document.getElementById("news-container");
const backupNews = [];
window.allNews = []; // Store all fetched news globally

function fetchWithTimeout(url, options = {}, timeout = 3000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
        )
    ]);
}

//  Filter out articles with no valid image
function filterArticles(articles) {
    return articles.filter(article =>
        article.image &&
        article.image.trim() !== "" &&
        article.image.startsWith("http")
    );
}

//  Only display articles with real image URLs
function displayNews(articles) {
    if (!newsContainer) {
        console.error("News container not found");
        return;
    }

    let newsHTML = "";
    articles.forEach((article, idx) => {
        const articleKey = encodeURIComponent(article.link || article.title || "article" + idx);
        newsHTML += `
            <div class="news-item">
                <h3>${article.title}</h3>
                ${article.image ? `<img src="${article.image}" alt="News Image">` : ""}
                <p>${article.description}</p>
                <a href="${article.link}" target="_blank">Read More</a>
                <div class="share-buttons" style="margin:10px 0;">
                  <a href="https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}" target="_blank" title="Share on WhatsApp">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg" alt="WhatsApp" style="width:28px;vertical-align:middle;filter:invert(36%) sepia(97%) saturate(749%) hue-rotate(81deg) brightness(93%) contrast(92%);">
                  </a>
                  <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.link)}" target="_blank" title="Share on Twitter">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" alt="Twitter" style="width:28px;vertical-align:middle;filter:invert(41%) sepia(99%) saturate(749%) hue-rotate(181deg) brightness(93%) contrast(92%);">
                  </a>
                  <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.link)}" target="_blank" title="Share on Facebook">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="Facebook" style="width:28px;vertical-align:middle;filter:invert(27%) sepia(99%) saturate(749%) hue-rotate(181deg) brightness(93%) contrast(92%);">
                  </a>
                </div>
                <button class="bookmark-btn" data-article="${articleKey}" style="margin:8px 0; background:#ffd700; border:none; border-radius:6px; padding:6px 16px; cursor:pointer;">
                  &#9734; Save
                </button>
                <section class="comments-section" data-article="${articleKey}">
                  <h4>Comments</h4>
                  <div class="comments-list" id="comments-list-${articleKey}"></div>
                  <form class="commentForm" data-article="${articleKey}">
                    <input type="text" class="commentName" placeholder="Your Name" required style="margin-bottom:8px; width:100%; padding:8px;" />
                    <textarea class="commentText" placeholder="Your Comment" required style="width:100%; padding:8px;"></textarea>
                    <button type="submit" style="margin-top:8px;">Post Comment</button>
                  </form>
                </section>
            </div>
        `;
    });

    newsContainer.innerHTML = newsHTML || "<p>No news with images available.</p>";

    // Attach comment logic for each article
    articles.forEach((article, idx) => {
        const articleKey = encodeURIComponent(article.link || article.title || "article" + idx);
        loadCommentsForArticle(articleKey);

        const form = document.querySelector(`form.commentForm[data-article="${articleKey}"]`);
        if (form) {
            form.onsubmit = function (e) {
                e.preventDefault();
                const name = form.querySelector('.commentName').value.trim();
                const text = form.querySelector('.commentText').value.trim();
                if (!name || !text) return;
                const comments = JSON.parse(localStorage.getItem("comments-" + articleKey) || "[]");
                comments.push({ name, text });
                localStorage.setItem("comments-" + articleKey, JSON.stringify(comments));
                form.reset();
                loadCommentsForArticle(articleKey);
            };
        }
    });
}

// Helper to load comments for a specific article
function loadCommentsForArticle(articleKey) {
    const commentsList = document.getElementById("comments-list-" + articleKey);
    if (!commentsList) return;
    const comments = JSON.parse(localStorage.getItem("comments-" + articleKey) || "[]");
    commentsList.innerHTML = comments.map(c =>
        `<div class="comment" style="margin-bottom:12px;">
            <strong>${c.name}</strong><br/>
            <span>${c.text}</span>
        </div>`
    ).join("");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function fetchNews() {
    const enabledApis = apis.filter(api => api.enabled);
    shuffleArray(enabledApis);
    let foundArticles = [];
    let successfulApis = 0;

    for (let api of enabledApis) {
        try {
            const urlWithTimestamp = (api.name === "NewsDataAPI") ? api.url : `${api.url}&timestamp=${new Date().getTime()}`;
            let response = await fetchWithTimeout(urlWithTimestamp, {}, 3000);
            if (!response.ok) 
                throw new Error(`API ${api.name} failed with status: ${response.status}`);
            let data = await response.json();
            const articles = api.extractData(data);
            const filteredArticles = filterArticles(articles); //  Filter before display
            console.log(`Fetched ${filteredArticles.length} articles from ${api.name}`);
            if (filteredArticles.length > 0) {
                foundArticles.push(...filteredArticles);
                successfulApis++;
                if (successfulApis >= 2) break;
            }
        } catch (error) {
            console.warn(`Error fetching news from ${api.name}:`, error);
        }
    }

    if (foundArticles.length > 0) {
        localStorage.setItem("cachedNews", JSON.stringify(foundArticles));
        window.allNews = foundArticles; // Store globally for search
        displayNews(foundArticles);
    } else {
        console.warn("No fresh news available.");
        if (!localStorage.getItem("cachedNews")) {
            displayNews(backupNews);
        }
    }
}

window.onload = function () {
    const cachedNews = localStorage.getItem("cachedNews");
    if (cachedNews) {
        const parsedNews = JSON.parse(cachedNews);
        window.allNews = parsedNews; // Store globally for search
        displayNews(parsedNews);
    } else {
        displayNews(backupNews);
    }
    fetchNews();
};

setInterval(fetchNews, 300000);

const messages = [
    "VeriNews brings you the latest and verified news from across the world. Get the latest in business, sports, politics and more any time."
];

const scrollingText = document.getElementById("scrollingText");

function changeMessage() {
    scrollingText.textContent = messages[0];
}

changeMessage();

// --- SEARCH FUNCTIONALITY ---
document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (!searchForm || !searchInput) return;

    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        const filtered = (window.allNews || []).filter(article =>
            (article.title && article.title.toLowerCase().includes(query)) ||
            (article.description && article.description.toLowerCase().includes(query))
        );
        displayNews(filtered);
    });
});

// Inject header and footer
function loadHTML(id, url, callback) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (callback) callback();
    });
}

// Load header, then attach dark mode toggle
document.addEventListener("DOMContentLoaded", function () {
  loadHTML('header-placeholder', 'header.html', function () {
    const toggle = document.getElementById("darkModeToggle");
    if (toggle) {
      toggle.onclick = function () {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
      };
      // Load preference
      if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
      }
    }
  });
  // Load footer
  loadHTML('footer-placeholder', 'footer.html');
});

// Scroll to Top Button
document.addEventListener("DOMContentLoaded", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (scrollToTopBtn) {
    window.onscroll = function () {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = "block";
      } else {
        scrollToTopBtn.style.display = "none";
      }
    };
    scrollToTopBtn.onclick = function () {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };
  }
});

// Modal open/close logic (for subscribe modal)
function openModal() {
  document.getElementById("subscribeModal").style.display = "block";
}
function closeModal() {
  document.getElementById("subscribeModal").style.display = "none";
}
window.onclick = function (event) {
  const modal = document.getElementById("subscribeModal");
  if (modal && event.target === modal) {
    modal.style.display = "none";
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const commentForm = document.getElementById("commentForm");
  const commentsList = document.getElementById("comments-list");
  if (commentForm && commentsList) {
    // Load comments from localStorage
    function loadComments() {
      const comments = JSON.parse(localStorage.getItem("comments") || "[]");
      commentsList.innerHTML = comments.map(c =>
        `<div class="comment" style="margin-bottom:12px;">
          <strong>${c.name}</strong><br/>
          <span>${c.text}</span>
        </div>`
      ).join("");
    }
    loadComments();

    commentForm.onsubmit = function (e) {
      e.preventDefault();
      const name = document.getElementById("commentName").value.trim();
      const text = document.getElementById("commentText").value.trim();
      if (!name || !text) return;
      const comments = JSON.parse(localStorage.getItem("comments") || "[]");
      comments.push({ name, text });
      localStorage.setItem("comments", JSON.stringify(comments));
      commentForm.reset();
      loadComments();
    };
  }
});

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("bookmark-btn")) {
    const articleKey = e.target.getAttribute("data-article");
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (!bookmarks.includes(articleKey)) {
      bookmarks.push(articleKey);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      e.target.innerHTML = "&#9733; Saved";
      e.target.disabled = true;
    }
  }
});

function showBreakingNews(message) {
  const banner = document.getElementById("breaking-news-banner");
  const text = document.getElementById("breaking-news-text");
  if (banner && text) {
    text.innerHTML = message;
    banner.style.display = "block";
  }
}

function fetchBreakingNews() {
  if (window.allNews && window.allNews.length > 0) {
    const top = window.allNews[0];
    const breaking = `<a href="${top.link}" style="color:#fff;text-decoration:underline;" target="_blank">${top.title}</a>`;
    showBreakingNews("Breaking: " + breaking);
  }
}

// --- At the END of your displayNews function, add this line: ---
fetchBreakingNews();