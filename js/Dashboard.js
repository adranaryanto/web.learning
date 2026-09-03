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

    const state = {
        initialized: false,

        statistics: {
            papers: 0,
            summaries: 0,
            miniReviews: 0,
            researchGaps: 0
        }
    };


    /* ========================================================
       DOM
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

            paperProgress:
                document.getElementById("paper-progress"),

            recentActivity:
                document.getElementById("recent-activity")

        };

    }


    /* ========================================================
       STORAGE
    ======================================================== */

    function readArray(key) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                return [];
            }

            const data =
                JSON.parse(raw);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.warn(
                `Unable to read ${key}:`,
                error
            );

            return [];

        }

    }


    function getStatistics() {

        const papers =
            readArray("rpm_papers");

        const summaries =
            readArray("rpm_summaries");

        const miniReviews =
            readArray("rpm_mini_reviews");

        const researchGaps =
            readArray("rpm_research_gaps");


        state.statistics = {

            papers: papers.length,

            summaries: summaries.length,

            miniReviews: miniReviews.length,

            researchGaps: researchGaps.length

        };


        return state.statistics;

    }


    /* ========================================================
       STATISTIC COUNTER
    ======================================================== */

    function animateNumber(element, target) {

        if (!element) {
            return;
        }


        const duration = 600;

        const startTime =
            performance.now();


        function update(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            const value =
                Math.round(
                    target * eased
                );


            element.textContent =
                value.toLocaleString();


            if (progress < 1) {

                requestAnimationFrame(
                    update
                );

            }

        }


        requestAnimationFrame(update);

    }


    function updateStatistics() {

        const stats =
            getStatistics();


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
       RECENT ACTIVITY
    ======================================================== */

    function getLatestPapers() {

        const papers =
            readArray("rpm_papers");


        if (!papers.length) {

            return [];

        }


        return papers
            .slice()
            .reverse()
            .slice(0, 5);

    }


    function renderRecentActivity() {

        if (!elements.recentActivity) {
            return;
        }


        const papers =
            getLatestPapers();


        if (!papers.length) {

            elements.recentActivity.innerHTML = `
                <div class="empty-activity">

                    <div class="empty-activity-icon">
                        📚
                    </div>

                    <div>
                        <strong>
                            No papers yet
                        </strong>

                        <span>
                            Add your first research paper
                            to start building your library.
                        </span>
                    </div>

                </div>
            `;

            return;

        }


        elements.recentActivity.innerHTML =
            papers
                .map(function (paper) {

                    const title =
                        paper.title ||
                        paper.Title ||
                        "Untitled Paper";


                    const authors =
                        paper.authors ||
                        paper.Authors ||
                        "Unknown author";


                    return `
                        <div class="activity-item">

                            <div class="activity-icon">
                                📄
                            </div>

                            <div class="activity-info">

                                <strong>
                                    ${escapeHTML(title)}
                                </strong>

                                <span>
                                    ${escapeHTML(authors)}
                                </span>

                            </div>

                        </div>
                    `;

                })
                .join("");

    }


    /* ========================================================
       HTML ESCAPE
    ======================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ========================================================
       QUICK ACTIONS
    ======================================================== */

    function openPage(page) {

        if (
            window.App &&
            typeof window.App.navigateTo === "function"
        ) {

            window.App.navigateTo(page);

        }

    }


    function bindQuickActions() {

        const inputPaperButton =
            document.getElementById(
                "dashboard-add-paper"
            );


        const papersButton =
            document.getElementById(
                "dashboard-view-papers"
            );


        if (inputPaperButton) {

            inputPaperButton.addEventListener(
                "click",
                function () {

                    openPage("input-paper");

                }
            );

        }


        if (papersButton) {

            papersButton.addEventListener(
                "click",
                function () {

                    openPage("papers");

                }
            );

        }

    }


    /* ========================================================
       REFRESH
    ======================================================== */

    function refresh() {

        updateStatistics();

        renderRecentActivity();

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    function initialize() {

        if (state.initialized) {

            refresh();

            return;

        }


        cacheElements();

        bindQuickActions();

        refresh();


        state.initialized = true;


        console.log(
            "Research Paper Manager Dashboard initialized."
        );

    }


    /* ========================================================
       PAGE CHANGE
    ======================================================== */

    document.addEventListener(
        "app:pagechange",
        function (event) {

            if (
                event &&
                event.detail &&
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
                ...state.statistics
            };

        },

        openInputPaper: function () {

            openPage("input-paper");

        },

        openPapers: function () {

            openPage("papers");

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
