// MAGIC SYSTEM VARIABLES
let performerMode = null;
let targetRevealWord = null;
let startingArticle = null;
let targetLetterIndex = 0;
let targetLetters = [];
let navigationHistory = [];
let currentArticle = null;

// PAGE NAVIGATION
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function goBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop();
        const prevArticle = navigationHistory[navigationHistory.length - 1];
        if (prevArticle) {
            displayArticle(prevArticle);
        } else {
            showPage('homepage');
            navigationHistory = [];
        }
    } else {
        showPage('homepage');
        navigationHistory = [];
    }
}

function openSearch() {
    showPage('searchpage');
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 100);
}

// MAGIC SYSTEM - PARSE SECRET CODE
function parseSecretCode(code) {
    // Format: [letter-number][revelation-word],[article-name]
    // Example: bbhuvan,india
    
    if (!code || !code.includes(',')) {
        return null;
    }

    const parts = code.split(',');
    const secretPart = parts[0];
    const articlePart = parts.slice(1).join(',');

    if (secretPart.length < 2) {
        return null;
    }

    const firstChar = secretPart[0].toLowerCase();
    const letterMap = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };

    if (!letterMap[firstChar]) {
        return null;
    }

    const number = letterMap[firstChar];
    const revelationWord = secretPart.slice(1).toUpperCase();

    return {
        number: number,
        revelationWord: revelationWord,
        startingArticle: articlePart.toLowerCase().trim(),
        targetLetters: revelationWord.split(''),
        letterIndex: -1
    };
}

// SEARCH FROM HOMEPAGE
function searchFromHome() {
    const query = document.getElementById('homeSearchInput').value.trim();
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

    // Load featured articles on homepage
    loadFeaturedArticles();
});

// SEARCH FUNCTION
async function performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

    try {
        // Check if this is a secret code
        const secretData = parseSecretCode(query);
        if (secretData) {
            performerMode = secretData;
            targetRevealWord = secretData.revelationWord;
            startingArticle = secretData.startingArticle;
            targetLetters = secretData.targetLetters;
            targetLetterIndex = 0;
            navigationHistory = [];

            // Load starting article silently
            await loadArticleByTitle(startingArticle);
            return;
        }

        // Normal Wikipedia search
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=10`
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
        resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Error fetching results</div>';
    }
}

// LOAD ARTICLE BY TITLE
async function loadArticleByTitle(title) {
    try {
        showPage('articlepage');
        document.getElementById('articleContent').innerHTML = '<div class="loading">Loading article...</div>';

        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages|pageprops&explaintext=false&format=json&origin=*&piprop=thumbnail&pithumbsize=300`
        );
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];

        if (page.missing) {
            document.getElementById('articleContent').innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Article not found</div>';
            return;
        }

        currentArticle = {
            title: page.title,
            extract: page.extract || '',
            thumbnail: page.thumbnail ? page.thumbnail.source : null
        };

        navigationHistory.push(page.title);
        displayArticle(page.title);
    } catch (error) {
        console.error('Error loading article:', error);
        document.getElementById('articleContent').innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Error loading article</div>';
    }
}

// DISPLAY ARTICLE WITH MAGIC SYSTEM
function displayArticle(articleTitle) {
    const contentDiv = document.getElementById('articleContent');
    
    if (!currentArticle || currentArticle.title !== articleTitle) {
        contentDiv.innerHTML = '<div class="loading">Loading...</div>';
        return;
    }

    let htmlContent = `<div class="article-title">${currentArticle.title}</div>`;

    if (currentArticle.thumbnail) {
        htmlContent += `<img src="${currentArticle.thumbnail}" class="article-image" alt="${currentArticle.title}">`;
    }

    if (currentArticle.extract) {
        // Create smart blue links based on magic system
        let processedHtml = processArticleContent(currentArticle.extract, currentArticle.title);
        htmlContent += processedHtml;
    }

    contentDiv.innerHTML = htmlContent;
}

