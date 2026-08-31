/* =========================================================
   WIKIPEDIA MAGIC APP
   =========================================================

   SECRET FORMAT

   bbhuvan
   --------
   first letter = B = 2
   remaining text = BHUVAN

   These are identical:

   bbhuvan
   bBhuvan
   BBHUVAN
   BbHuVaN

   A/a = 1
   B/b = 2
   C/c = 3
   ...
   Z/z = 26

   ========================================================= */


/* =========================================================
   WIKIPEDIA API
   ========================================================= */

const WIKI_API =
    "https://en.wikipedia.org/w/api.php";


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {

    /* Current Wikipedia article */
    currentTitle: "",

    /* Magic mode */
    magicMode: false,

    /* Secret number */
    magicNumber: null,

    /* Secret revelation */
    revelation: "",

    /* Current revelation letter */
    magicStep: 0,

    /* Selected article titles */
    trail: [],

    /* Prevent duplicate requests */
    loading: false,

    /* Search timer */
    searchTimer: null

};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const searchForm =
    document.getElementById("searchForm");

const searchInput =
    document.getElementById("searchInput");

const searchSuggestions =
    document.getElementById("searchSuggestions");

const homeSearchForm =
    document.getElementById("homeSearchForm");

const homeSearchInput =
    document.getElementById("homeSearchInput");

const homeSuggestions =
    document.getElementById("homeSuggestions");

const homePage =
    document.getElementById("homePage");

const dynamicArticle =
    document.getElementById("dynamicArticle");

const articleTitle =
    document.getElementById("articleTitle");

const articleSubtitle =
    document.getElementById("articleSubtitle");

const articleBody =
    document.getElementById("articleBody");

const articleReferences =
    document.getElementById("articleReferences");

const searchNotice =
    document.getElementById("searchNotice");

const performanceTrail =
    document.getElementById("performanceTrail");

const trailItems =
    document.getElementById("trailItems");

const notification =
    document.getElementById("notification");

const sidebar =
    document.getElementById("sidebar");

const mobileOverlay =
    document.getElementById("mobileOverlay");

const menuButton =
    document.getElementById("menuButton");

const mobileSearchButton =
    document.getElementById(
        "mobileSearchButton"
    );


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(
            /[&<>"']/g,

            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character])

        );

}


/* =========================================================
   API REQUEST HELPER
   ========================================================= */

