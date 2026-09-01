// MAGIC SYSTEM VARIABLES
let magicMode = null;
let targetLetters = [];
let currentLetterIndex = 0;
let navigationHistory = [];
let currentArticle = null;

// RELATED WORDS DICTIONARY (for adding extra blue links)
const relatedWordsDict = {
    'dog': ['Retrieve', 'Remarkable', 'Respond', 'Recognize', 'Reproduce', 'Reproduce', 'Friendly', 'Training', 'Behavior', 'Species', 'Animal', 'Domestic', 'Canine', 'Loyal', 'Intelligent'],
    'cat': ['Remarkable', 'Recognize', 'Resilient', 'Creature', 'Instinct', 'Territorial', 'Independent', 'Agile', 'Predator', 'Feline', 'Sensitive', 'Playful'],
    'india': ['Remarkable', 'Rich', 'Diverse', 'Ancient', 'Civilization', 'Culture', 'Religion', 'Democracy', 'Continent', 'Geography', 'Historical', 'Tradition'],
    'moon': ['Revolve', 'Reflects', 'Research', 'Gravity', 'Celestial', 'Astronomy', 'Satellite', 'Craters', 'Tides', 'Bright', 'Lunar'],
    'history': ['Recording', 'Records', 'Research', 'Reveals', 'Remarkable', 'Revolutionary', 'Traditions', 'Heritage', 'Documentation', 'Significant'],
    'default': ['Related', 'Research', 'Remarkable', 'Recognize', 'Retrieve', 'Remarkable', 'Reflect', 'Recent', 'Relevant', 'Reference']
};

// PAGE NAVIGATION
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function goBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop();
        const prevArticle = navigationHistory[navigationHistory.length - 1];
        if (prevArticle) {
            displayArticle(prevArticle.title);
        } else {
            showPage('homepage');
            navigationHistory = [];
        }
    } else {
        showPage('homepage');
        navigationHistory = [];
    }
}

function goToSearch() {
    showPage('searchpage');
    setTimeout(() => document.getElementById('searchInput').focus(), 100);
}

// PARSE SECRET CODE
function parseSecretCode(code) {
    if (!code || !code.includes(',')) return null;

    const parts = code.split(',');
    const secretPart = parts[0];
    const articlePart = parts.slice(1).join(',');

    if (secretPart.length < 2) return null;

    const firstChar = secretPart[0].toLowerCase();
    const letterMap = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };

    if (!letterMap[firstChar]) return null;

    const number = letterMap[firstChar];
    const revelationWord = secretPart.slice(1).toUpperCase();

    return {
        number: number,
        revelationWord: revelationWord,
        startingArticle: articlePart.toLowerCase().trim(),
        targetLetters: revelationWord.split(''),
        currentIndex: 0
    };
}

// SEARCH FROM HOMEPAGE
function searchFromHome() {
    const query = document.getElementById('homeSearch').value.trim();
    if (query) {
        document.getElementById('searchInput').value = query;
        showPage('searchpage');
        performSearch(query);
    }
}

// REAL-TIME SEARCH
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 1) {
                performSearch(query);
            } else {
                document.getElementById('searchResults').innerHTML = '';
            }
        });
    }
    loadFeaturedArticles();
});

// PERFORM SEARCH
async function performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

    try {
        // Check for secret code
        const secretData = parseSecretCode(query);
        if (secretData) {
            magicMode = secretData;
            targetLetters = secretData.targetLetters;
            currentLetterIndex = 0;
            navigationHistory = [];
            await loadArticleByTitle(secretData.startingArticle);
            return;
        }

        // Real Wikipedia search
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=15`
        );
        const data = await response.json();

        if (data.query && data.query.search.length > 0) {
            resultsContainer.innerHTML = '';
            for (const result of data.query.search) {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'search-result-item';
                resultDiv.onclick = () => loadArticleByTitle(result.title);

                const title = result.title.replace(/&quot;/g, '"');
                const snippet = result.snippet.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

                resultDiv.innerHTML = `
                    <div class="search-result-content">
                        <div class="search-result-title">${title}</div>
                        <div class="search-result-snippet">${snippet}</div>
                    </div>
                `;
                resultsContainer.appendChild(resultDiv);
            }
        } else {
            resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No results found</div>';
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = '<div class="error">Error searching</div>';
    }
}

// LOAD ARTICLE
async function loadArticleByTitle(title) {
    try {
        showPage('articlepage');
        document.getElementById('articleContent').innerHTML = '<div class="loading">Loading...</div>';

        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages&explaintext=false&format=json&origin=*`
        );
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];

        if (page.missing) {
            document.getElementById('articleContent').innerHTML = '<div class="error">Article not found</div>';
            return;
        }

        currentArticle = {
            title: page.title,
            extract: page.extract || '',
            thumbnail: page.thumbnail ? page.thumbnail.source : null
        };

        navigationHistory.push(currentArticle);
        displayArticle(page.title);
    } catch (error) {
        console.error('Error loading article:', error);
        document.getElementById('articleContent').innerHTML = '<div class="error">Error loading article</div>';
    }
}