// PROCESS ARTICLE CONTENT - ADD BLUE LINKS WITH MAGIC SYSTEM
function processArticleContent(html, currentArticle) {
    let sections = html.split(/<h2>|<h3>/);
    let output = '';

    for (let section of sections) {
        // Clean up HTML
        section = section.replace(/<[^>]*>/g, '');
        
        if (!section.trim()) continue;

        // Split into paragraphs
        let paragraphs = section.split(/\n\n+/).filter(p => p.trim().length > 0);

        for (let para of paragraphs) {
            // Get or generate related articles for blue links
            let blueLinks = getContextualArticles(currentArticle);

            // If in magic mode, filter links based on target letter
            if (performerMode && targetLetterIndex < targetLetters.length) {
                const targetLetter = targetLetters[targetLetterIndex];
                const targetPosition = performerMode.number - 1; // 0-indexed

                // Filter articles where the target position letter matches
                blueLinks = blueLinks.filter(article => {
                    const checkWord = article.replace(/[^a-zA-Z]/g, '');
                    return checkWord.length > targetPosition && 
                           checkWord[targetPosition].toUpperCase() === targetLetter;
                });

                // If no matches, get all related articles (fallback)
                if (blueLinks.length === 0) {
                    blueLinks = getContextualArticles(currentArticle).slice(0, 5);
                }
            }

            // Convert to clickable links
            let linkifiedPara = para;
            let uniqueLinks = [...new Set(blueLinks)];

            for (let link of uniqueLinks.slice(0, 8)) {
                // Create regex pattern to find word in text
                const regex = new RegExp(`\\b${link}\\b`, 'gi');
                linkifiedPara = linkifiedPara.replace(regex, 
                    `<span class="article-link" onclick="selectBlueLink('${link}', event)">${link}</span>`);
            }

            if (linkifiedPara.trim()) {
                output += `<p class="article-text">${linkifiedPara}</p>`;
            }
        }
    }

    return output || '<p class="article-text">Article content loading...</p>';
}

// GET CONTEXTUAL ARTICLES FOR BLUE LINKS
function getContextualArticles(article) {
    const contextualLinks = {
        'india': ['Asia', 'Hinduism', 'Bollywood', 'Delhi', 'History', 'Government', 'Culture', 'Cricket', 'Taj Mahal', 'Sanskrit', 'Buddhism', 'Mythology'],
        'dog': ['Animal', 'Mammal', 'Domestic', 'Breed', 'Pet', 'Canine', 'Species', 'Evolution', 'Biology', 'Behavior', 'Hunting', 'Pack'],
        'rabbit': ['Animal', 'Mammal', 'Herbivore', 'Burrow', 'Species', 'Ears', 'Hopping', 'Predator', 'Fur', 'Reproduction', 'European', 'Wildlife'],
        'moon': ['Earth', 'Planet', 'Gravity', 'Orbit', 'Satellite', 'Crater', 'Light', 'Astronomy', 'Space', 'NASA', 'Tide', 'Solar System'],
        'history': ['Past', 'Culture', 'Civilization', 'Era', 'Ancient', 'Medieval', 'Modern', 'War', 'Revolution', 'Timeline', 'Records', 'Events'],
        'science': ['Biology', 'Chemistry', 'Physics', 'Research', 'Experiment', 'Nature', 'Technology', 'Discovery', 'Method', 'Theory', 'Knowledge', 'Education'],
        'magic': ['Illusion', 'Trick', 'Performance', 'Stage', 'Magician', 'History', 'Misdirection', 'Entertainment', 'Card', 'Mystery', 'Secret', 'Art'],
        'asia': ['Continent', 'Country', 'China', 'Japan', 'India', 'Geography', 'Culture', 'Population', 'History', 'Economy', 'Religion', 'Trade'],
        'nature': ['Animal', 'Plant', 'Environment', 'Ecosystem', 'Forest', 'Wildlife', 'Biodiversity', 'Conservation', 'Species', 'Habitat', 'Climate', 'Biology'],
    };

    let articleLower = article.toLowerCase();
    
    // Direct contextual link
    if (contextualLinks[articleLower]) {
        return contextualLinks[articleLower];
    }

    // Generic related articles
    return ['Article', 'History', 'Culture', 'Society', 'Science', 'Nature', 'Technology', 'Information', 'Knowledge', 'Research', 'Study', 'Topic'];
}

// BLUE LINK SELECTION - MAGIC SYSTEM
function selectBlueLink(linkTitle, event) {
    event.stopPropagation();

    // Record the selection for magic system
    if (performerMode && targetLetterIndex < targetLetters.length) {
        const targetLetter = targetLetters[targetLetterIndex];
        const targetPosition = performerMode.number - 1;
        const checkWord = linkTitle.replace(/[^a-zA-Z]/g, '');

        if (checkWord.length > targetPosition && checkWord[targetPosition].toUpperCase() === targetLetter) {
            console.log(`✓ Correct: ${linkTitle} → Letter ${checkWord[targetPosition]} (Target: ${targetLetter})`);
            targetLetterIndex++;

            if (targetLetterIndex === targetLetters.length) {
                // Revelation complete!
                console.log(`🎯 REVELATION COMPLETE: ${targetRevealWord}`);
                performerMode = null; // Stop magic mode
            }
        }
    }

    // Load the linked article
    loadArticleByTitle(linkTitle);
}

// LOAD FEATURED ARTICLES FOR HOMEPAGE
async function loadFeaturedArticles() {
    const featuredList = document.getElementById('featuredList');
    const featured = ['India', 'Moon', 'History', 'Science', 'Magic', 'Dog', 'Asia', 'Nature'];

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
            console.error('Error loading featured:', error);
        }
    }
}