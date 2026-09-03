/* ============================================================
   RESEARCH PAPER MANAGER
   DASHBOARD.JS
   FINAL VERSION 3
   ============================================================ */

(function () {

    "use strict";


    /* ========================================================
       STORAGE
    ======================================================== */

    const STORAGE = {

        papers: [
            "papers",
            "research_papers",
            "rpm_papers"
        ],

        summaries: [
            "summaries",
            "rpm_summaries"
        ],

        miniReviews: [
            "miniReviews",
            "mini_reviews",
            "rpm_mini_reviews"
        ],

        researchGaps: [
            "researchGaps",
            "research_gaps",
            "rpm_research_gaps"
        ]

    };


    /* ========================================================
       STORAGE READER
    ======================================================== */

    function readArray(keys) {

        for (const key of keys) {

            try {

                const raw =
                    localStorage.getItem(key);


                if (!raw) {
                    continue;
                }


                const parsed =
                    JSON.parse(raw);


                if (Array.isArray(parsed)) {

                    return parsed;

                }


                if (
                    parsed &&
                    Array.isArray(parsed.items)
                ) {

                    return parsed.items;

                }

            } catch (error) {

                console.warn(
                    "Unable to read storage:",
                    key
                );

            }

        }


        return [];

    }


    /* ========================================================
       STATISTICS
    ======================================================== */

    function updateStatistics() {

        const papers =
            readArray(
                STORAGE.papers
            );


        const summaries =
            readArray(
                STORAGE.summaries
            );


        const miniReviews =
            readArray(
                STORAGE.miniReviews
            );


        const researchGaps =
            readArray(
                STORAGE.researchGaps
            );


        setText(
            "total-papers",
            papers.length
        );


        setText(
            "total-summaries",
            summaries.length
        );


        setText(
            "total-mini-reviews",
            miniReviews.length
        );


        setText(
            "total-research-gaps",
            researchGaps.length
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
       PAPER DATA
    ======================================================== */

    function paperTitle(paper) {

        return (
            paper.title ||
            paper.Title ||
            paper.paperTitle ||
            paper.name ||
            "Untitled Paper"
        );

    }


    function paperAuthors(paper) {

        return (
            paper.authors ||
            paper.Authors ||
            paper.author ||
            "Unknown author"
        );

    }


    /* ========================================================
       ESCAPE HTML
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


    /* ========================================================
       RECENT PAPERS
    ======================================================== */

    function renderRecentPapers() {

        const container =
            document.getElementById(
                "recent-papers"
            );


        if (!container) {
            return;
        }


        const papers =
            readArray(
                STORAGE.papers
            );


        const recent =
            papers
                .slice()
                .reverse()
                .slice(0, 5);


        if (!recent.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ＋
                    </div>

                    <div>

                        <strong>
                            No papers yet
                        </strong>

                        <span>
                            Add your first paper
                            to start building
                            your library.
                        </span>

                    </div>

                </div>

            `;

            return;

        }


        container.innerHTML =
            recent
                .map(function (paper) {

                    return `

                        <div class="recent-item">

                            <div class="recent-item-icon">
                                ▤
                            </div>

                            <div>

                                <div class="recent-item-title">
                                    ${escapeHTML(
                                        paperTitle(paper)
                                    )}
                                </div>

                                <div class="recent-item-author">
                                    ${escapeHTML(
                                        paperAuthors(paper)
                                    )}
                                </div>

                            </div>

                            <span>
                                →
                            </span>

                        </div>

                    `;

                })
                .join("");

    }


    /* ========================================================
       PAGE NAVIGATION
    ======================================================== */

    const PAGE_TITLES = {

        dashboard:
            "Dashboard",

        papers:
            "Papers",

        "input-paper":
            "Input Paper",

        summary:
            "Summary",

        "mini-review":
            "Mini Review",

        "research-gap":
            "Research Gap"

    };


    function navigate(page) {

        const pages =
            document.querySelectorAll(
                ".page"
            );


        pages.forEach(function (item) {

            item.style.display =
                "none";

        });


        const target =
            document.getElementById(
                page + "-page"
            );


        if (target) {

            target.style.display =
                page === "dashboard"
                    ? "block"
                    : "block";

        }


        const navigation =
            document.querySelectorAll(
                ".nav-item"
            );


        navigation.forEach(function (item) {

            item.classList.toggle(
                "active",
                item.dataset.page === page
            );

        });


        const title =
            document.getElementById(
                "page-title"
            );


        if (title) {

            title.textContent =
                PAGE_TITLES[page] ||
                "Research Paper Manager";

        }


        /*
         * Tutup sidebar mobile setelah
         * memilih menu.
         */

        document.body.classList.remove(
            "sidebar-mobile-open"
        );


        /*
         * Beritahu JS halaman lain.
         */

        document.dispatchEvent(

            new CustomEvent(
                "rpm:pagechange",
                {
                    detail: {
                        page: page
                    }
                }
            )

        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* ========================================================
       NAVIGATION INIT
    ======================================================== */

    function initializeNavigation() {

        const items =
            document.querySelectorAll(
                ".nav-item"
            );


        items.forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    navigate(
                        item.dataset.page
                    );

                }
            );

        });

    }


    /* ========================================================
       SIDEBAR
    ======================================================== */

    function initializeSidebar() {

        const toggle =
            document.getElementById(
                "sidebar-toggle"
            );


        if (!toggle) {
            return;
        }


        toggle.addEventListener(
            "click",
            function () {

                if (
                    window.innerWidth <= 800
                ) {

                    document.body.classList.toggle(
                        "sidebar-mobile-open"
                    );

                } else {

                    document.body.classList.toggle(
                        "sidebar-collapsed"
                    );

                }

            }
        );

    }


    /* ========================================================
       ACTION BUTTONS
    ======================================================== */

    function initializeActions() {

        const heroAdd =
            document.getElementById(
                "hero-add-paper"
            );


        const browse =
            document.getElementById(
                "browse-papers"
            );


        const summary =
            document.getElementById(
                "create-summary"
            );


        const gap =
            document.getElementById(
                "create-gap"
            );


        const viewAll =
            document.getElementById(
                "view-all-papers"
            );


        if (heroAdd) {

            heroAdd.addEventListener(
                "click",
                function () {

                    navigate(
                        "input-paper"
                    );

                }
            );

        }


        if (browse) {

            browse.addEventListener(
                "click",
                function () {

                    navigate(
                        "papers"
                    );

                }
            );

        }


        if (summary) {

            summary.addEventListener(
                "click",
                function () {

                    navigate(
                        "summary"
                    );

                }
            );

        }


        if (gap) {

            gap.addEventListener(
                "click",
                function () {

                    navigate(
                        "research-gap"
                    );

                }
            );

        }


        if (viewAll) {

            viewAll.addEventListener(
                "click",
                function () {

                    navigate(
                        "papers"
                    );

                }
            );

        }

    }


    /* ========================================================
       REFRESH
    ======================================================== */

    function refresh() {

        updateStatistics();

        renderRecentPapers();

    }


    /* ========================================================
       LISTEN TO STORAGE CHANGES
    ======================================================== */

    window.addEventListener(
        "storage",
        function () {

            refresh();

        }
    );


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.ResearchDashboard = {

        refresh: refresh,

        navigate: navigate,

        statistics:
            updateStatistics

    };


    /* ========================================================
       INIT
    ======================================================== */

    function init() {

        initializeNavigation();

        initializeSidebar();

        initializeActions();

        refresh();


        /*
         * Pastikan dashboard aktif
         * ketika pertama kali dibuka.
         */

        navigate("dashboard");


        console.log(
            "Research Paper Manager Dashboard initialized."
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