async function wikiRequest(parameters) {

    const params =
        new URLSearchParams({

            ...parameters,

            format: "json",

            formatversion: "2",

            origin: "*"

        });


    const response =
        await fetch(
            `${WIKI_API}?${params.toString()}`
        );


    if (!response.ok) {

        throw new Error(
            `Wikipedia API error: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (data.error) {

        throw new Error(
            data.error.info ||
            "Wikipedia API error"
        );

    }


    return data;

}


/* =========================================================
   SECRET PARSER
   ========================================================= */

function parseSecret(input) {

    const value =
        input.trim();


    /*
       Need at least:

       b + name
    */

    if (value.length < 2) {

        return null;

    }


    const first =
        value.charAt(0);


    /*
       First character must
       be A-Z.
    */

    if (!/^[a-z]$/i.test(first)) {

        return null;

    }


    /*
       A/a = 1
       B/b = 2
       ...
       Z/z = 26
    */

    const number =

        first
            .toLowerCase()
            .charCodeAt(0) - 96;


    /*
       Everything after the
       first character is the
       revelation.
    */

    const reveal =

        value
            .substring(1)
            .replace(
                /[^a-z]/gi,
                ""
            )
            .toUpperCase();


    if (!reveal) {

        return null;

    }


    return {

        number: number,

        reveal: reveal

    };

}


/* =========================================================
   SHOW NOTIFICATION
   ========================================================= */

let notificationTimer = null;


function showNotification(message) {

    notification.textContent =
        message;


    notification.classList.remove(
        "hidden"
    );


    clearTimeout(
        notificationTimer
    );


    notificationTimer =

        setTimeout(() => {

            notification.classList.add(
                "hidden"
            );

        }, 3000);

}


/* =========================================================
   LOADING MESSAGE
   ========================================================= */

function showLoading(message = "Loading...") {

    articleBody.innerHTML = `

        <div style="
            padding:40px 0;
            text-align:center;
            color:#54595d;
        ">

            ${escapeHtml(message)}

        </div>

    `;

}


/* =========================================================
   SEARCH SUGGESTIONS
   ========================================================= */

async function getSuggestions(
    query
) {

    if (!query || query.length < 1) {

        return [];

    }


    const data =
        await wikiRequest({

            action: "opensearch",

            search: query,

            namespace: "0",

            limit: "8"

        });


    /*
       OpenSearch returns:

       [
          searched text,
          titles,
          descriptions,
          urls
       ]
    */

    const titles =
        data[1] || [];

    const descriptions =
        data[2] || [];

    const urls =
        data[3] || [];


    return titles.map(
        (title, index) => ({

            title: title,

            description:
                descriptions[index] || "",

            url:
                urls[index] || ""

        })
    );

}


/* =========================================================
   RENDER SEARCH SUGGESTIONS
   ========================================================= */

function renderSuggestions(
    container,
    suggestions
) {

    container.innerHTML = "";


    if (
        !suggestions ||
        suggestions.length === 0
    ) {

        container.classList.remove(
            "show"
        );

        return;

    }


    suggestions.forEach(
        suggestion => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "suggestion-item";


            button.innerHTML = `

                <span class="suggestion-icon">
                    🔍
                </span>

                <span>

                    <span class="suggestion-title">
                        ${escapeHtml(
                            suggestion.title
                        )}
                    </span>

                    ${
                        suggestion.description

                            ?

                        `<span class="suggestion-description">
                            ${escapeHtml(
                                suggestion.description
                            )}
                        </span>`

                            :

                        ""

                    }

                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    container.classList.remove(
                        "show"
                    );


                    if (
                        container ===
                        homeSuggestions
                    ) {

                        homeSearchInput.value =
                            suggestion.title;

                    } else {

                        searchInput.value =
                            suggestion.title;

                    }


                    loadNormalArticle(
                        suggestion.title
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    container.classList.add(
        "show"
    );

}


/* =========================================================
   LIVE SEARCH
   ========================================================= */

function attachLiveSearch(
    input,
    container
) {

    input.addEventListener(
        "input",
        () => {

            clearTimeout(
                state.searchTimer
            );


            const query =
                input.value.trim();


            if (!query) {

                container.classList.remove(
                    "show"
                );

                return;

            }


            state.searchTimer =

                setTimeout(
                    async () => {

                        try {

                            const results =
                                await getSuggestions(
                                    query
                                );


                            renderSuggestions(
                                container,
                                results
                            );

                        }

                        catch (error) {

                            console.error(
                                error
                            );

                            container.classList.remove(
                                "show"
                            );

                        }

                    },

                    250

                );

        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                container.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   GET RANDOM WIKIPEDIA ARTICLE
   ========================================================= */

async function getRandomArticle() {

    const data =
        await wikiRequest({

            action: "query",

            list: "random",

            rnnamespace: "0",

            rnlimit: "1"

        });


    const pages =
        data.query?.random || [];


    if (!pages.length) {

        throw new Error(
            "Could not find random article."
        );

    }


    return pages[0].title;

}


/* =========================================================
   GET ARTICLE HTML
   ========================================================= */

async function getArticleHtml(
    title
) {

    const data =
        await wikiRequest({

            action: "parse",

            page: title,

            prop:
                "text|displaytitle|subtitle",

            redirects: "1"

        });


    if (!data.parse) {

        throw new Error(
            "Article not found."
        );

    }


    return {

        title:
            data.parse.title ||
            title,

        displayTitle:
            data.parse.displaytitle ||
            data.parse.title ||
            title,

        subtitle:
            data.parse.subtitle ||
            "",

        html:
            data.parse.text || ""

    };

}


/* =========================================================
   GET ARTICLE LINKS
   ========================================================= */

async function getArticleLinks(
    title
) {

    const data =
        await wikiRequest({

            action: "query",

            prop: "links",

            titles: title,

            plnamespace: "0",

            pllimit: "500",

            redirects: "1"

        });


    const pages =
        data.query?.pages || [];


    if (!pages.length) {

        return [];

    }


    const links =
        pages[0].links || [];


    return links
        .map(
            item => item.title
        )
        .filter(Boolean);

}


/* =========================================================
   SEARCH REAL WIKIPEDIA ARTICLES
   ========================================================= */

async function searchArticles(
    query,
    limit = 30
) {

    const data =
        await wikiRequest({

            action: "query",

            list: "search",

            srsearch: query,

            srnamespace: "0",

            srlimit: String(limit),

            srwhat: "title"

        });


    return (
        data.query?.search || []
    ).map(
        item => item.title
    );

}


/* =========================================================
   LETTER POSITION CHECK
   ========================================================= */

function titleLetterAtPosition(
    title,
    position
) {

    /*
       Ignore spaces and punctuation.

       Example:

       "New Delhi"

       position 2

       = E
    */

    const clean =
        title
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-z]/gi,
                ""
            );


    if (
        position < 1 ||
        position > clean.length
    ) {

        return "";

    }


    return clean
        .charAt(position - 1)
        .toUpperCase();

}


/* =========================================================
   CHECK MAGIC TITLE
   ========================================================= */

function titleMatchesMagic(
    title
) {

    if (!state.magicMode) {

        return true;

    }


    const wanted =
        state.revelation.charAt(
            state.magicStep
        );


    return (

        titleLetterAtPosition(
            title,
            state.magicNumber
        )

        ===

        wanted

    );

}


/* =========================================================
   GET MAGIC-COMPATIBLE REAL ARTICLES
   ========================================================= */

async function getMagicCandidates(
    currentTitle
) {

    const position =
        state.magicNumber;


    const wanted =
        state.revelation.charAt(
            state.magicStep
        );


    /*
       First source:
       actual links from the
       current Wikipedia article.
    */

    let candidates =
        await getArticleLinks(
            currentTitle
        );


    /*
       Remove duplicates and
       current article.
    */

    candidates =
        [...new Set(candidates)]
            .filter(
                title =>
                    title !== currentTitle
            );


    /*
       Keep only real links whose
       required letter matches.
    */

    let matching =
        candidates.filter(
            title =>

                titleLetterAtPosition(
                    title,
                    position
                ) === wanted
        );


    /*
       If we don't have enough,
       search Wikipedia using the
       current article title.

       This still gives real
       Wikipedia pages.
    */

    if (matching.length < 12) {

        try {

            const related =
                await searchArticles(
                    currentTitle,
                    50
                );


            const relatedMatching =
                related.filter(
                    title =>

                        titleLetterAtPosition(
                            title,
                            position
                        ) === wanted

                );


            matching = [
                ...matching,
                ...relatedMatching
            ];

        }

        catch (error) {

            console.warn(
                "Related search failed:",
                error
            );

        }

    }


    /*
       If still short, search for
       a broad set of real pages
       containing the desired
       character.

       This is only a fallback.
    */

    if (matching.length < 8) {

        try {

            const broad =
                await searchArticles(
                    wanted,
                    50
                );


            const broadMatching =
                broad.filter(
                    title =>

                        titleLetterAtPosition(
                            title,
                            position
                        ) === wanted

                );


            matching = [
                ...matching,
                ...broadMatching
            ];

        }

        catch (error) {

            console.warn(
                "Broad search failed:",
                error
            );

        }

    }


    /*
       Final cleanup.
    */

    matching =
        [...new Set(matching)]
            .filter(
                title =>
                    title !== currentTitle
            );


    /*
       Randomize order so the
       choices don't always look
       identical.
    */

    matching.sort(
        () => Math.random() - 0.5
    );


    /*
       Return up to 18 real
       Wikipedia titles.
    */

    return matching.slice(
        0,
        18
    );

}


/* =========================================================
   SANITIZE WIKIPEDIA HTML
   ========================================================= */

function sanitizeWikipediaHtml(
    html
) {

    const parser =
        new DOMParser();


    const documentFragment =
        parser.parseFromString(
            `<div>${html}</div>`,
            "text/html"
        );


    const root =
        documentFragment.body
            .firstElementChild;


    if (!root) {

        return "";

    }


    /*
       Remove dangerous or unnecessary
       elements.
    */

    root.querySelectorAll(
        "script,style,iframe,object,embed,form,input,button"
    ).forEach(
        element =>
            element.remove()
    );


    /*
       Remove event-handler attributes.
    */

    root.querySelectorAll("*")
        .forEach(
            element => {

                [...element.attributes]
                    .forEach(
                        attribute => {

                            if (
                                attribute.name
                                    .toLowerCase()
                                    .startsWith(
                                        "on"
                                    )
                            ) {

                                element.removeAttribute(
                                    attribute.name
                                );

                            }

                        }
                    );

            }
        );


    return root.innerHTML;

}


/* =========================================================
   CONVERT WIKIPEDIA LINKS
   ========================================================= */

function prepareArticleLinks(
    container
) {

    const links =
        container.querySelectorAll(
            "a"
        );


    links.forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {

                return;

            }


            /*
               Internal Wikipedia link.
            */

            if (
                href.startsWith(
                    "/wiki/"
                )
            ) {

                const rawTitle =
                    href.substring(
                        "/wiki/".length
                    );


                const decodedTitle =
                    decodeURIComponent(
                        rawTitle
                    ).replace(
                        /_/g,
                        " "
                    );


                /*
                   Ignore special namespaces.
                */

                if (
                    decodedTitle.includes(
                        ":"
                    )
                ) {

                    link.removeAttribute(
                        "href"
                    );

                    link.dataset.external =
                        "true";

                    return;

                }


                link.dataset.wikiTitle =
                    decodedTitle;


                link.removeAttribute(
                    "href"
                );


                link.style.cursor =
                    "pointer";

            }

            else {

                /*
                   External links remain
                   ordinary links.
                */

                link.target =
                    "_blank";

                link.rel =
                    "noopener noreferrer";

            }

        }
    );

}


/* =========================================================
   ARTICLE IMAGE FIX
   ========================================================= */

function prepareImages(
    container
) {

    container
        .querySelectorAll(
            "img"
        )
        .forEach(
            image => {

                let source =
                    image.getAttribute(
                        "src"
                    );


                if (
                    source &&
                    source.startsWith(
                        "//"
                    )
                ) {

                    source =
                        "https:" +
                        source;

                    image.setAttribute(
                        "src",
                        source
                    );

                }


                image.loading =
                    "lazy";


                image.referrerPolicy =
                    "no-referrer";


                image.removeAttribute(
                    "srcset"
                );


                image.removeAttribute(
                    "sizes"
                );

            }
        );

}


/* =========================================================
   ARTICLE LINK CLICK HANDLER
   ========================================================= */

function attachArticleLinkHandlers() {

    articleBody
        .querySelectorAll(
            "a[data-wiki-title]"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    async event => {

                        event.preventDefault();


                        const title =
                            link.dataset.wikiTitle;


                        if (!title) {

                            return;

                        }


                        /*
                           NORMAL MODE

                           Any Wikipedia link
                           can be followed.
                        */

                        if (
                            !state.magicMode
                        ) {

                            await loadNormalArticle(
                                title
                            );

                            return;

                        }


                        /*
                           MAGIC MODE

                           We only use real article
                           titles that satisfy the
                           current letter condition.

                           If an ordinary article-body
                           link doesn't satisfy it,
                           don't silently change its
                           title.
                        */

                        if (
                            !titleMatchesMagic(
                                title
                            )
                        ) {

                            showNotification(
                                "Choose one of the highlighted related blue links for this performance."
                            );

                            return;

                        }


                        await continueMagic(
                            title
                        );

                    }
                );

            }
        );

}


