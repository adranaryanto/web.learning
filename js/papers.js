/* ============================================================
   RESEARCH PAPER MANAGER
   PAPER.JS
   FINAL VERSION
   ============================================================ */

"use strict";

/* ============================================================
   CONFIG
   ============================================================ */

const PAPER_STORAGE_KEY = "research_papers";
const PAPER_JSON_PATH = "data/papers.json";

/* ============================================================
   STATE
   ============================================================ */

let papers = [];
let filteredPapers = [];
let selectedPaperId = null;

/* ============================================================
   DOM
   ============================================================ */

const paperList = document.getElementById("paperList");
const paperCount = document.getElementById("paperCount");
const searchInput = document.getElementById("searchInput");

const detailEmpty = document.getElementById("detailEmpty");
const detailContent = document.getElementById("detailContent");

/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", initPaperPage);

async function initPaperPage() {
    setupNavigation();
    setupSearch();

    await loadPapers();

    filteredPapers = [...papers];

    renderPaperCount();
    renderPaperList();

    if (filteredPapers.length > 0) {
        selectPaper(filteredPapers[0]);
    } else {
        showEmptyDetail();
    }
}

/* ============================================================
   NAVIGATION
   ============================================================ */

function setupNavigation() {
    const currentPage = getCurrentPage();

    document.querySelectorAll(".app-nav-link").forEach(link => {
        const target = link.getAttribute("data-page");

        if (target === currentPage) {
            link.classList.add("active");
        }

        link.addEventListener("click", function () {
            document
                .querySelectorAll(".app-nav-link")
                .forEach(item => item.classList.remove("active"));

            this.classList.add("active");
        });
    });

    const menuButton = document.getElementById("menuButton");

    if (menuButton) {
        menuButton.addEventListener("click", function () {
            document.body.classList.toggle("sidebar-open");
        });
    }
}

function getCurrentPage() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes("paper")) {
        return "papers";
    }

    if (path.includes("input")) {
        return "input";
    }

    if (path.includes("summary")) {
        return "summary";
    }

    if (path.includes("mini")) {
        return "mini-review";
    }

    if (path.includes("research")) {
        return "research-gap";
    }

    return "dashboard";
}

/* ============================================================
   SEARCH
   ============================================================ */

function setupSearch() {
    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", function () {
        filterPapers(this.value);
    });
}

function filterPapers(query) {
    const text = String(query || "")
        .trim()
        .toLowerCase();

    if (!text) {
        filteredPapers = [...papers];
    } else {
        filteredPapers = papers.filter(paper => {
            return Object.values(paper)
                .join(" ")
                .toLowerCase()
                .includes(text);
        });
    }

    renderPaperCount();
    renderPaperList();

    if (filteredPapers.length > 0) {
        const stillExists = filteredPapers.some(
            paper => getPaperId(paper) === selectedPaperId
        );

        if (!stillExists) {
            selectPaper(filteredPapers[0]);
        }
    } else {
        showEmptyDetail();
    }
}

/* ============================================================
   LOAD PAPERS
   ============================================================ */

async function loadPapers() {
    let localData = [];

    try {
        const stored = localStorage.getItem(PAPER_STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
                localData = parsed;
            }
        }
    } catch (error) {
        console.warn(
            "LocalStorage papers tidak dapat dibaca:",
            error
        );
    }

    if (localData.length > 0) {
        papers = normalizePapers(localData);
        return;
    }

    try {
        const response = await fetch(PAPER_JSON_PATH, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const json = await response.json();

        if (Array.isArray(json)) {
            papers = normalizePapers(json);
        } else if (
            json &&
            Array.isArray(json.papers)
        ) {
            papers = normalizePapers(json.papers);
        } else {
            papers = [];
        }

    } catch (error) {
        console.warn(
            "papers.json tidak tersedia:",
            error
        );

        papers = [];
    }
}

/* ============================================================
   NORMALIZE
   ============================================================ */

function normalizePapers(data) {
    return data.map((paper, index) => {
        const normalized = {
            ...paper
        };

        if (!getPaperId(normalized)) {
            normalized.id =
                "PAPER-" +
                String(index + 1).padStart(4, "0");
        }

        return normalized;
    });
}

/* ============================================================
   PAPER ID
   ============================================================ */

function getPaperId(paper) {
    if (!paper) {
        return "";
    }

    return String(
        paper.id ||
        paper.paper_id ||
        paper.Paper_ID ||
        paper.ID ||
        ""
    );
}

