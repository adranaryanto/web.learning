/**
 * ============================================================
 * RESEARCH PAPER MANAGER
 * APP.JS
 * ============================================================
 *
 * Fungsi utama:
 * - Mengatur navigasi halaman
 * - Mengatur sidebar
 * - Mengatur active navigation
 * - Mengatur page title
 * - Mengontrol tampilan halaman
 *
 * File ini merupakan controller utama aplikasi.
 * ============================================================
 */

(function () {
    "use strict";


    /* ========================================================
       KONFIGURASI
    ======================================================== */

    const APP_CONFIG = {

        appName: "Research Paper Manager",

        defaultPage: "dashboard",

        pages: {
            dashboard: {
                title: "Dashboard",
                label: "Dashboard"
            },

            papers: {
                title: "Papers",
                label: "Papers"
            },

            "input-paper": {
                title: "Input Paper",
                label: "Input Paper"
            },

            summary: {
                title: "Summary",
                label: "Summary"
            },

            "mini-review": {
                title: "Mini Review",
                label: "Mini Review"
            },

            "research-gap": {
                title: "Research Gap",
                label: "Research Gap"
            }
        }

    };


    /* ========================================================
       STATE APLIKASI
    ======================================================== */

    const state = {

        currentPage: APP_CONFIG.defaultPage,

        sidebarOpen: true

    };


    /* ========================================================
       DOM ELEMENTS
    ======================================================== */

    let elements = {};


    /**
     * Mengambil semua elemen penting dari index.html
     */
    function initializeElements() {

        elements = {

            app:
                document.getElementById("app"),

            sidebar:
                document.getElementById("sidebar"),

            sidebarToggle:
                document.getElementById("sidebar-toggle"),

            pageTitle:
                document.getElementById("page-title"),

            pageContainer:
                document.getElementById("page-container"),

            mainNavigation:
                document.getElementById("main-navigation"),

            navItems:
                document.querySelectorAll(".nav-item"),

            pages:
                document.querySelectorAll(".page"),

            systemStatus:
                document.getElementById("system-status")

        };

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    /**
     * Menjalankan aplikasi setelah DOM siap.
     */
    function initializeApp() {

        initializeElements();

        bindEvents();

        restoreInitialState();

        setSystemStatus("Ready");

        console.log(
            `${APP_CONFIG.appName} initialized.`
        );

    }


    /* ========================================================
       EVENT HANDLER
    ======================================================== */

    /**
     * Mendaftarkan seluruh event aplikasi.
     */
    function bindEvents() {

        /*
         * Sidebar toggle
         */
        if (elements.sidebarToggle) {

            elements.sidebarToggle.addEventListener(
                "click",
                toggleSidebar
            );

        }


        /*
         * Navigation
         */
        if (elements.navItems) {

            elements.navItems.forEach(function (navItem) {

                navItem.addEventListener(
                    "click",
                    handleNavigationClick
                );

            });

        }


        /*
         * Keyboard shortcut
         *
         * Escape:
         * Menutup sidebar pada mode tertentu.
         */
        document.addEventListener(
            "keydown",
            handleKeyboard
        );

    }


    /**
     * Handler ketika menu navigasi diklik.
     */
    function handleNavigationClick(event) {

        const navItem = event.currentTarget;

        const page =
            navItem.dataset.page;

        if (!page) {
            return;
        }

        navigateTo(page);

    }


    /**
     * Keyboard handler.
     */
    function handleKeyboard(event) {

        /*
         * Escape dapat digunakan
         * untuk menutup sidebar.
         */
        if (event.key === "Escape") {

            closeSidebar();

        }

    }


    /* ========================================================
       NAVIGATION
    ======================================================== */

    /**
     * Pindah ke halaman tertentu.
     *
     * Contoh:
     *
     * navigateTo("papers");
     * navigateTo("summary");
     * navigateTo("research-gap");
     */
    function navigateTo(pageName) {

        /*
         * Pastikan halaman tersedia
         */
        if (!APP_CONFIG.pages[pageName]) {

            console.warn(
                `Page "${pageName}" tidak ditemukan.`
            );

            return false;

        }


        /*
         * Update state
         */
        state.currentPage = pageName;


        /*
         * Update halaman
         */
        updatePages(pageName);


        /*
         * Update navigation
         */
        updateNavigation(pageName);


        /*
         * Update title
         */
        updatePageTitle(pageName);


        /*
         * Simpan halaman terakhir
         */
        saveCurrentPage(pageName);


        /*
         * Event custom untuk modul lain.
         *
         * Modul seperti dashboard.js,
         * papers.js, summary.js, dll
         * dapat mendengarkan event ini.
         */
        dispatchPageChangeEvent(pageName);


        return true;

    }


    /**
     * Menampilkan halaman yang sesuai.
     */
    function updatePages(activePage) {

        if (!elements.pages) {
            return;
        }


        elements.pages.forEach(function (pageElement) {

            /*
             * ID halaman mengikuti pola:
             *
             * dashboard-page
             * papers-page
             * input-paper-page
             */
            const pageId =
                pageElement.id;


            const pageName =
                pageId.replace(
                    "-page",
                    ""
                );


            const isActive =
                pageName === activePage;


            /*
             * Atur class
             */
            pageElement.classList.toggle(
                "active",
                isActive
            );


            /*
             * Atur hidden attribute
             */
            pageElement.hidden =
                !isActive;

        });

    }


    /**
     * Update menu aktif.
     */
    function updateNavigation(activePage) {

        if (!elements.navItems) {
            return;
        }


        elements.navItems.forEach(function (navItem) {

            const navPage =
                navItem.dataset.page;


            const isActive =
                navPage === activePage;


            navItem.classList.toggle(
                "active",
                isActive
            );


            /*
             * Accessibility
             */
            navItem.setAttribute(
                "aria-current",
                isActive
                    ? "page"
                    : "false"
            );

        });

    }


    /**
     * Update judul halaman pada topbar.
     */
    function updatePageTitle(pageName) {

        if (!elements.pageTitle) {
            return;
        }


        const pageConfig =
            APP_CONFIG.pages[pageName];


        if (!pageConfig) {
            return;
        }


        elements.pageTitle.textContent =
            pageConfig.title;

    }


    /* ========================================================
       SIDEBAR
    ======================================================== */

    /**
     * Toggle sidebar.
     */
    function toggleSidebar() {

        if (state.sidebarOpen) {

            closeSidebar();

        } else {

            openSidebar();

        }

    }


    /**
     * Membuka sidebar.
     */
    function openSidebar() {

        state.sidebarOpen = true;


        if (elements.app) {

            elements.app.classList.add(
                "sidebar-open"
            );

            elements.app.classList.remove(
                "sidebar-closed"
            );

        }


        if (elements.sidebar) {

            elements.sidebar.classList.remove(
                "collapsed"
            );

        }

    }


    /**
     * Menutup sidebar.
     */
    function closeSidebar() {

        state.sidebarOpen = false;


        if (elements.app) {

            elements.app.classList.remove(
                "sidebar-open"
            );

            elements.app.classList.add(
                "sidebar-closed"
            );

        }


        if (elements.sidebar) {

            elements.sidebar.classList.add(
                "collapsed"
            );

        }

    }


    /* ========================================================
       STATE
    ======================================================== */

    /**
     * Mengatur state awal aplikasi.
     */
    function restoreInitialState() {

        /*
         * Untuk tahap awal,
         * dashboard selalu menjadi halaman awal.
         */
        navigateTo(
            APP_CONFIG.defaultPage
        );


        /*
         * Sidebar default terbuka.
         */
        openSidebar();

    }


    /**
     * Menyimpan halaman aktif ke localStorage.
     *
     * Saat storage.js dibuat nanti,
     * fungsi penyimpanan dapat dikembangkan
     * lebih lanjut di sana.
     */
    function saveCurrentPage(pageName) {

        try {

            localStorage.setItem(
                "rpm_current_page",
                pageName
            );

        } catch (error) {

            console.warn(
                "Tidak dapat menyimpan current page:",
                error
            );

        }

    }


    /**
     * Mengambil halaman terakhir.
     *
     * Saat ini belum digunakan sebagai
     * halaman startup agar dashboard
     * tetap menjadi landing page.
     */
    function getSavedPage() {

        try {

            const savedPage =
                localStorage.getItem(
                    "rpm_current_page"
                );


            if (
                savedPage &&
                APP_CONFIG.pages[savedPage]
            ) {

                return savedPage;

            }

        } catch (error) {

            console.warn(
                "Tidak dapat membaca current page:",
                error
            );

        }


        return APP_CONFIG.defaultPage;

    }


    /* ========================================================
       SYSTEM STATUS
    ======================================================== */

    /**
     * Mengubah status aplikasi pada topbar.
     *
     * Contoh:
     *
     * setSystemStatus("Ready");
     * setSystemStatus("Loading...");
     * setSystemStatus("Saved");
     */
    function setSystemStatus(statusText) {

        if (!elements.systemStatus) {
            return;
        }


        /*
         * Struktur:
         *
         * <span class="status-indicator"></span>
         * <span>Ready</span>
         */
        const textElement =
            elements.systemStatus.querySelector(
                "span:last-child"
            );


        if (textElement) {

            textElement.textContent =
                statusText;

        }

    }


    /* ========================================================
       CUSTOM EVENTS
    ======================================================== */

    /**
     * Memberikan sinyal kepada modul lain
     * bahwa halaman telah berubah.
     */
    function dispatchPageChangeEvent(pageName) {

        const event =
            new CustomEvent(
                "app:pagechange",
                {
                    detail: {
                        page: pageName
                    }
                }
            );


        document.dispatchEvent(event);

    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    /*
     * Beberapa fungsi dibuat global
     * supaya file JS lain dapat
     * berkomunikasi dengan app.js.
     */
    window.App = {

        navigateTo: navigateTo,

        toggleSidebar: toggleSidebar,

        openSidebar: openSidebar,

        closeSidebar: closeSidebar,

        getCurrentPage: function () {

            return state.currentPage;

        },

        getSavedPage: getSavedPage,

        setSystemStatus: setSystemStatus,

        getConfig: function () {

            return APP_CONFIG;

        }

    };


    /* ========================================================
       START APPLICATION
    ======================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeApp
        );

    } else {

        initializeApp();

    }

})();