/* =========================================================
   RENDER MAGIC CHOICES
   ========================================================= */

function renderMagicChoices(
    candidates
) {

    /*
       Remove old magic section.
    */

    const old =
        articleBody.querySelector(
            "#magicChoices"
        );


    if (old) {

        old.remove();

    }


    if (
        !candidates ||
        candidates.length === 0
    ) {

        return;

    }


    const section =
        document.createElement(
            "section"
        );


    section.id =
        "magicChoices";


    section.className =
        "article-link-section";


    const heading =
        document.createElement(
            "h2"
        );


    heading.textContent =
        "Related topics";


    section.appendChild(
        heading
    );


    const paragraph =
        document.createElement(
            "p"
        );


    paragraph.textContent =
        "Related articles:";


    section.appendChild(
        paragraph
    );


    const linksBox =
        document.createElement(
            "div"
        );


    linksBox.className =
        "article-links";


    /*
       Put many real Wikipedia
       titles into the list.
    */

    candidates.forEach(
        title => {

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                "#";


            link.className =
                "article-link";


            link.dataset.magicTitle =
                title;


            link.textContent =
                title;


            link.addEventListener(
                "click",
                async event => {

                    event.preventDefault();


                    await continueMagic(
                        title
                    );

                }
            );


            linksBox.appendChild(
                link
            );


            linksBox.appendChild(
                document.createTextNode(
                    " · "
                )
            );

        }
    );


    section.appendChild(
        linksBox
    );


    articleBody.appendChild(
        section
    );

}