// DISPLAY ARTICLE WITH MAGIC SYSTEM
function displayArticle(articleTitle) {
    const contentDiv = document.getElementById('articleContent');
    
    if (!currentArticle || currentArticle.title !== articleTitle) {
        contentDiv.innerHTML = '<div class="loading">Loading...</div>';
        return;
    }

    let htmlContent = `<h1 class="article-title">${currentArticle.title}</h1>`;

    if (currentArticle.thumbnail) {
        htmlContent += `<img src="${currentArticle.thumbnail}" class="article-image" alt="${currentArticle.title}">`;
    }

    if (currentArticle.extract) {
        let processedHtml = processArticleContent(currentArticle.extract, currentArticle.title);
        htmlContent += processedHtml;
    }

    contentDiv.innerHTML = htmlContent;
}

// PROCESS ARTICLE WITH MAGIC SYSTEM
function processArticleContent(html, articleTitle) {
    // Clean HTML
    let text = html.replace(/<[^>]*>/g, '');
    
    // Get target letter if in magic mode
    const targetLetter = magicMode && currentLetterIndex < targetLetters.length 
        ? targetLetters[currentLetterIndex] 
        : null;
    
    const position = magicMode ? magicMode.number : 0;

    // Get all words from text
    let words = text.match(/\b\w+\b/g) || [];
    let uniqueWords = [...new Set(words)];

    // Find words matching target letter at position
    let matchingWords = [];
    if (targetLetter && position > 0) {
        matchingWords = uniqueWords.filter(word => {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '');
            return cleanWord.length > position - 1 && 
                   cleanWord[position - 1].toUpperCase() === targetLetter;
        });
    }

    // Add extra related words if needed
    const relatedWords = relatedWordsDict[articleTitle.toLowerCase()] || relatedWordsDict['default'];
    if (matchingWords.length < 5) {
        for (let word of relatedWords) {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '');
            if (targetLetter && cleanWord.length > position - 1 && 
                cleanWord[position - 1].toUpperCase() === targetLetter &&
                !matchingWords.includes(word)) {
                matchingWords.push(word);
            }
        }
    }

    // Create blue links in text
    let processedText = text;
    if (matchingWords.length > 0) {
        matchingWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            processedText = processedText.replace(regex, 
                `<span class="article-link" onclick="selectBlueLink('${word}', event)">${word}</span>`);
        });
    }

    // Format paragraphs
    let paragraphs = processedText.split(/\n\n+/).filter(p => p.trim().length > 10);
    let output = '';
    
    for (let para of paragraphs.slice(0, 10)) {
        output += `<p class="article-text">${para.trim()}</p>`;
    }

    return output || '<p class="article-text">Article content loading...</p>';
}

// BLUE LINK SELECTION
function selectBlueLink(linkTitle, event) {
    event.stopPropagation();

    // Check if correct letter
    if (magicMode && currentLetterIndex < targetLetters.length) {
        const targetLetter = targetLetters[currentLetterIndex];
        const position = magicMode.number;
        const cleanWord = linkTitle.replace(/[^a-zA-Z]/g, '');

        if (cleanWord.length > position - 1 && cleanWord[position - 1].toUpperCase() === targetLetter) {
            currentLetterIndex++;
            
            if (currentLetterIndex === targetLetters.length) {
                console.log(`🎯 REVELATION COMPLETE: ${magicMode.revelationWord}`);
                magicMode = null;
            }
        }
    }

    // Load related article
    loadArticleByTitle(linkTitle);
}

// LOAD FEATURED ARTICLES
async function loadFeaturedArticles() {
    const featuredList = document.getElementById('featuredList');
    const featured = ['India', 'Moon', 'Science', 'History', 'Dog', 'Technology'];

    for (let article of featured.slice(0, 5)) {
        try {
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article)}&prop=extracts&explaintext=true&format=json&origin=*`
            );
            const data = await response.json();
            const page = Object.values(data.query.pages)[0];

            if (!page.missing) {
                const desc = page.extract ? page.extract.substring(0, 80) + '...' : 'Article';
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'featured-item';
                itemDiv.onclick = () => loadArticleByTitle(article);
                itemDiv.innerHTML = `
                    <div class="featured-item-title">${article}</div>
                    <div class="featured-item-desc">${desc}</div>
                `;
                featuredList.appendChild(itemDiv);
            }
        } catch (error) {
            console.error('Featured load error:', error);
        }
    }
}