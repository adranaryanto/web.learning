/**
 * ============================================================
 * RESEARCH PAPER MANAGER
 * DASHBOARD.JS
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       STATE
    ======================================================== */

    const DashboardState = {

        initialized: false,

        statistics: {
            papers: 0,
            summaries: 0,
            miniReviews: 0,
            researchGaps: 0
        }

    };


    /* ========================================================
       DOM ELEMENTS
    ======================================================== */

    let elements = {};


    function cacheElements() {

        elements = {

            dashboard:
                document.getElementById("dashboard-page"),

            totalPapers:
                document.getElementById("total-papers"),

            totalSummaries:
                document.getElementById("total-summaries"),

            totalMiniReviews:
                document.getElementById("total-mini-reviews"),

            totalResearchGaps:
                document.getElementById("total-research-gaps"),

            recentActivity:
                document.getElementById("recent-activity"),

            addPaperButton:
                document.getElementById("dashboard-add-paper"),

            browsePapersButton:
                document.getElementById("dashboard-view-papers")

        };

    }


    /* ========================================================
       STORAGE HELPER
    ======================================================== */

    function readStorageArray(key) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {

                return [];

            }


            const parsed =
                JSON.parse(raw);


            if (!Array.isArray(parsed)) {

                return [];

            }


            return parsed;

        } catch (error) {

            console.warn(
                "Dashboard storage error:",
                key,
                error
            );

            return [];

        }

    }


    /* ========================================================
       STATISTICS
    ======================================================== */

    function calculateStatistics() {

        const papers =
            readStorageArray("rpm_papers");


        const summaries =
            readStorageArray("rpm_summaries");


        const miniReviews =
            readStorageArray("rpm_mini_reviews");


        const researchGaps =
            readStorageArray("rpm_research_gaps");


        DashboardState.statistics = {

            papers:
                papers.length,

            summaries:
                summaries.length,

            miniReviews:
                miniReviews.length,

            researchGaps:
                researchGaps.length

        };


        return DashboardState.statistics;

    }


    /* ========================================================
       NUMBER ANIMATION
    ======================================================== */

    function animateNumber(
        element,
        target
    ) {

        if (!element) {

            return;

        }


        const finalValue =
            Number(target) || 0;


        const duration = 550;

        const startTime =
            performance.now();


        function frame(currentTime) {

            const elapsed =
                currentTime - startTime;


            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            const easedProgress =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            const currentValue =
                Math.round(
                    finalValue *
                    easedProgress
                );


            element.textContent =
                currentValue.toLocaleString(
                    "en-US"
                );


            if (progress < 1) {

                requestAnimationFrame(frame);

            }

        }


        requestAnimationFrame(frame);

    }


    function updateStatistics() {

        const stats =
            calculateStatistics();


        animateNumber(
            elements.totalPapers,
            stats.papers
        );


        animateNumber(
            elements.totalSummaries,
            stats.summaries
        );


        animateNumber(
            elements.totalMiniReviews,
            stats.miniReviews
        );


        animateNumber(
            elements.totalResearchGaps,
            stats.researchGaps
        );

    }


    /* ========================================================
       RECENT PAPERS
    ======================================================== */

    function getRecentPapers() {

        const papers =
            readStorageArray("rpm_papers");


        return papers
            .slice()
            .reverse()
            .slice(0, 5);

    }


    function getPaperTitle(paper) {

        return (
            paper.title ||
            paper.Title ||
            paper.paperTitle ||
            "Untitled Paper"
        );

    }


    function getPaperAuthors(paper) {

        return (
            paper.authors ||
            paper.Authors ||
            paper.author ||
            "Unknown author"
        );

    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function renderRecentPapers() {

        const container =
            elements.recentActivity;


        if (!container) {

            return;

        }


        const papers =
            getRecentPapers();


        if (!papers.length) {

            container.innerHTML = `

                <div class="empty-activity">

                    <div class="empty-activity-icon">
                        <span>＋</span>
                    </div>

                    <div class="empty-activity-text">

                        <strong>
                            No papers yet
                        </strong>

                        <span>
                            Add your first paper to
                            start building your library.
                        </span>

                    </div>

                </div>

            `;

            return;

        }


        container.innerHTML =
            papers
                .map(function (paper) {

                    const title =
                        escapeHTML(
                            getPaperTitle(paper)
                        );


                    const authors =
                        escapeHTML(
                            getPaperAuthors(paper)
                        );


                    return `

                        <div class="activity-item">

                            <div class="activity-icon">
                                <span>▤</span>
                            </div>

                            <div class="activity-info">

                                <strong>
                                    ${title}
                                </strong>

                                <span>
                                    ${authors}
                                </span>

                            </div>

                            <div class="activity-arrow">
                                →
                            </div>

                        </div>

                    `;

                })
                .join("");

    }


    /* ========================================================
       NAVIGATION
    ======================================================== */

    function navigate(page) {

        if (
            window.App &&
            typeof window.App.navigateTo === "function"
        ) {

            window.App.navigateTo(page);

            return;

        }


        console.warn(
            "App navigation controller belum tersedia."
        );

    }


    function bindNavigation() {

        if (elements.addPaperButton) {

            elements.addPaperButton.addEventListener(
                "click",
                function () {

                    navigate("input-paper");

                }
            );

        }


        if (elements.browsePapersButton) {

            elements.browsePapersButton.addEventListener(
                "click",
                function () {

                    navigate("papers");

                }
            );

        }

    }


    /* ========================================================
       REFRESH
    ======================================================== */

    function refresh() {

        if (!elements.dashboard) {

            return;

        }


        updateStatistics();

        renderRecentPapers();

    }


    /* ========================================================
       INITIALIZE
    ======================================================== */

    function initialize() {

        cacheElements();

        bindNavigation();

        refresh();


        DashboardState.initialized =
            true;


        console.log(
            "Dashboard initialized."
        );

    }


    /* ========================================================
       APP PAGE EVENT
    ======================================================== */

    document.addEventListener(
        "app:pagechange",
        function (event) {

            if (
                !event ||
                !event.detail
            ) {

                return;

            }


            if (
                event.detail.page === "dashboard"
            ) {

                refresh();

            }

        }
    );


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.Dashboard = {

        initialize: initialize,

        refresh: refresh,

        getStatistics: function () {

            return {
                ...DashboardState.statistics
            };

        },

        openInputPaper: function () {

            navigate("input-paper");

        },

        openPapers: function () {

            navigate("papers");

        }

    };


    /* ========================================================
       START
    ======================================================== */

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