/* =========================================================
   RENDER ARTICLE
   ========================================================= */

async function renderArticle(
    title,
    options = {}
) {

    const {
        addMagicChoices = false
    } = options;


    state.loading = true;


    showLoading(
        "Loading Wikipedia article..."
    );


    try {

        const article =
            await getArticleHtml(
                title
            );


        state.currentTitle =
            article.title;


        articleTitle.innerHTML =
            article.displayTitle;


        articleSubtitle.textContent =
            article.subtitle || "";


        /*
           Insert real parsed
           Wikipedia article HTML.
        */

        articleBody.innerHTML =
            sanitizeWikipediaHtml(
                article.html
            );


        /*
           Fix images and links.
        */

        prepareImages(
            articleBody
        );


        prepareArticleLinks(
            articleBody
        );


        /*
           Add magic candidate links
           after the real article.
        */

        if (addMagicChoices) {

            try {

                const candidates =
                    await getMagicCandidates(
                        article.title
                    );


                renderMagicChoices(
                    candidates
                );

            }

            catch (error) {

                console.error(
                    error
                );

            }

        }


        attachArticleLinkHandlers();


        /*
           Show article.
        */

        homePage.classList.add(
            "hidden"
        );


        dynamicArticle.classList.remove(
            "hidden"
        );


        /*
           Scroll to top.
        */

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


        state.loading = false;


        return article;

    }

    catch (error) {

        console.error(
            error
        );


        articleTitle.textContent =
            "Unable to load article";


        articleSubtitle.textContent =
            "";


        articleBody.innerHTML = `

            <div style="
                padding:20px 0;
                color:#b32424;
            ">

                <p>
                    Wikipedia could not be loaded
                    right now.
                </p>

                <p>
                    Please check your internet
                    connection and try again.
                </p>

            </div>

        `;


        state.loading = false;

        return null;

    }

}


