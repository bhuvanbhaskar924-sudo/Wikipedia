/*
==================================================
 OPENPEDIA MAGIC APP
==================================================

SECRET INPUT:

    bbhuvan

Meaning:

    First character = number
    b/B = 2

    Everything after first character
    = revelation

Examples:

    araman
    a = 1
    RAHMAN = revelation

    bbhuvan
    b = 2
    BHUVAN = revelation

    cAmit
    c = 3
    AMIT = revelation

CAPITAL / SMALL LETTER DOES NOT MATTER.

==================================================
*/


/* =================================================
   GLOBAL STATE
================================================= */

const state = {

    number: null,

    reveal: "",

    step: 0,

    trail: [],

    active: false

};


/* =================================================
   ARTICLE DATABASE
================================================= */

const articles = {

    home: {

        title: "OpenPedia",

        subtitle:
            "The free encyclopedia",

        text: [

            "Welcome to OpenPedia, a fictional encyclopedia of everyday knowledge.",

            "Search for a subject or choose a related topic to continue browsing."

        ],

        links: [

            "Science",
            "History",
            "Music",
            "Geography",
            "Technology",
            "Architecture"

        ]

    },


    Science: {

        title: "Science",

        subtitle:
            "Study of the natural world",

        text: [

            "Science uses observation and evidence to understand the natural world.",

            "Its subjects include physics, chemistry, biology and astronomy."

        ],

        links: [

            "Astronomy",
            "Chemistry",
            "Biology",
            "Physics",
            "Geology",
            "Research"

        ]

    },


    History: {

        title: "History",

        subtitle:
            "Study of the past",

        text: [

            "History examines evidence about people, societies and events from the past.",

            "Historical topics are connected through places, people and ideas."

        ],

        links: [

            "Ancient",
            "Empire",
            "Library",
            "Medieval",
            "Museum",
            "Archive"

        ]

    },


    Music: {

        title: "Music",

        subtitle:
            "Art organized through sound",

        text: [

            "Music can involve rhythm, melody, harmony and performance.",

            "Different musical traditions are connected through styles and instruments."

        ],

        links: [

            "Melody",
            "Rhythm",
            "Piano",
            "Orchestra",
            "Opera",
            "Harmony"

        ]

    },


    Geography: {

        title: "Geography",

        subtitle:
            "Study of places",

        text: [

            "Geography explores places, landscapes, populations and environments.",

            "Maps help describe relationships between different locations."

        ],

        links: [

            "River",
            "Mountain",
            "Ocean",
            "Map",
            "Climate",
            "City"

        ]

    },


    Technology: {

        title: "Technology",

        subtitle:
            "Tools and applied knowledge",

        text: [

            "Technology includes tools and methods created to solve practical problems.",

            "Computing, engineering and communication are important technological fields."

        ],

        links: [

            "Computer",
            "Internet",
            "Engineering",
            "Robot",
            "Software",
            "Network"

        ]

    },


    Architecture: {

        title: "Architecture",

        subtitle:
            "Design of buildings and spaces",

        text: [

            "Architecture combines structure, function, materials and design.",

            "Buildings can reflect the history and culture of their communities."

        ],

        links: [

            "Building",
            "Design",
            "Bridge",
            "Temple",
            "Modernism",
            "Structure"

        ]

    }

};


/* =================================================
   EXTRA WORDS
================================================= */

const fallbackTopics = [

    "Astronomy",
    "Biology",
    "Chemistry",
    "Computer",
    "Culture",
    "Design",
    "Energy",
    "Engineering",
    "Festival",
    "Forest",
    "Geology",
    "History",
    "Internet",
    "Language",
    "Library",
    "Literature",
    "Map",
    "Museum",
    "Network",
    "Ocean",
    "Physics",
    "Planet",
    "Robot",
    "Science",
    "Software",
    "Theatre",
    "Travel",
    "University",
    "Village",
    "Water",
    "World"

];


/* =================================================
   GET HTML ELEMENTS
================================================= */

const articleEl =
    document.getElementById("article");

const searchForm =
    document.getElementById("searchForm");

const searchInput =
    document.getElementById("searchInput");

const searchNotice =
    document.getElementById("searchNotice");

const trailBox =
    document.getElementById("trailBox");

const trailEl =
    document.getElementById("trail");

const statusEl =
    document.getElementById("status");


document.getElementById("footerYear")
    .textContent =
    new Date().getFullYear();


/* =================================================
   ESCAPE HTML
================================================= */

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


/* =================================================
   SECRET INPUT
=================================================

   bbhuvan

   First character:

   A = 1
   B = 2
   C = 3
   ...
   Z = 26

   Remaining:

   BHUVAN

================================================= */

