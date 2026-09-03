/* ============================================================
   RESEARCH PAPER MANAGER
   DASHBOARD.JS
   ============================================================ */

(function () {

    "use strict";


    /* ========================================================
       CONFIG
    ======================================================== */

    const CONFIG = {

        storageKeys: {

            papers: [
                "papers",
                "rpm_papers",
                "research_papers"
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

        }

    };


    /* ========================================================
       HELPERS
    ======================================================== */

    function parseStorage(key) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                return [];
            }

            const data =
                JSON.parse(raw);

            if (Array.isArray(data)) {
                return data;
            }

            if (
                data &&
                Array.isArray(data.items)
            ) {
                return data.items;
            }

            return [];

        } catch (error) {

            return [];

        }

    }


    function getFirstStorageArray(keys) {

        for (const key of keys) {

            const result =
                parseStorage(key);

            if (result.length > 0) {
                return result;
            }

        }

        return [];

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ========================================================
       STATISTICS
    ======================================================== */

    function getStatistics() {

        const papers =
            getFirstStorageArray(
                CONFIG.storageKeys.papers
            );

        const summaries =
            getFirstStorageArray(
                CONFIG.storageKeys.summaries
            );

        const miniReviews =
            getFirstStorageArray(
                CONFIG.storageKeys.miniReviews
            );

        const researchGaps =
            getFirstStorageArray(
                CONFIG.storageKeys.researchGaps
            );


        return {

            papers: papers.length,

            summaries: summaries.length,

            miniReviews: miniReviews.length,

            researchGaps: researchGaps.length

        };

    }


    function updateStatistics() {

        const stats =
            getStatistics();


        const papers =
            document.getElementById(
                "total-papers"
            );


        const summaries =
            document.getElementById(
                "total-summaries"
            );


        const miniReviews =
            document.getElementById(
                "total-mini-reviews"
            );


        const researchGaps =
            document.getElementById(
                "total-research-gaps"
            );


        if (papers) {
            papers.textContent =
                stats.papers;
        }


        if (summaries) {
            summaries.textContent =
                stats.summaries;
        }


        if (miniReviews) {
            miniReviews.textContent =
                stats.miniReviews;
        }


        if (researchGaps) {
            researchGaps.textContent =
                stats.researchGaps;
        }

    }


    /* ========================================================
       RECENT PAPERS
    ======================================================== */

    function getRecentPapers() {

        const papers =
            getFirstStorageArray(
                CONFIG.storageKeys.papers
            );


        return papers
            .slice()
            .reverse()
            .slice(0, 5);

    }


    function getTitle(paper) {

        return (
            paper.title ||
            paper.Title ||
            paper.paperTitle ||
            paper.name ||
            "Untitled Paper"
        );

    }


    function getAuthors(paper) {

        return (
            paper.authors ||
            paper.Authors ||
            paper.author ||
            "Unknown author"
        );

    }


    function renderRecentPapers() {

        const container =
            document.getElementById(
                "recent-papers"
            );


        if (!container) {
            return;
        }


        const papers =
            getRecentPapers();


        if (!papers.length) {

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
                            Add your first research
                            paper to begin.
                        </span>

                    </div>

                </div>

            `;

            return;

        }


        container.innerHTML =
            papers.map(function (paper) {

                return `

                    <div class="recent-item">

                        <div class="recent-item-icon">
                            ▤
                        </div>

                        <div class="recent-item-content">

                            <div class="recent-item-title">
                                ${escapeHTML(
                                    getTitle(paper)
                                )}
                            </div>

                            <div class="recent-item-author">
                                ${escapeHTML(
                                    getAuthors(paper)
                                )}
                            </div>

                        </div>

                        <span>
                            →
                        </span>

                    </div>

                `;

            }).join("");

    }


    /* ========================================================
       PAGE NAVIGATION
    ======================================================== */

    function showPage(pageName) {

        const pages =
            document.querySelectorAll(
                ".page"
            );


        pages.forEach(function (page) {

            page.classList.add(
                "hidden-page"
            );

        });


        const target =
            document.getElementById(
                pageName + "-page"
            );


        if (target) {

            target.classList.remove(
                "hidden-page"
            );

        }


        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        navItems.forEach(function (item) {

            const isActive =
                item.dataset.page === pageName;


            item.classList.toggle(
                "active",
                isActive
            );

        });


        const pageTitle =
            document.getElementById(
                "page-title"
            );


        const titles = {

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


        if (pageTitle) {

            pageTitle.textContent =
                titles[pageName] ||
                "Research Paper Manager";

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        document.dispatchEvent(
            new CustomEvent(
                "rpm:pagechange",
                {
                    detail: {
                        page: pageName
                    }
                }
            )
        );

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

                document.body.classList.toggle(
                    "sidebar-visible"
                );

            }
        );

    }


    /* ========================================================
       NAVIGATION BUTTONS
    ======================================================== */

    function initializeNavigation() {

        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        navItems.forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    const page =
                        item.dataset.page;


                    if (!page) {
                        return;
                    }


                    showPage(page);

                }
            );

        });

    }


    /* ========================================================
       DASHBOARD ACTIONS
    ======================================================== */

    function initializeActions() {

        const addPaper =
            document.getElementById(
                "add-paper-button"
            );


        const quickAdd =
            document.getElementById(
                "quick-add-paper"
            );


        const browse =
            document.getElementById(
                "quick-browse-papers"
            );


        const viewAll =
            document.getElementById(
                "view-all-papers"
            );


        if (addPaper) {

            addPaper.addEventListener(
                "click",
                function () {

                    showPage(
                        "input-paper"
                    );

                }
            );

        }


        if (quickAdd) {

            quickAdd.addEventListener(
                "click",
                function () {

                    showPage(
                        "input-paper"
                    );

                }
            );

        }


        if (browse) {

            browse.addEventListener(
                "click",
                function () {

                    showPage(
                        "papers"
                    );

                }
            );

        }


        if (viewAll) {

            viewAll.addEventListener(
                "click",
                function () {

                    showPage(
                        "papers"
                    );

                }
            );

        }

    }


    /* ========================================================
       REFRESH
    ======================================================== */

    function refreshDashboard() {

        updateStatistics();

        renderRecentPapers();

    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.Dashboard = {

        refresh:
            refreshDashboard,

        showPage:
            showPage,

        getStatistics:
            getStatistics

    };


    /* ========================================================
       INIT
    ======================================================== */

    function initialize() {

        initializeSidebar();

        initializeNavigation();

        initializeActions();

        refreshDashboard();


        console.log(
            "Research Paper Manager Dashboard loaded."
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }


})();
