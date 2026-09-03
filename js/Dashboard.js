/**
 * ============================================================
 * RESEARCH PAPER MANAGER
 * DASHBOARD.JS
 * ============================================================
 *
 * Fungsi:
 * - Mengatur dashboard
 * - Mengambil data statistik
 * - Menampilkan jumlah paper
 * - Menampilkan jumlah summary
 * - Menampilkan jumlah mini review
 * - Menampilkan jumlah research gap
 * - Mengatur welcome section
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DASHBOARD STATE
    ======================================================== */

    const dashboardState = {

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


    /**
     * Mengambil elemen dashboard
     */
    function initializeElements() {

        elements = {

            dashboardPage:
                document.getElementById(
                    "dashboard-page"
                ),

            totalPapers:
                document.getElementById(
                    "total-papers"
                ),

            totalSummaries:
                document.getElementById(
                    "total-summaries"
                ),

            totalMiniReviews:
                document.getElementById(
                    "total-mini-reviews"
                ),

            totalResearchGaps:
                document.getElementById(
                    "total-research-gaps"
                ),

            dashboardWelcome:
                document.getElementById(
                    "dashboard-welcome"
                )

        };

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    function initializeDashboard() {

        initializeElements();

        updateDashboard();

        dashboardState.initialized = true;

        console.log(
            "Dashboard initialized."
        );

    }


    /* ========================================================
       DATA
    ======================================================== */

    /**
     * Mengambil data paper.
     *
     * Untuk tahap awal kita menggunakan
     * localStorage sebagai data sementara.
     *
     * Nantinya fungsi ini dapat dihubungkan
     * dengan storage.js / papers.json.
     */
    function getStoredData() {

        let papers = [];

        let summaries = [];

        let miniReviews = [];

        let researchGaps = [];


        try {

            const storedPapers =
                localStorage.getItem(
                    "rpm_papers"
                );

            if (storedPapers) {

                const parsed =
                    JSON.parse(storedPapers);

                if (Array.isArray(parsed)) {

                    papers = parsed;

                }

            }

        } catch (error) {

            console.warn(
                "Gagal membaca data papers:",
                error
            );

        }


        try {

            const storedSummaries =
                localStorage.getItem(
                    "rpm_summaries"
                );

            if (storedSummaries) {

                const parsed =
                    JSON.parse(storedSummaries);

                if (Array.isArray(parsed)) {

                    summaries = parsed;

                }

            }

        } catch (error) {

            console.warn(
                "Gagal membaca data summaries:",
                error
            );

        }


        try {

            const storedMiniReviews =
                localStorage.getItem(
                    "rpm_mini_reviews"
                );

            if (storedMiniReviews) {

                const parsed =
                    JSON.parse(storedMiniReviews);

                if (Array.isArray(parsed)) {

                    miniReviews = parsed;

                }

            }

        } catch (error) {

            console.warn(
                "Gagal membaca data mini reviews:",
                error
            );

        }


        try {

            const storedResearchGaps =
                localStorage.getItem(
                    "rpm_research_gaps"
                );

            if (storedResearchGaps) {

                const parsed =
                    JSON.parse(storedResearchGaps);

                if (Array.isArray(parsed)) {

                    researchGaps = parsed;

                }

            }

        } catch (error) {

            console.warn(
                "Gagal membaca data research gaps:",
                error
            );

        }


        return {

            papers,

            summaries,

            miniReviews,

            researchGaps

        };

    }


    /* ========================================================
       STATISTICS
    ======================================================== */

    function calculateStatistics() {

        const data =
            getStoredData();


        dashboardState.statistics = {

            papers:
                data.papers.length,

            summaries:
                data.summaries.length,

            miniReviews:
                data.miniReviews.length,

            researchGaps:
                data.researchGaps.length

        };


        return dashboardState.statistics;

    }


    /* ========================================================
       UPDATE DASHBOARD
    ======================================================== */

    function updateDashboard() {

        const statistics =
            calculateStatistics();


        updateStatistic(
            elements.totalPapers,
            statistics.papers
        );


        updateStatistic(
            elements.totalSummaries,
            statistics.summaries
        );


        updateStatistic(
            elements.totalMiniReviews,
            statistics.miniReviews
        );


        updateStatistic(
            elements.totalResearchGaps,
            statistics.researchGaps
        );

    }


    /**
     * Mengupdate angka statistik.
     */
    function updateStatistic(
        element,
        value
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            formatNumber(value);

    }


    /**
     * Format angka.
     */
    function formatNumber(value) {

        const number =
            Number(value);


        if (Number.isNaN(number)) {

            return "0";

        }


        return number.toLocaleString(
            "en-US"
        );

    }


    /* ========================================================
       REFRESH
    ======================================================== */

    /**
     * Refresh dashboard.
     *
     * Bisa dipanggil dari file lain:
     *
     * Dashboard.refresh();
     */
    function refreshDashboard() {

        if (!dashboardState.initialized) {

            initializeDashboard();

            return;

        }


        updateDashboard();

    }


    /* ========================================================
       NAVIGATION SHORTCUT
    ======================================================== */

    /**
     * Membuka halaman Input Paper.
     */
    function openInputPaper() {

        if (
            window.App &&
            typeof window.App.navigateTo === "function"
        ) {

            window.App.navigateTo(
                "input-paper"
            );

        }

    }


    /**
     * Membuka halaman Papers.
     */
    function openPapers() {

        if (
            window.App &&
            typeof window.App.navigateTo === "function"
        ) {

            window.App.navigateTo(
                "papers"
            );

        }

    }


    /* ========================================================
       APP PAGE CHANGE EVENT
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

                refreshDashboard();

            }

        }
    );


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.Dashboard = {

        initialize:
            initializeDashboard,

        refresh:
            refreshDashboard,

        getStatistics:
            function () {

                return {
                    ...dashboardState.statistics
                };

            },

        openInputPaper:
            openInputPaper,

        openPapers:
            openPapers

    };


    /* ========================================================
       START
    ======================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeDashboard
        );

    } else {

        initializeDashboard();

    }

})();