function parseSecret(input) {

    const cleaned =
        input.trim();


    /*
       At least two characters
       are required.
    */

    if (cleaned.length < 2) {

        return null;

    }


    /*
       First character must
       be alphabet.
    */

    const first =
        cleaned.charAt(0);


    if (!/[a-z]/i.test(first)) {

        return null;

    }


    /*
       Convert A-Z to 1-26.

       IMPORTANT:

       toLowerCase() means

       b = B

       both become 2.
    */

    const number =
        first
            .toLowerCase()
            .charCodeAt(0) - 96;


    /*
       EVERYTHING after the
       first character becomes
       the revelation.
    */

    const reveal =
        cleaned
            .substring(1)
            .replace(/[^a-z]/gi, "")
            .toUpperCase();


    if (!reveal) {

        return null;

    }


    return {

        number: number,

        reveal: reveal

    };

}


/* =================================================
   FIND WORD WITH REQUIRED LETTER
=================================================

   Example:

   number = 2

   required letter = B

   We search for a word whose
   2nd letter is B.

================================================= */

function findNaturalWord(

    requiredLetter,

    position,

    usedWords = []

) {

    const allWords = [

        ...fallbackTopics,

        ...Object.values(articles)
            .flatMap(
                article => article.links
            )

    ];


    /*
       Remove duplicates.
    */

    const uniqueWords =
        [...new Set(allWords)];


    /*
       Don't use the same word twice
       in the same step.
    */

    const available =
        uniqueWords.filter(

            word =>
                !usedWords.includes(word)

        );


    /*
       Find words having the
       required letter at
       required position.
    */

    const matchingWords =
        available.filter(word => {

            const cleanWord =
                word.replace(
                    /[^a-z]/gi,
                    ""
                );


            if (
                cleanWord.length <
                position
            ) {

                return false;

            }


            return (

                cleanWord
                    .charAt(position - 1)
                    .toLowerCase()

                ===

                requiredLetter
                    .toLowerCase()

            );

        });


    /*
       Pick random matching word.
    */

    if (
        matchingWords.length > 0
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                matchingWords.length
            );


        return matchingWords[
            randomIndex
        ];

    }


    return null;

}


/* =================================================
   FALLBACK WORD GENERATOR
================================================= */

function createFallbackWord(

    requiredLetter,

    position

) {

    const alphabet =
        "abcdefghijklmnopqrstuvwxyz";


    let result = "";


    /*
       Create characters before
       the required position.
    */

    for (
        let i = 0;
        i < position - 1;
        i++
    ) {

        result +=

            alphabet[
                Math.floor(
                    Math.random() *
                    alphabet.length
                )
            ];

    }


    /*
       Required revelation
       character.
    */

    result += requiredLetter;


    /*
       Make it look like a topic.
    */

    result += "topic";


    return result;

}


/* =================================================
   BUILD MAGIC LINKS
================================================= */

function buildMagicLinks() {

    const position =
        state.number;


    /*
       Current revelation
       character.

       Example:

       BHUVAN

       Step 0 = B
       Step 1 = H
       Step 2 = U
       ...
    */

    const requiredLetter =
        state.reveal.charAt(
            state.step
        );


    const links = [];


    /*
       Create six choices.
    */

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        let word =

            findNaturalWord(

                requiredLetter,

                position,

                links

            );


        /*
           If no natural word
           exists, create fallback.
        */

        if (!word) {

            word =

                createFallbackWord(

                    requiredLetter,

                    position

                );

        }


        links.push(word);

    }


    return links;

}


/* =================================================
   RENDER ARTICLE
================================================= */

function renderArticle(
    key = "home"
) {

    let data =
        articles[key];


    /*
       If article doesn't exist,
       create generic article.
    */

    if (!data) {

        data = {

            title: key,

            subtitle:
                "OpenPedia article",

            text: [

                `${key} is a topic in the OpenPedia knowledge collection.`,

                "Related subjects are listed below."

            ],

            links:
                fallbackTopics.slice(0, 6)

        };

    }


    let links;


    /*
       During magic:

       use forced links.

       Normal browsing:

       use normal links.
    */

    if (state.active) {

        links =
            buildMagicLinks();

    } else {

        links =
            data.links;

    }


    articleEl.innerHTML = `

        <h1>
            ${escapeHtml(data.title)}
        </h1>


        <div class="subtitle">

            ${escapeHtml(data.subtitle)}

        </div>


        <div class="infobox">

            <div class="box-title">

                ${escapeHtml(data.title)}

            </div>


            <p>

                <strong>Type:</strong>
                Encyclopedia topic

            </p>


            <p>

                <strong>Language:</strong>
                English

            </p>


            <p>

                <strong>Status:</strong>
                Reference article

            </p>

        </div>


        ${data.text.map(

            paragraph =>

                `<p>
                    ${escapeHtml(paragraph)}
                </p>`

        ).join("")}


        <h2>
            Related topics
        </h2>


        <p>

            Choose a related topic
            to continue browsing:

        </p>


        <div class="link-grid">

            ${links.map(

                label => `

                    <a
                        href="#"
                        class="topic-card"
                        data-topic="${escapeHtml(label)}"
                    >

                        ${escapeHtml(label)}

                        <span class="small">

                            Related article

                        </span>

                    </a>

                `

            ).join("")}

        </div>

    `;


    /*
       Activate click handlers
       for all links.
    */

    document
        .querySelectorAll(
            ".topic-card"
        )
        .forEach(link => {

            link.addEventListener(
                "click",

                event => {

                    event.preventDefault();


                    chooseTopic(
                        link.dataset.topic
                    );

                }

            );

        });


    /*
       Update status.
    */

    if (state.active) {

        statusEl.textContent =

            `Browsing: ${
                state.step + 1
            }/${
                state.reveal.length
            }`;

    } else {

        statusEl.textContent =
            "Ready";

    }

}


