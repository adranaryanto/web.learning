/* ============================================================
   RESEARCH PAPER MANAGER
   PAPERS.JS
   FINAL VERSION 1
   ============================================================ */

(function () {

    "use strict";


    /* ========================================================
       CONFIGURATION
    ======================================================== */

    const STORAGE_KEYS = [
        "papers",
        "research_papers",
        "rpm_papers"
    ];


    const state = {

        papers: [],

        search: "",

        filter: "all",

        sort: "newest"

    };


    /* ========================================================
       STORAGE
    ======================================================== */

    function loadPapers() {

        for (const key of STORAGE_KEYS) {

            try {

                const raw =
                    localStorage.getItem(key);


                if (!raw) {
                    continue;
                }


                const parsed =
                    JSON.parse(raw);


                if (Array.isArray(parsed)) {

                    state.papers = parsed;

                    return state.papers;

                }


                if (
                    parsed &&
                    Array.isArray(parsed.items)
                ) {

                    state.papers = parsed.items;

                    return state.papers;

                }

            } catch (error) {

                console.warn(
                    "Cannot read paper storage:",
                    key,
                    error
                );

            }

        }


        state.papers = [];

        return state.papers;

    }


    function savePapers() {

        /*
         * Gunakan storage utama "papers".
         * Key ini menjadi standar untuk modul berikutnya.
         */

        localStorage.setItem(
            "papers",
            JSON.stringify(state.papers)
        );

    }


    /* ========================================================
       NORMALIZATION
    ======================================================== */

    function normalizePaper(paper, index) {

        if (!paper || typeof paper !== "object") {

            return {

                id:
                    String(index),

                title:
                    "Untitled Paper",

                authors:
                    "Unknown author",

                year:
                    "",

                journal:
                    "",

                doi:
                    "",

                volume:
                    "",

                issue:
                    "",

                pages:
                    "",

                keywords:
                    "",

                researchArea:
                    "",

                material:
                    "",

                methodology:
                    "",

                experimentalConditions:
                    "",

                createdAt:
                    null

            };

        }


        return {

            ...paper,

            id:
                paper.id ||
                paper.ID ||
                String(index),

            title:
                paper.title ||
                paper.Title ||
                paper.paperTitle ||
                paper.name ||
                "Untitled Paper",

            authors:
                paper.authors ||
                paper.Authors ||
                paper.author ||
                "Unknown author",

            year:
                paper.year ||
                paper.Year ||
                "",

            journal:
                paper.journal ||
                paper.Journal ||
                "",

            doi:
                paper.doi ||
                paper.DOI ||
                "",

            volume:
                paper.volume ||
                paper.Volume ||
                "",

            issue:
                paper.issue ||
                paper.Issue ||
                "",

            pages:
                paper.pages ||
                paper.Pages ||
                "",

            keywords:
                paper.keywords ||
                paper.Keywords ||
                "",

            researchArea:
                paper.researchArea ||
                paper["Research Area"] ||
                "",

            material:
                paper.material ||
                paper.Material ||
                "",

            methodology:
                paper.methodology ||
                paper.Methodology ||
                "",

            experimentalConditions:
                paper.experimentalConditions ||
                paper["Experimental Conditions"] ||
                "",

            createdAt:
                paper.createdAt ||
                paper.created_at ||
                null

        };

    }


    function normalizeAllPapers() {

        state.papers =
            state.papers.map(
                normalizePaper
            );

    }


    /* ========================================================
       HELPERS
    ======================================================== */

    function escapeHTML(value) {

        return String(value ?? "")

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    function getAuthors(paper) {

        if (Array.isArray(paper.authors)) {

            return paper.authors.join(", ");

        }

        return String(
            paper.authors || "Unknown author"
        );

    }


    function getKeywords(paper) {

        if (Array.isArray(paper.keywords)) {

            return paper.keywords;

        }


        if (
            typeof paper.keywords === "string"
        ) {

            return paper.keywords

                .split(/[,;|]/)

                .map(function (item) {

                    return item.trim();

                })

                .filter(Boolean);

        }


        return [];

    }


    function getYear(paper) {

        return String(
            paper.year || ""
        );

    }


    function getDateValue(paper) {

        if (!paper.createdAt) {

            return 0;

        }


        const time =
            new Date(
                paper.createdAt
            ).getTime();


        return Number.isNaN(time)
            ? 0
            : time;

    }


    /* ========================================================
       FILTERING
    ======================================================== */

    function getFilteredPapers() {

        let papers =
            state.papers.slice();


        /*
         * SEARCH
         */

        if (state.search) {

            const query =
                state.search.toLowerCase();


            papers =
                papers.filter(
                    function (paper) {

                        const searchable = [

                            paper.title,

                            getAuthors(paper),

                            paper.journal,

                            paper.doi,

                            paper.researchArea,

                            paper.material,

                            paper.methodology,

                            getKeywords(paper).join(" ")

                        ]
                            .join(" ")
                            .toLowerCase();


                        return searchable.includes(
                            query
                        );

                    }
                );

        }


        /*
         * YEAR FILTER
         */

        if (state.filter !== "all") {

            papers =
                papers.filter(
                    function (paper) {

                        return (
                            getYear(paper) ===
                            String(state.filter)
                        );

                    }
                );

        }


        /*
         * SORT
         */

        papers.sort(
            function (a, b) {

                if (
                    state.sort === "oldest"
                ) {

                    return (
                        getDateValue(a) -
                        getDateValue(b)
                    );

                }


                if (
                    state.sort === "title"
                ) {

                    return String(
                        a.title
                    ).localeCompare(
                        String(b.title)
                    );

                }


                if (
                    state.sort === "year"
                ) {

                    return (
                        Number(b.year || 0) -
                        Number(a.year || 0)
                    );

                }


                return (
                    getDateValue(b) -
                    getDateValue(a)
                );

            }
        );


        return papers;

    }


    /* ========================================================
       STATISTICS
    ======================================================== */

    function updateStatistics() {

        const papers =
            state.papers;


        setText(
            "papers-total-count",
            papers.length
        );


        const years =
            papers

                .map(function (paper) {

                    return Number(
                        paper.year
                    );

                })

                .filter(function (year) {

                    return year > 0;

                });


        const latestYear =
            years.length
                ? Math.max(...years)
                : "—";


        setText(
            "papers-latest-year",
            latestYear
        );


        const journals =
            new Set(

                papers

                    .map(function (paper) {

                        return String(
                            paper.journal || ""
                        ).trim();

                    })

                    .filter(Boolean)

            );


        setText(
            "papers-journal-count",
            journals.size
        );


        const areas =
            new Set(

                papers

                    .map(function (paper) {

                        return String(
                            paper.researchArea || ""
                        ).trim();

                    })

                    .filter(Boolean)

            );


        setText(
            "papers-area-count",
            areas.size
        );

    }


    function setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                String(value);

        }

    }


    /* ========================================================
       YEAR OPTIONS
    ======================================================== */

    function buildYearFilter() {

        const select =
            document.getElementById(
                "paper-year-filter"
            );


        if (!select) {
            return;
        }


        const currentValue =
            state.filter;


        const years = [

            ...new Set(

                state.papers

                    .map(function (paper) {

                        return String(
                            paper.year || ""
                        );

                    })

                    .filter(Boolean)

            )

        ];


        years.sort(
            function (a, b) {

                return (
                    Number(b) -
                    Number(a)
                );

            }
        );


        select.innerHTML = `

            <option value="all">
                All Years
            </option>

        `;


        years.forEach(
            function (year) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value = year;

                option.textContent =
                    year;


                select.appendChild(
                    option
                );

            }
        );


        select.value =
            currentValue === "all"
                ? "all"
                : String(currentValue);

    }


    /* ========================================================
       PAPER CARD
    ======================================================== */

    function createPaperCard(paper) {

        const keywords =
            getKeywords(paper);


        const keywordHTML =
            keywords
                .slice(0, 4)
                .map(function (keyword) {

                    return `

                        <span class="paper-tag">
                            ${escapeHTML(keyword)}
                        </span>

                    `;

                })
                .join("");


        const journal =
            paper.journal
                ? escapeHTML(
                    paper.journal
                )
                : "Journal not specified";


        const authors =
            escapeHTML(
                getAuthors(paper)
            );


        const year =
            escapeHTML(
                paper.year || "—"
            );


        return `

            <article
                class="paper-card"
                data-paper-id="${escapeHTML(paper.id)}"
            >

                <div class="paper-card-top">

                    <div class="paper-document-icon">
                        ▤
                    </div>


                    <div class="paper-card-actions">

                        <button
                            type="button"
                            class="paper-action-btn"
                            data-action="view"
                            data-id="${escapeHTML(paper.id)}"
                            title="View paper"
                        >
                            ↗
                        </button>


                        <button
                            type="button"
                            class="paper-action-btn danger"
                            data-action="delete"
                            data-id="${escapeHTML(paper.id)}"
                            title="Delete paper"
                        >
                            ×
                        </button>

                    </div>

                </div>


                <div class="paper-card-body">

                    <div class="paper-year">
                        ${year}
                    </div>


                    <h3 class="paper-title">
                        ${escapeHTML(paper.title)}
                    </h3>


                    <p class="paper-authors">
                        ${authors}
                    </p>


                    <p class="paper-journal">
                        ${journal}
                    </p>


                    ${
                        keywordHTML
                            ? `
                                <div class="paper-tags">
                                    ${keywordHTML}
                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="paper-card-footer">

                    <span>
                        ${
                            paper.doi
                                ? "DOI available"
                                : "No DOI"
                        }
                    </span>


                    <button
                        type="button"
                        class="paper-open-btn"
                        data-action="view"
                        data-id="${escapeHTML(paper.id)}"
                    >
                        View Details →
                    </button>

                </div>

            </article>

        `;

    }


    /* ========================================================
       RENDER PAPERS
    ======================================================== */

    function renderPapers() {

        const container =
            document.getElementById(
                "papers-list"
            );


        if (!container) {
            return;
        }


        const papers =
            getFilteredPapers();


        const resultCount =
            document.getElementById(
                "papers-result-count"
            );


        if (resultCount) {

            resultCount.textContent =
                `${papers.length} ${
                    papers.length === 1
                        ? "paper"
                        : "papers"
                }`;

        }


        if (!papers.length) {

            container.innerHTML = `

                <div class="papers-empty">

                    <div class="papers-empty-icon">
                        ▤
                    </div>


                    <h3>
                        ${
                            state.search ||
                            state.filter !== "all"
                                ? "No papers found"
                                : "Your library is empty"
                        }
                    </h3>


                    <p>
                        ${
                            state.search ||
                            state.filter !== "all"
                                ? "Try changing your search or filter."
                                : "Add your first research paper to start building your literature library."
                        }
                    </p>


                    <button
                        type="button"
                        class="primary-btn"
                        id="empty-add-paper"
                    >
                        ＋ Add New Paper
                    </button>

                </div>

            `;


            const emptyButton =
                document.getElementById(
                    "empty-add-paper"
                );


            if (emptyButton) {

                emptyButton.addEventListener(
                    "click",
                    function () {

                        navigate(
                            "input-paper"
                        );

                    }
                );

            }


            return;

        }


        container.innerHTML =
            papers
                .map(createPaperCard)
                .join("");


        attachPaperActions();

    }


    /* ========================================================
       PAPER ACTIONS
    ======================================================== */

    function attachPaperActions() {

        const buttons =
            document.querySelectorAll(
                "[data-action]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        const action =
                            button.dataset.action;


                        const id =
                            button.dataset.id;


                        if (
                            action === "view"
                        ) {

                            openPaperDetails(id);

                        }


                        if (
                            action === "delete"
                        ) {

                            deletePaper(id);

                        }

                    }
                );

            }
        );

    }


    /* ========================================================
       PAPER DETAILS
    ======================================================== */

    function openPaperDetails(id) {

        const paper =
            state.papers.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!paper) {
            return;
        }


        const modal =
            document.getElementById(
                "paper-detail-modal"
            );


        if (!modal) {
            return;
        }


        setText(
            "detail-title",
            paper.title || "Untitled Paper"
        );


        setText(
            "detail-authors",
            getAuthors(paper)
        );


        setText(
            "detail-year",
            paper.year || "—"
        );


        setText(
            "detail-journal",
            paper.journal || "—"
        );


        setText(
            "detail-doi",
            paper.doi || "—"
        );


        setText(
            "detail-volume",
            paper.volume || "—"
        );


        setText(
            "detail-issue",
            paper.issue || "—"
        );


        setText(
            "detail-pages",
            paper.pages || "—"
        );


        setText(
            "detail-area",
            paper.researchArea || "—"
        );


        setText(
            "detail-material",
            paper.material || "—"
        );


        setText(
            "detail-methodology",
            paper.methodology || "—"
        );


        setText(
            "detail-conditions",
            paper.experimentalConditions || "—"
        );


        setText(
            "detail-keywords",
            getKeywords(paper).join(", ") || "—"
        );


        modal.classList.add(
            "open"
        );


        document.body.classList.add(
            "modal-open"
        );

    }


    function closePaperDetails() {

        const modal =
            document.getElementById(
                "paper-detail-modal"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "open"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* ========================================================
       DELETE PAPER
    ======================================================== */

    function deletePaper(id) {

        const paper =
            state.papers.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!paper) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${paper.title}" from your library?`
            );


        if (!confirmed) {
            return;
        }


        state.papers =
            state.papers.filter(
                function (item) {

                    return String(item.id) !==
                        String(id);

                }
            );


        savePapers();

        refresh();

    }


    /* ========================================================
       NAVIGATION
    ======================================================== */

    function navigate(page) {

        /*
         * dashboard.js menjadi navigator utama.
         * Jika tersedia, gunakan API tersebut.
         */

        if (
            window.ResearchDashboard &&
            typeof window.ResearchDashboard.navigate ===
                "function"
        ) {

            window.ResearchDashboard.navigate(
                page
            );

            return;

        }


        /*
         * Fallback jika dashboard.js
         * belum tersedia.
         */

        const pages =
            document.querySelectorAll(
                ".page"
            );


        pages.forEach(
            function (item) {

                item.style.display =
                    "none";

            }
        );


        const target =
            document.getElementById(
                page + "-page"
            );


        if (target) {

            target.style.display =
                "block";

        }

    }


    /* ========================================================
       SEARCH
    ======================================================== */

    function initializeSearch() {

        const input =
            document.getElementById(
                "paper-search"
            );


        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            function () {

                state.search =
                    input.value.trim();


                renderPapers();

            }
        );

    }


    /* ========================================================
       FILTER
    ======================================================== */

    function initializeFilter() {

        const yearFilter =
            document.getElementById(
                "paper-year-filter"
            );


        const sort =
            document.getElementById(
                "paper-sort"
            );


        if (yearFilter) {

            yearFilter.addEventListener(
                "change",
                function () {

                    state.filter =
                        yearFilter.value;


                    renderPapers();

                }
            );

        }


        if (sort) {

            sort.addEventListener(
                "change",
                function () {

                    state.sort =
                        sort.value;


                    renderPapers();

                }
            );

        }

    }


    /* ========================================================
       BUTTONS
    ======================================================== */

    function initializeButtons() {

        const add =
            document.getElementById(
                "papers-add-button"
            );


        const close =
            document.getElementById(
                "close-paper-modal"
            );


        const modal =
            document.getElementById(
                "paper-detail-modal"
            );


        if (add) {

            add.addEventListener(
                "click",
                function () {

                    navigate(
                        "input-paper"
                    );

                }
            );

        }


        if (close) {

            close.addEventListener(
                "click",
                closePaperDetails
            );

        }


        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        closePaperDetails();

                    }

                }
            );

        }


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closePaperDetails();

                }

            }
        );

    }


    /* ========================================================
       REFRESH
    ======================================================== */

    function refresh() {

        loadPapers();

        normalizeAllPapers();

        updateStatistics();

        buildYearFilter();

        renderPapers();

    }


    /* ========================================================
       STORAGE EVENT
    ======================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                STORAGE_KEYS.includes(
                    event.key
                )
            ) {

                refresh();

            }

        }
    );


    /* ========================================================
       PAGE CHANGE
    ======================================================== */

    document.addEventListener(
        "rpm:pagechange",
        function (event) {

            if (
                event.detail &&
                event.detail.page === "papers"
            ) {

                refresh();

            }

        }
    );


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.ResearchPapers = {

        refresh:

            refresh,

        getPapers:

            function () {

                return state.papers.slice();

            },

        addPaper:

            function (paper) {

                const newPaper =
                    normalizePaper(
                        {
                            ...paper,

                            id:
                                paper.id ||
                                Date.now().toString(),

                            createdAt:
                                paper.createdAt ||
                                new Date().toISOString()

                        },

                        state.papers.length
                    );


                state.papers.push(
                    newPaper
                );


                savePapers();

                refresh();

            },

        deletePaper:

            deletePaper,

        openDetails:

            openPaperDetails

    };


    /* ========================================================
       INIT
    ======================================================== */

    function init() {

        initializeSearch();

        initializeFilter();

        initializeButtons();

        refresh();


        console.log(
            "Research Paper Manager Papers initialized."
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }


})();