/* =========================================================
   NORMAL ARTICLE
   ========================================================= */

async function loadNormalArticle(
    title
) {

    state.magicMode =
        false;

    state.magicNumber =
        null;

    state.revelation =
        "";

    state.magicStep =
        0;

    state.trail =
        [];


    performanceTrail.classList.add(
        "hidden"
    );


    searchNotice.classList.add(
        "hidden"
    );


    await renderArticle(
        title
    );

}


/* =========================================================
   START MAGIC
   ========================================================= */

async function startMagic(
    secret
) {

    state.magicMode =
        true;


    state.magicNumber =
        secret.number;


    state.revelation =
        secret.reveal;


    state.magicStep =
        0;


    state.trail =
        [];


    updateTrail();


    performanceTrail.classList.remove(
        "hidden"
    );


    searchNotice.classList.remove(
        "hidden"
    );


    searchNotice.textContent =

        "Search results";


    showLoading(
        "Opening article..."
    );


    try {

        /*
           The secret is NOT sent to
           Wikipedia.

           We first open a completely
           ordinary random Wikipedia
           article.
        */

        const randomTitle =
            await getRandomArticle();


        await renderArticle(
            randomTitle,
            {
                addMagicChoices: true
            }
        );


        showNotification(
            "Performance article ready."
        );

    }

    catch (error) {

        console.error(
            error
        );


        showNotification(
            "Could not start the performance."
        );

    }

}


