document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section[id]");
    const menuBtn = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-links");

    const analyzeBtn = document.getElementById("analyzeBtn");
    const loader = document.getElementById("loader");
    const result = document.getElementById("result");
    const loaderText = document.getElementById("loaderText");

    const resumeFile = document.getElementById("resumeFile");
    const fileName = document.getElementById("fileName");
    const uploadStatus = document.getElementById("uploadStatus");
    const roleSelect = document.getElementById("roleSelect");
    const uploadBox = document.querySelector(".upload-box");

    const scoreValue = document.getElementById("scoreValue");
    const scoreCircle = document.getElementById("scoreCircle");
    const strengthList = document.getElementById("strengthList");
    const improveList = document.getElementById("improveList");
    const keywordList = document.getElementById("keywordList");
    const missingList = document.getElementById("missingList");
    const formatList = document.getElementById("formatList");

    const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
    let lastScrollY = window.scrollY;

    const roleTemplates = {
        frontend: {
            score: 82,
            strengths: [
                "Strong JavaScript fundamentals",
                "Clear project structure",
                "UI-focused keywords present"
            ],
            improvements: [
                "Add testing frameworks (Jest)",
                "Quantify UI performance impact",
                "Highlight accessibility work"
            ],
            keywords: ["JavaScript", "React", "CSS", "REST APIs"],
            missing: ["Testing (Jest)", "Performance optimization"],
            formatIssues: ["Summary too long", "Inconsistent section titles"]
        },
        backend: {
            score: 79,
            strengths: [
                "Backend stack keywords present",
                "Clean experience section",
                "Relevant API work shown"
            ],
            improvements: [
                "Mention caching strategies",
                "Add database optimization results",
                "Include system design impact"
            ],
            keywords: ["Node.js", "APIs", "SQL", "Authentication"],
            missing: ["Caching (Redis)", "Monitoring tools"],
            formatIssues: ["Missing metrics in experience", "Tools section unclear"]
        },
        data: {
            score: 84,
            strengths: [
                "Analytics skills highlighted",
                "Tools listed clearly",
                "Projects align with role"
            ],
            improvements: [
                "Add dashboard impact metrics",
                "Mention SQL optimization",
                "Include data storytelling examples"
            ],
            keywords: ["SQL", "Python", "Dashboards", "Data Cleaning"],
            missing: ["A/B testing", "BI tools (Power BI)"],
            formatIssues: ["Project outcomes not quantified", "Skills section too broad"]
        }
    };

    const updateList = (listEl, items, prefix) => {
        listEl.innerHTML = "";
        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${prefix} ${item}`;
            listEl.appendChild(li);
        });
    };

    const updateReportLists = (listEl, items) => {
        listEl.innerHTML = "";
        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            listEl.appendChild(li);
        });
    };

    const setStatus = (message, type) => {
        uploadStatus.textContent = message;
        uploadStatus.className = `upload-status ${type}`;
    };

    const validateFile = (file) => {
        if (!file) {
            setStatus("Please choose a resume file before analyzing.", "error");
            return false;
        }

        const isValidExt = /\.(pdf|doc|docx)$/i.test(file.name);
        if (!isValidExt) {
            setStatus("Only PDF, DOC, or DOCX files are supported.", "error");
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            setStatus("File size exceeds 4.5 MB. Please upload a smaller file.", "error");
            return false;
        }

        return true;
    };

    const setActiveNavForPage = () => {
        const path = window.location.pathname.split("/").pop() || "index.html";
        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) {
                return;
            }
            const cleanHref = href.split("#")[0];
            if (cleanHref && cleanHref.endsWith(".html") && cleanHref === path) {
                link.classList.add("active");
            }
        });
    };

    /* =============================
       1) HIDE / SHOW NAVBAR ON SCROLL
    ============================== */
    window.addEventListener("scroll", () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            navbar.classList.add("nav-hidden");
        } else {
            navbar.classList.remove("nav-hidden");
        }
        lastScrollY = window.scrollY;
    });

    /* =============================
       2) ACTIVE LINK HIGHLIGHT
    ============================== */
    if (sections.length > 0) {
        window.addEventListener("scroll", () => {
            let current = "";

            sections.forEach((section) => {
                const sectionTop = section.offsetTop - 140;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${current}`) {
                    link.classList.add("active");
                }
            });
        });
    }

    /* =============================
       3) MOBILE MENU TOGGLE
    ============================== */
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("nav-open");
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (navMenu.classList.contains("nav-open")) {
                navMenu.classList.remove("nav-open");
            }
        });
    });

    if (resumeFile) {
        resumeFile.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) {
                fileName.textContent = "No file selected";
                setStatus("Ready to analyze your resume.", "neutral");
                return;
            }

            fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            if (validateFile(file)) {
                setStatus("File looks good. Click analyze to continue.", "success");
            }
        });
    }

    if (uploadBox && resumeFile) {
        const setDragState = (active) => {
            if (active) {
                uploadBox.classList.add("drag-active");
            } else {
                uploadBox.classList.remove("drag-active");
            }
        };

        ["dragenter", "dragover"].forEach((eventName) => {
            uploadBox.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                setDragState(true);
            });
        });

        ["dragleave", "drop"].forEach((eventName) => {
            uploadBox.addEventListener(eventName, (event) => {
                event.preventDefault();
                event.stopPropagation();
                setDragState(false);
            });
        });

        uploadBox.addEventListener("drop", (event) => {
            const file = event.dataTransfer.files[0];
            if (!file) {
                return;
            }
            resumeFile.files = event.dataTransfer.files;
            fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            if (validateFile(file)) {
                setStatus("File looks good. Click analyze to continue.", "success");
            }
        });
    }

    /* =============================
       4) ANALYZE FLOW (FRONTEND DEMO)
    ============================== */
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", () => {
            const file = resumeFile ? resumeFile.files[0] : null;
            if (!validateFile(file)) {
                return;
            }

            const role = roleSelect ? roleSelect.value : "frontend";
            const template = roleTemplates[role] || roleTemplates.frontend;

            loader.style.display = "block";
            loader.scrollIntoView({ behavior: "smooth" });

            loaderText.textContent = "Reading resume file...";
            setStatus("Analyzing your resume. Please wait...", "neutral");

            setTimeout(() => {
                loaderText.textContent = "Extracting text from resume...";
            }, 900);

            setTimeout(() => {
                loaderText.textContent = "Matching skills with ATS keywords...";
            }, 1800);

            setTimeout(() => {
                loaderText.textContent = "Generating analysis report...";
            }, 2700);

            setTimeout(() => {
                loader.style.display = "none";
                result.style.display = "block";

                scoreValue.textContent = `${template.score}%`;
                scoreCircle.style.background = `conic-gradient(#22c55e ${template.score}%, #e5e7eb 0)`;

                updateList(strengthList, template.strengths, "OK");
                updateList(improveList, template.improvements, "X");
                updateReportLists(keywordList, template.keywords);
                updateReportLists(missingList, template.missing);
                updateReportLists(formatList, template.formatIssues);

                result.scrollIntoView({ behavior: "smooth" });
                setStatus("Analysis complete. Review the report below.", "success");
            }, 3600);
        });
    }

    /* =============================
       5) DASHBOARD MOCK DATA
    ============================== */
    const recentList = document.getElementById("recentList");
    const trendGrid = document.getElementById("trendGrid");
    const reportsTable = document.getElementById("reportsTable");
    const avgScore = document.getElementById("avgScore");
    const reportCount = document.getElementById("reportCount");
    const lastCheck = document.getElementById("lastCheck");

    const mockReports = [
        { role: "Frontend", score: 82, keywords: "React, JS", created: "2 days ago" },
        { role: "Backend", score: 79, keywords: "Node, SQL", created: "5 days ago" },
        { role: "Data Analyst", score: 84, keywords: "SQL, Python", created: "1 week ago" },
        { role: "Frontend", score: 77, keywords: "UI, CSS", created: "2 weeks ago" }
    ];

    if (recentList && trendGrid && reportsTable) {
        recentList.innerHTML = "";
        mockReports.slice(0, 3).forEach((item) => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${item.role} Resume</span><strong>${item.score}%</strong>`;
            recentList.appendChild(li);
        });

        trendGrid.innerHTML = "";
        mockReports.forEach((item) => {
            const card = document.createElement("div");
            card.className = "trend-card";
            card.innerHTML = `
                <div>${item.role} - ${item.score}%</div>
                <div class="trend-bar"><span style="width:${item.score}%"></span></div>
            `;
            trendGrid.appendChild(card);
        });

        reportsTable.innerHTML = "";
        mockReports.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.role}</td>
                <td>${item.score}%</td>
                <td>${item.keywords}</td>
                <td>${item.created}</td>
            `;
            reportsTable.appendChild(row);
        });

        if (avgScore) {
            const total = mockReports.reduce((sum, item) => sum + item.score, 0);
            avgScore.textContent = `${Math.round(total / mockReports.length)}%`;
        }
        if (reportCount) {
            reportCount.textContent = mockReports.length.toString();
        }
        if (lastCheck) {
            lastCheck.textContent = mockReports[0].created;
        }
    }

    /* =============================
       6) REPORT PAGE UPDATE
    ============================== */
    const reportScore = document.getElementById("reportScore");
    const reportStrengths = document.getElementById("reportStrengths");
    const reportImprovements = document.getElementById("reportImprovements");
    const reportKeywords = document.getElementById("reportKeywords");
    const reportFormats = document.getElementById("reportFormats");

    if (reportScore && reportStrengths && reportImprovements) {
        const template = roleTemplates.frontend;
        reportScore.textContent = `${template.score}%`;
        updateReportLists(reportStrengths, template.strengths);
        updateReportLists(reportImprovements, template.improvements);
        updateReportLists(reportKeywords, template.keywords);
        updateReportLists(reportFormats, template.formatIssues);
    }

    /* =============================
       7) CONTACT FORM VALIDATION
    ============================== */
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
    if (contactForm && formStatus) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();

            if (!name || !email || !message) {
                formStatus.textContent = "Please complete all required fields.";
                formStatus.className = "form-status error";
                return;
            }

            formStatus.textContent = "Thanks! Your message has been sent (demo).";
            formStatus.className = "form-status success";
            contactForm.reset();
        });
    }

    /* =============================
       8) SCROLL REVEAL
    ============================== */
    const revealTargets = document.querySelectorAll("section, .dashboard-card, .report-card, .pricing-card, .contact-card, .trend-card, .list-cards li");
    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealTargets.forEach((el) => observer.observe(el));

    /* =============================
       9) PRINT REPORT
    ============================== */
    const printReportBtn = document.getElementById("printReportBtn");
    if (printReportBtn) {
        printReportBtn.addEventListener("click", () => {
            window.print();
        });
    }

    setActiveNavForPage();
});