/* =================================================
   CHOOSE TOPIC
================================================= */

function chooseTopic(label) {


    /*
       Save spectator's choice.
    */

    state.trail.push(label);


    updateTrail();


    /*
       Normal browsing.
    */

    if (!state.active) {

        renderArticle(label);

        return;

    }


    /*
       One magic step completed.
    */

    state.step++;


    /*
       Check if entire revelation
       has been completed.
    */

    if (

        state.step >=
        state.reveal.length

    ) {


        /*
           Stop secret mode.
        */

        state.active = false;


        searchNotice
            .classList
            .remove("hidden");


        searchNotice.textContent =
            "Browsing sequence complete.";


        statusEl.textContent =
            "Performance sequence complete";


        renderFinalArticle();


        return;

    }


    /*
       Continue magic.
    */

    renderArticle(
        "Performance article"
    );

}


/* =================================================
   FINAL ARTICLE
================================================= */

function renderFinalArticle() {

    articleEl.innerHTML = `

        <h1>
            Reference
        </h1>


        <div class="subtitle">

            OpenPedia article

        </div>


        <p>

            You have reached the end
            of this browsing path.

        </p>


        <p>

            Continue exploring OpenPedia
            or start another search.

        </p>

    `;

}


/* =================================================
   SHOW BROWSING TRAIL
================================================= */

function updateTrail() {

    trailBox
        .classList
        .remove("hidden");


    trailEl.innerHTML =

        state.trail.map(

            (word, index) => `

                <span class="trail-item">

                    ${index + 1}.
                    ${escapeHtml(word)}

                </span>

            `

        ).join("");

}


/* =================================================
   START MAGIC
================================================= */

function startSecretPerformance(
    secret
) {


    /*
       Save secret number.
    */

    state.number =
        secret.number;


    /*
       Save revelation.
    */

    state.reveal =
        secret.reveal;


    /*
       Start from first character.
    */

    state.step = 0;


    /*
       Clear old browsing.
    */

    state.trail = [];


    /*
       Activate magic.
    */

    state.active = true;


    searchNotice
        .classList
        .remove("hidden");


    searchNotice.textContent =
        "Search results";


    trailBox
        .classList
        .remove("hidden");


    updateTrail();


    statusEl.textContent =
        "Article loaded";


    /*
       Show apparently normal
       article.
    */

    renderArticle(
        "Performance article"
    );

}


/* =================================================
   NORMAL SEARCH
================================================= */

function normalSearch(query) {


    state.active = false;

    state.step = 0;

    state.trail = [];


    searchNotice
        .classList
        .remove("hidden");


    searchNotice.textContent =

        `Search results for “${query}”`;


    /*
       Check built-in article.
    */

    const exact =

        Object.keys(articles)
            .find(

                key =>

                    key.toLowerCase() ===
                    query.toLowerCase()

            );


    if (exact) {

        renderArticle(exact);

        return;

    }


    /*
       Generic article.
    */

    renderArticle(
        query || "OpenPedia"
    );

}


/* =================================================
   SEARCH FORM
================================================= */

searchForm.addEventListener(

    "submit",

    event => {

        event.preventDefault();


        const query =
            searchInput.value.trim();


        /*
           Check whether input
           is our secret format.
        */

        const secret =
            parseSecret(query);


        /*
           IMPORTANT:

           bbhuvan
           bBhuvan
           BBHUVAN
           BbHuVaN

           All work.

           First character = B = 2

           Remaining text = BHUVAN
        */

        if (secret) {

            startSecretPerformance(
                secret
            );

        } else {

            normalSearch(
                query
            );

        }

    }

);


/* =================================================
   HOME BUTTON
================================================= */

document
    .getElementById("homeBtn")
    .addEventListener(

        "click",

        () => {

            searchInput.value = "";

            state.active = false;

            state.step = 0;

            state.trail = [];


            searchNotice
                .classList
                .add("hidden");


            trailBox
                .classList
                .add("hidden");


            renderArticle(
                "home"
            );

        }

    );


/* =================================================
   RANDOM ARTICLE
================================================= */

document
    .getElementById("randomBtn")
    .addEventListener(

        "click",

        () => {

            const keys =

                Object.keys(articles)
                    .filter(
                        key =>
                            key !== "home"
                    );


            const randomKey =

                keys[
                    Math.floor(
                        Math.random() *
                        keys.length
                    )
                ];


            state.active = false

            state.step = 0;

            state.trail = [];


            searchNotice
                .classList
                .add("hidden");


            trailBox
                .classList
                .add("hidden");


            renderArticle(
                randomKey
            );

        }

    );


/* =================================================
   INITIAL PAGE
================================================= */

renderArticle("home");