/* =========================================================
   CONTINUE MAGIC
   ========================================================= */

async function continueMagic(
    selectedTitle
) {

    if (!state.magicMode) {

        await loadNormalArticle(
            selectedTitle
        );

        return;

    }


    /*
       Safety check:
       selected title must really
       satisfy the secret.
    */

    if (
        !titleMatchesMagic(
            selectedTitle
        )
    ) {

        showNotification(
            "Choose another related blue link."
        );

        return;

    }


    /*
       Record the title.

       This is the word the performer
       writes on paper.
    */

    state.trail.push(
        selectedTitle
    );


    updateTrail();


    /*
       Move to next revelation letter.
    */

    state.magicStep++;


    /*
       Load the selected REAL
       Wikipedia article.

       The article itself is genuine
       Wikipedia data.
    */

    await renderArticle(
        selectedTitle,
        {
            addMagicChoices:
                state.magicStep <
                state.revelation.length
        }
    );


    /*
       If the performer has enough
       letters, they can stop whenever
       they want.

       The app itself does NOT force
       an ending.
    */

    if (
        state.magicStep >=
        state.revelation.length
    ) {

        searchNotice.classList.remove(
            "hidden"
        );


        searchNotice.textContent =

            "Performance sequence ready to reveal.";


        showNotification(
            "Required revelation length reached."
        );

    }

}


/* =========================================================
   TRAIL
   ========================================================= */

function updateTrail() {

    trailItems.innerHTML = "";


    if (
        state.trail.length === 0
    ) {

        trailItems.innerHTML = `

            <span class="trail-item">
                No selections yet
            </span>

        `;

        return;

    }


    state.trail.forEach(
        (title, index) => {

            const item =
                document.createElement(
                    "span"
                );


            item.className =
                "trail-item";


            item.textContent =
                `${index + 1}. ${title}`;


            trailItems.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SEARCH FORM
   ========================================================= */

async function handleSearch(
    input
) {

    const value =
        input.value.trim();


    if (!value) {

        return;

    }


    /*
       FIRST:

       Check secret format.

       Example:

       bbhuvan

       b = 2
       bhuvan = revelation
    */

    const secret =
        parseSecret(
            value
        );


    if (secret) {

        await startMagic(
            secret
        );

        return;

    }


    /*
       Otherwise this is an ordinary
       Wikipedia search.
    */

    try {

        const results =
            await getSuggestions(
                value
            );


        if (
            results.length > 0
        ) {

            await loadNormalArticle(
                results[0].title
            );

        }

        else {

            await loadNormalArticle(
                value
            );

        }

    }

    catch (error) {

        console.error(
            error
        );


        await loadNormalArticle(
            value
        );

    }

}


/* =========================================================
   HEADER SEARCH
   ========================================================= */

searchForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        searchSuggestions.classList.remove(
            "show"
        );


        await handleSearch(
            searchInput
        );

    }
);


/* =========================================================
   HOME SEARCH
   ========================================================= */

homeSearchForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        homeSuggestions.classList.remove(
            "show"
        );


        await handleSearch(
            homeSearchInput
        );

    }
);


/* =========================================================
   LIVE SEARCH
   ========================================================= */

attachLiveSearch(
    searchInput,
    searchSuggestions
);


attachLiveSearch(
    homeSearchInput,
    homeSuggestions
);


/* =========================================================
   CLOSE SUGGESTIONS WHEN CLICKING
   OUTSIDE SEARCH
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".header-search"
            ) &&
            !event.target.closest(
                ".home-search"
            )
        ) {

            searchSuggestions.classList.remove(
                "show"
            );


            homeSuggestions.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   LOGO / HOME
   ========================================================= */