/* ============================================================
   VALUE HELPERS
   ============================================================ */

function getField(paper, aliases) {
    if (!paper) {
        return "";
    }

    for (const alias of aliases) {
        if (
            Object.prototype.hasOwnProperty.call(
                paper,
                alias
            )
        ) {
            const value = paper[alias];

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {
                return String(value).trim();
            }
        }
    }

    const normalizedKeys = Object.keys(paper);

    for (const alias of aliases) {
        const normalizedAlias =
            normalizeKey(alias);

        const foundKey =
            normalizedKeys.find(
                key =>
                    normalizeKey(key) ===
                    normalizedAlias
            );

        if (foundKey) {
            const value = paper[foundKey];

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {
                return String(value).trim();
            }
        }
    }

    return "";
}

function normalizeKey(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

/* ============================================================
   COMMON PAPER FIELDS
   ============================================================ */

function getTitle(paper) {
    return (
        getField(paper, [
            "Title",
            "title",
            "Paper Title",
            "paper_title"
        ]) ||
        getField(paper, [
            "File Name",
            "Filename",
            "file_name"
        ]) ||
        "Untitled Paper"
    );
}

function getAuthors(paper) {
    return getField(paper, [
        "Authors",
        "Author",
        "authors",
        "author"
    ]);
}

function getYear(paper) {
    return getField(paper, [
        "Year",
        "year",
        "Publication Year",
        "publication_year"
    ]);
}

function getJournal(paper) {
    return getField(paper, [
        "Journal",
        "journal",
        "Journal Name"
    ]);
}

function getDOI(paper) {
    return getField(paper, [
        "DOI",
        "doi"
    ]);
}

function getVolume(paper) {
    return getField(paper, [
        "Volume",
        "volume"
    ]);
}

function getIssue(paper) {
    return getField(paper, [
        "Issue",
        "issue"
    ]);
}

function getPages(paper) {
    return getField(paper, [
        "Pages",
        "Page",
        "pages"
    ]);
}

function getKeywords(paper) {
    return getField(paper, [
        "Keywords",
        "Keyword",
        "keywords"
    ]);
}

function getResearchArea(paper) {
    return getField(paper, [
        "Research Area",
        "Research_Area",
        "research_area"
    ]);
}

function getMaterial(paper) {
    return getField(paper, [
        "Material",
        "material"
    ]);
}

function getMethodology(paper) {
    return getField(paper, [
        "Methodology",
        "methodology",
        "Methods",
        "methods"
    ]);
}

function getExperimentalConditions(paper) {
    return getField(paper, [
        "Experimental Conditions",
        "Experimental_Conditions",
        "experimental_conditions"
    ]);
}

function getAbstract(paper) {
    return getField(paper, [
        "Abstract",
        "abstract",
        "Abstract Text",
        "Summary"
    ]);
}

function getFullText(paper) {
    return getField(paper, [
        "Full Text",
        "Full_Text",
        "full_text",
        "Text",
        "Extracted Text",
        "Extracted_Text",
        "Content",
        "text"
    ]);
}

/* ============================================================
   RENDER COUNT
   ============================================================ */

function renderPaperCount() {
    if (!paperCount) {
        return;
    }

    const total = filteredPapers.length;

    paperCount.textContent =
        total === 1
            ? "1 paper"
            : `${total} papers`;
}

/* ============================================================
   RENDER PAPER LIST
   ============================================================ */

function renderPaperList() {
    if (!paperList) {
        return;
    }

    if (filteredPapers.length === 0) {
        paperList.innerHTML = `
            <div class="paper-empty-state">
                <div class="paper-empty-icon">📚</div>

                <h3>
                    ${
                        papers.length === 0
                            ? "No papers yet"
                            : "No papers found"
                    }
                </h3>

                <p>
                    ${
                        papers.length === 0
                            ? "Add your first research paper to start building your library."
                            : "Try another search keyword."
                    }
                </p>
            </div>
        `;

        return;
    }

    paperList.innerHTML = "";

    filteredPapers.forEach((paper, index) => {
        const item =
            document.createElement("button");

        item.type = "button";
        item.className = "paper-list-item";

        const id = getPaperId(paper);

        if (id === selectedPaperId) {
            item.classList.add("active");
        }

        item.innerHTML = `
            <span class="paper-list-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <span class="paper-list-body">
                <strong>
                    ${escapeHtml(getTitle(paper))}
                </strong>

                <small>
                    ${
                        escapeHtml(
                            getAuthors(paper) ||
                            "Author not available"
                        )
                    }
                </small>

                <small class="paper-list-meta">
                    ${
                        escapeHtml(
                            [
                                getYear(paper),
                                getJournal(paper)
                            ]
                                .filter(Boolean)
                                .join(" · ")
                        ) ||
                        "Bibliographic information unavailable"
                    }
                </small>
            </span>
        `;

        item.addEventListener(
            "click",
            function () {
                selectPaper(paper);
            }
        );

        paperList.appendChild(item);
    });
}

/* ============================================================
   SELECT PAPER
   ============================================================ */

function selectPaper(paper) {
    if (!paper) {
        showEmptyDetail();
        return;
    }

    selectedPaperId =
        getPaperId(paper);

    renderPaperList();
    renderPaperDetail(paper);
}

/* ============================================================
   RENDER DETAIL
   ============================================================ */

function renderPaperDetail(paper) {
    if (!detailEmpty || !detailContent) {
        return;
    }

    detailEmpty.hidden = true;
    detailContent.hidden = false;

    const doi = getDOI(paper);

    detailContent.innerHTML = `
        <div class="paper-detail-header">

            <div class="paper-detail-id">
                ${escapeHtml(
                    getPaperId(paper)
                )}
            </div>

            <h2>
                ${escapeHtml(
                    getTitle(paper)
                )}
            </h2>

            <p class="paper-detail-authors">
                ${
                    escapeHtml(
                        getAuthors(paper) ||
                        "Authors not available"
                    )
                }
            </p>

            <div class="paper-detail-actions">

                ${
                    doi
                        ? `
                            <a
                                class="ui-button ui-button-primary"
                                href="${escapeAttribute(
                                    normalizeDoi(doi)
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View DOI
                            </a>
                          `
                        : ""
                }

                <button
                    type="button"
                    class="ui-button ui-button-danger"
                    id="deletePaperButton"
                >
                    Delete
                </button>

            </div>

        </div>

        <div class="paper-detail-body">

            <section class="paper-section">

                <div class="paper-section-title">
                    Bibliographic Information
                </div>

                <div class="paper-field-grid">

                    ${renderField(
                        "Year",
                        getYear(paper)
                    )}

                    ${renderField(
                        "Journal",
                        getJournal(paper)
                    )}

                    ${renderField(
                        "DOI",
                        doi
                    )}

                    ${renderField(
                        "Volume",
                        getVolume(paper)
                    )}

                    ${renderField(
                        "Issue",
                        getIssue(paper)
                    )}

                    ${renderField(
                        "Pages",
                        getPages(paper)
                    )}

                    ${renderField(
                        "Keywords",
                        getKeywords(paper)
                    )}

                    ${renderField(
                        "Research Area",
                        getResearchArea(paper)
                    )}

                    ${renderField(
                        "Material",
                        getMaterial(paper)
                    )}

                    ${renderField(
                        "Methodology",
                        getMethodology(paper)
                    )}

                    ${renderField(
                        "Experimental Conditions",
                        getExperimentalConditions(paper)
                    )}

                </div>

            </section>

            ${
                getAbstract(paper)
                    ? `
                        <section class="paper-section">

                            <div class="paper-section-title">
                                Abstract
                            </div>

                            <div class="paper-text">
                                ${escapeHtml(
                                    getAbstract(paper)
                                )}
                            </div>

                        </section>
                      `
                    : ""
            }

            ${
                getFullText(paper)
                    ? `
                        <section class="paper-section">

                            <div class="paper-section-title">
                                Full Text
                            </div>

                            <details class="paper-fulltext">

                                <summary>
                                    Show extracted full text
                                </summary>

                                <div class="paper-fulltext-content">
                                    ${escapeHtml(
                                        getFullText(paper)
                                    )}
                                </div>

                            </details>

                        </section>
                      `
                    : ""
            }

            ${renderAdditionalFields(paper)}

        </div>
    `;

    const deleteButton =
        document.getElementById(
            "deletePaperButton"
        );

    if (deleteButton) {
        deleteButton.addEventListener(
            "click",
            function () {
                deletePaper(
                    getPaperId(paper)
                );
            }
        );
    }
}

/* ============================================================
   FIELD
   ============================================================ */

function renderField(label, value) {
    const safeValue =
        String(value || "").trim();

    return `
        <div class="paper-field">

            <div class="paper-field-label">
                ${escapeHtml(label)}
            </div>

            <div class="paper-field-value ${
                safeValue
                    ? ""
                    : "is-empty"
            }">
                ${
                    safeValue
                        ? escapeHtml(safeValue)
                        : "Not available"
                }
            </div>

        </div>
    `;
}

/* ============================================================
   ADDITIONAL FIELDS
   ============================================================ */

function renderAdditionalFields(paper) {
    const known = new Set();

    const knownFields = [
        "id",
        "paper_id",
        "Paper_ID",
        "ID",

        "Title",
        "title",
        "Paper Title",

        "Authors",
        "Author",
        "authors",
        "author",

        "Year",
        "year",

        "Journal",
        "journal",

        "DOI",
        "doi",

        "Volume",
        "volume",

        "Issue",
        "issue",

        "Pages",
        "Page",
        "pages",

        "Keywords",
        "Keyword",
        "keywords",

        "Research Area",
        "Research_Area",
        "research_area",

        "Material",
        "material",

        "Methodology",
        "methodology",
        "Methods",
        "methods",

        "Experimental Conditions",
        "Experimental_Conditions",
        "experimental_conditions",

        "Abstract",
        "abstract",
        "Abstract Text",
        "Summary",

        "Full Text",
        "Full_Text",
        "full_text",
        "Text",
        "Extracted Text",
        "Extracted_Text",
        "Content",
        "text"
    ];

    knownFields.forEach(field => {
        known.add(normalizeKey(field));
    });

    const extraKeys =
        Object.keys(paper).filter(key => {
            return !known.has(
                normalizeKey(key)
            );
        });

    if (extraKeys.length === 0) {
        return "";
    }

    const fields = extraKeys
        .map(key => {
            const value =
                paper[key];

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {
                return "";
            }

            return renderField(
                prettifyLabel(key),
                String(value)
            );
        })
        .filter(Boolean)
        .join("");

    if (!fields) {
        return "";
    }

    return `
        <section class="paper-section">

            <div class="paper-section-title">
                Additional Information
            </div>

            <div class="paper-field-grid">
                ${fields}
            </div>

        </section>
    `;
}

/* ============================================================
   EMPTY DETAIL
   ============================================================ */

function showEmptyDetail() {
    if (!detailEmpty || !detailContent) {
        return;
    }

    detailEmpty.hidden = false;
    detailContent.hidden = true;

    selectedPaperId = null;
}

/* ============================================================
   DELETE
   ============================================================ */

function deletePaper(paperId) {
    if (!paperId) {
        return;
    }

    const paper =
        papers.find(
            item =>
                getPaperId(item) ===
                paperId
        );

    if (!paper) {
        return;
    }

    const title =
        getTitle(paper);

    const confirmed =
        window.confirm(
            `Delete "${title}" from your local library?`
        );

    if (!confirmed) {
        return;
    }

    papers =
        papers.filter(
            item =>
                getPaperId(item) !==
                paperId
        );

    try {
        localStorage.setItem(
            PAPER_STORAGE_KEY,
            JSON.stringify(papers)
        );
    } catch (error) {
        console.warn(
            "Gagal menyimpan perubahan ke LocalStorage:",
            error
        );
    }

    filteredPapers =
        filteredPapers.filter(
            item =>
                getPaperId(item) !==
                paperId
        );

    selectedPaperId = null;

    renderPaperCount();
    renderPaperList();

    if (filteredPapers.length > 0) {
        selectPaper(
            filteredPapers[0]
        );
    } else {
        showEmptyDetail();
    }
}

/* ============================================================
   DOI
   ============================================================ */

function normalizeDoi(value) {
    const text =
        String(value || "").trim();

    if (!text) {
        return "";
    }

    if (
        text.startsWith("http://") ||
        text.startsWith("https://")
    ) {
        return text;
    }

    return `https://doi.org/${text.replace(
        /^doi:\s*/i,
        ""
    )}`;
}

/* ============================================================
   LABEL
   ============================================================ */

function prettifyLabel(value) {
    return String(value || "")
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}

/* ============================================================
   ESCAPE
   ============================================================ */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

/* ============================================================
   PUBLIC API
   ============================================================ */

window.ResearchPaperManager = {
    reload: async function () {
        await loadPapers();

        filteredPapers = [...papers];

        renderPaperCount();
        renderPaperList();

        if (filteredPapers.length > 0) {
            selectPaper(
                filteredPapers[0]
            );
        } else {
            showEmptyDetail();
        }
    },

    getPapers: function () {
        return [...papers];
    }
};
