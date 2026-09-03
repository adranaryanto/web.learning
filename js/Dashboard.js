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
       ELEMENTS
    ======================================================== */

    let elements = {};


    function initializeElements() {

        elements = {

            totalPapers:
                document.getElementById("total-papers"),

            totalSummaries:
                document.getElementById("total-summaries"),

            totalMiniReviews:
                document.getElementById("total-mini-reviews"),

            totalResearchGaps:
                document.getElementById("total-research-gaps"),

            papersProgress:
                document.getElementById("papers-progress"),

            summariesProgress:
                document.getElementById("summaries-progress"),

            miniReviewsProgress:
                document.getElementById("mini-reviews-progress"),

            researchGapsProgress:
                document.getElementById("research-gaps-progress")

        };

    }


    /* ========================================================
       DATA
    ======================================================== */

    function getArrayFromStorage(key) {

        try {

            const data =
                localStorage.getItem(key);

            if (!data) {

                return [];

            }

            const parsed =
                JSON.parse(data);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.warn(
                `Unable to read ${key}:`,
                error
            );

            return [];

        }

    }


    function getDashboardData() {

        return {

            papers:
                getArrayFromStorage("rpm_papers"),

            summaries:
                getArrayFromStorage("rpm_summaries"),

            miniReviews:
                getArrayFromStorage("rpm_mini_reviews"),

            researchGaps:
                getArrayFromStorage("rpm_research_gaps")

        };

    }


    /* ========================================================
       STATISTICS
    ======================================================== */

    function calculateStatistics() {

        const data =
            getDashboardData();


        state.statistics = {

            papers:
                data.papers.length,

            summaries:
                data.summaries.length,

            miniReviews:
                data.miniReviews.length,

            researchGaps:
                data.researchGaps.length

        };


        return state.statistics;

    }


    /* ========================================================
       RENDER
    ======================================================== */

    function renderStatistics() {

        const statistics =
            calculateStatistics();


        setNumber(
            elements.totalPapers,
            statistics.papers
        );


        setNumber(
            elements.totalSummaries,
            statistics.summaries
        );


        setNumber(
            elements.totalMiniReviews,
            statistics.miniReviews
        );


        setNumber(
            elements.totalResearchGaps,
            statistics.researchGaps
        );


        updateProgress(
            elements.papersProgress,
            statistics.papers
        );


        updateProgress(
            elements.summariesProgress,
            statistics.summaries
        );


        updateProgress(
            elements.miniReviewsProgress,
            statistics.miniReviews
        );


        updateProgress(
            elements.researchGapsProgress,
            statistics.researchGaps
        );

    }


    function setNumber(element, value) {

        if (!element) {
            return;
        }


        element.textContent =
            Number(value).toLocaleString();

    }


    function updateProgress(element, value) {

        if (!element) {
            return;
        }


        const percentage =
            Math.min(
                Number(value) * 10,
                100
            );


        element.style.width =
            `${percentage}%`;

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

        }

    }


    function openInputPaper() {

        navigate("input-paper");

    }


    function openPapers() {

        navigate("papers");

    }


    function openSummary() {

        navigate("summary");

    }


    function openMiniReview() {

        navigate("mini-review");

    }


    function openResearchGap() {

        navigate("research-gap");

    }


    /* ========================================================
       REFRESH
    ======================================================== */

    function refresh() {

        renderStatistics();

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    function initialize() {

        initializeElements();

        renderStatistics();

        state.initialized = true;

        console.log(
            "Dashboard initialized."
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

        initialize,

        refresh,

        openInputPaper,

        openPapers,

        openSummary,

        openMiniReview,

        openResearchGap,

        getStatistics: function () {

            return {
                ...state.statistics
            };

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