document
    .getElementById("logoLink")
    .addEventListener(
        "click",
        event => {

            event.preventDefault();


            state.magicMode =
                false;


            state.trail =
                [];


            performanceTrail.classList.add(
                "hidden"
            );


            searchNotice.classList.add(
                "hidden"
            );


            dynamicArticle.classList.add(
                "hidden"
            );


            homePage.classList.remove(
                "hidden"
            );


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );


/* =========================================================
   MAIN PAGE BUTTON
   ========================================================= */

document
    .getElementById("mainPageLink")
    .addEventListener(
        "click",
        event => {

            event.preventDefault();


            document
                .getElementById("logoLink")
                .click();

        }
    );


/* =========================================================
   RANDOM ARTICLE BUTTON
   ========================================================= */

document
    .getElementById("randomArticleLink")
    .addEventListener(
        "click",
        async event => {

            event.preventDefault();


            state.magicMode =
                false;


            performanceTrail.classList.add(
                "hidden"
            );


            searchNotice.classList.add(
                "hidden"
            );


            try {

                const title =
                    await getRandomArticle();


                await loadNormalArticle(
                    title
                );

            }

            catch (error) {

                showNotification(
                    "Random article unavailable."
                );

            }

        }
    );


/* =========================================================
   CLEAR TRAIL
   ========================================================= */

document
    .getElementById("clearTrailButton")
    .addEventListener(
        "click",
        () => {

            state.trail =
                [];


            updateTrail();

        }
    );


/* =========================================================
   MOBILE MENU
   ========================================================= */

menuButton.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );


        mobileOverlay.classList.toggle(
            "hidden"
        );

    }
);


mobileOverlay.addEventListener(
    "click",
    () => {

        sidebar.classList.remove(
            "open"
        );


        mobileOverlay.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   MOBILE SEARCH BUTTON
   ========================================================= */

mobileSearchButton.addEventListener(
    "click",
    () => {

        searchInput.focus();

    }
);


/* =========================================================
   ARTICLE TABS
   ========================================================= */

document
    .getElementById("readTab")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("readTab")
                .classList
                .add("active");

        }
    );


document
    .getElementById("articleTab")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("articleTab")
                .classList
                .add("active");

        }
    );


/* =========================================================
   UNUSED DEMO BUTTONS
   ========================================================= */

document
    .getElementById("discussionTab")
    .addEventListener(
        "click",
        () => {

            showNotification(
                "Discussion view is not enabled in this version."
            );

        }
    );


document
    .getElementById("editTab")
    .addEventListener(
        "click",
        () => {

            showNotification(
                "Editing is disabled in this performance app."
            );

        }
    );


document
    .getElementById("historyTab")
    .addEventListener(
        "click",
        () => {

            showNotification(
                "History view is not enabled in this version."
            );

        }
    );


document
    .getElementById("languageButton")
    .addEventListener(
        "click",
        () => {

            showNotification(
                "English Wikipedia is active."
            );

        }
    );


document
    .getElementById("languageArticleButton")
    .addEventListener(
        "click",
        () => {

            showNotification(
                "English Wikipedia is active."
            );

        }
    );


document
    .getElementById("loginButton")
    .addEventListener(
        "click",
        () => {

            showNotification(
                "Login is not required for this app."
            );

        }
    );


document
    .getElementById("moreButton")
    .addEventListener(
        "click",
        () => {

            showNotification(
                "Wikipedia-style performance interface."
            );

        }
    );


/* =========================================================
   OTHER SIDEBAR LINKS
   ========================================================= */

document
    .querySelectorAll(
        ".wiki-sidebar .sidebar-link"
    )
    .forEach(
        link => {

            if (
                link.id ===
                "mainPageLink" ||
                link.id ===
                "randomArticleLink"
            ) {

                return;

            }


            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    showNotification(
                        "This section is not enabled."
                    );

                }
            );

        }
    );


/* =========================================================
   STARTUP
   ========================================================= */

updateTrail();


/*
   Nothing is loaded from Wikipedia
   until the user searches or chooses
   an article.

   This keeps the first page fast.
*/

console.log(
    "Wikipedia Magic App ready."
);
