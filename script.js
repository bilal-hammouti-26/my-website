document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // Éléments HTML
    const html = document.documentElement;
    const body = document.body;

    const themeToggle = document.getElementById("themeToggle");
    const menuToggle = document.getElementById("menuToggle");

    // Le code accepte les deux noms de menu
    const navbar =
        document.getElementById("mainNav") ||
        document.getElementById("navbar");

    const contactForm = document.getElementById("contactForm");
    const formMessage =
        document.getElementById("formNote") ||
        document.getElementById("formMessage");

    const yearElement = document.getElementById("year");

    /* =====================================================
       1. THÈME JOUR / NUIT
    ===================================================== */

    const THEME_KEY = "portfolio-theme";

    function getSavedTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);

            if (saved === "day" || saved === "night") {
                return saved;
            }
        } catch (error) {
            // Le site fonctionne aussi sans localStorage.
        }

        // Compatibilité avec l'ancien thème CSS
        if (body.classList.contains("day-theme")) {
            return "day";
        }

        return html.dataset.theme === "day" ? "day" : "night";
    }

    function setTheme(theme) {
        const selectedTheme = theme === "day" ? "day" : "night";

        // Compatible avec le CSS utilisant data-theme
        html.dataset.theme = selectedTheme;

        // Compatibilité avec l'ancien CSS utilisant day-theme
        body.classList.toggle("day-theme", selectedTheme === "day");

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                selectedTheme === "night"
                    ? "Activer le thème jour"
                    : "Activer le thème nuit"
            );

            themeToggle.setAttribute(
                "aria-pressed",
                String(selectedTheme === "day")
            );

            // Conserve le texte existant si le bouton contient une icône
            if (themeToggle.dataset.themeLabel === "true") {
                themeToggle.textContent =
                    selectedTheme === "night" ? "☀️ Jour" : "🌙 Nuit";
            }
        }

        const themeMeta = document.querySelector(
            'meta[name="theme-color"]'
        );

        if (themeMeta) {
            themeMeta.content =
                selectedTheme === "night" ? "#031326" : "#e8edf3";
        }

        try {
            localStorage.setItem(THEME_KEY, selectedTheme);
        } catch (error) {
            // La sauvegarde est facultative.
        }
    }

    setTheme(getSavedTheme());

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme =
                html.dataset.theme === "night" ? "day" : "night";

            setTheme(nextTheme);
        });
    }

    /* =====================================================
       2. MENU RESPONSIVE
    ===================================================== */

    function closeMenu() {
        if (navbar) {
            navbar.classList.remove("open");
        }

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Ouvrir le menu");

            // Ne change pas automatiquement le contenu du bouton.
            // Cela évite de supprimer une icône définie dans le HTML.
        }
    }

    if (menuToggle && navbar) {
        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.addEventListener("click", () => {
            const isOpen = navbar.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Fermer le menu" : "Ouvrir le menu"
            );
        });

        navbar.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                closeMenu();
            });
        });

        // Fermeture avec la touche Échap
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
                closeDocumentsModal();
            }
        });

        // Fermeture en cliquant à l'extérieur
        document.addEventListener("click", (event) => {
            if (
                navbar.classList.contains("open") &&
                !navbar.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        // Fermeture lors du retour au grand écran
        window.addEventListener("resize", () => {
            if (window.innerWidth > 760) {
                closeMenu();
            }
        });
    }

    /* =====================================================
       3. ANIMATIONS AU DÉFILEMENT
    ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }

    /* =====================================================
       4. NAVIGATION ACTIVE
    ===================================================== */

    if (navbar) {
        const navLinks = navbar.querySelectorAll('a[href^="#"]');
        const sections = document.querySelectorAll("main section[id]");

        function setActiveLink(sectionId) {
            navLinks.forEach((link) => {
                const active =
                    link.getAttribute("href") === "#" + sectionId;

                link.classList.toggle("active", active);

                if (active) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                const sectionId = link.getAttribute("href").slice(1);
                setActiveLink(sectionId);
            });
        });

        if ("IntersectionObserver" in window) {
            const sectionObserver = new IntersectionObserver(
                (entries) => {
                    const visibleSections = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort(
                            (a, b) =>
                                b.intersectionRatio - a.intersectionRatio
                        );

                    if (visibleSections.length > 0) {
                        setActiveLink(visibleSections[0].target.id);
                    }
                },
                {
                    rootMargin: "-20% 0px -65% 0px",
                    threshold: [0, 0.1, 0.25, 0.5]
                }
            );

            sections.forEach((section) => {
                sectionObserver.observe(section);
            });
        }
    }

    /* =====================================================
       5. ANNÉE AUTOMATIQUE
    ===================================================== */

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    /* =====================================================
       6. FORMULAIRE DE CONTACT
       Ouvre l'application e-mail configurée.
    ===================================================== */

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const formData = new FormData(contactForm);

            const name = String(formData.get("name") || "").trim();
            const email = String(formData.get("email") || "").trim();
            const subject = String(
                formData.get("subject") || "Contact depuis mon portfolio"
            ).trim();
            const message = String(
                formData.get("message") || ""
            ).trim();

            if (!name || !email || !subject || !message) {
                if (formMessage) {
                    formMessage.textContent =
                        "Veuillez remplir tous les champs obligatoires.";
                }
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                if (formMessage) {
                    formMessage.textContent =
                        "Veuillez saisir une adresse e-mail valide.";
                }
                return;
            }

            const recipient = "bilal.hammoutii.05@gmail.com";

            const emailBody =
                "Bonjour Bilal,\n\n" +
                message +
                "\n\nNom : " + name +
                "\nE-mail : " + email;

            const mailtoLink =
                "mailto:" + recipient +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(emailBody);

            if (formMessage) {
                formMessage.textContent =
                    "Votre application e-mail va s'ouvrir. " +
                    "Vérifiez le message puis cliquez sur Envoyer.";
            }

            window.location.href = mailtoLink;
        });
    }

    /* =====================================================
       7. DOCUMENTS PDF, WORD ET POWERPOINT
       Dossiers GitHub :
       documents/carte-01/
       documents/carte-02/
       documents/carte-03/
    ===================================================== */

    const documentsModal = document.getElementById("documentsModal");
    const documentsList = document.getElementById("documentsList");

    // IMPORTANT :
    // Remplace ces valeurs par le propriétaire et le dépôt GitHub
    // réels de ton portfolio.
    const GITHUB_OWNER = "TON-NOM-GITHUB";
    const GITHUB_REPO = "TON-DEPOT";

    const documentFolders = {
        "carte-01": "documents/carte-01",
        "carte-02": "documents/carte-02",
        "carte-03": "documents/carte-03"
    };

    const allowedExtensions = [
        "pdf", "doc", "docx", "odt", "rtf",
        "ppt", "pptx", "odp"
    ];

    function closeDocumentsModal() {
        if (documentsModal) {
            documentsModal.classList.remove("open");
            documentsModal.setAttribute("aria-hidden", "true");
        }
    }

    function openDocumentsModal() {
        if (documentsModal) {
            documentsModal.classList.add("open");
            documentsModal.setAttribute("aria-hidden", "false");
        }
    }

    function getExtension(filename) {
        const parts = filename.split(".");
        return parts.length > 1
            ? parts.pop().toLowerCase()
            : "";
    }

    function getDocumentType(extension) {
        if (extension === "pdf") return "PDF";
        if (["doc", "docx", "odt", "rtf"].includes(extension)) {
            return "Word";
        }
        return "PowerPoint";
    }

    async function loadDocuments(cardId) {
        if (!documentsList) return;

        const folder = documentFolders[cardId];

        if (!folder) {
            documentsList.textContent = "Carte de documents inconnue.";
            return;
        }

        if (
            GITHUB_OWNER === "TON-NOM-GITHUB" ||
            GITHUB_REPO === "TON-DEPOT"
        ) {
            documentsList.textContent =
                "Configure le nom du propriétaire et du dépôt GitHub " +
                "dans script.js pour charger les documents.";
            return;
        }

        documentsList.textContent = "Chargement des documents…";
        openDocumentsModal();

        const apiURL =
            "https://api.github.com/repos/" +
            encodeURIComponent(GITHUB_OWNER) + "/" +
            encodeURIComponent(GITHUB_REPO) +
            "/contents/" + folder.split("/").map(encodeURIComponent).join("/");

        try {
            const response = await fetch(apiURL, {
                headers: { Accept: "application/vnd.github+json" }
            });

            if (!response.ok) {
                throw new Error("Dossier inaccessible");
            }

            const files = await response.json();

            if (!Array.isArray(files)) {
                throw new Error("Le chemin ne correspond pas à un dossier");
            }

            const documents = files.filter((file) => {
                return file.type === "file" &&
                    allowedExtensions.includes(getExtension(file.name));
            });

            documentsList.replaceChildren();

            if (documents.length === 0) {
                documentsList.textContent =
                    "Aucun document PDF, Word ou PowerPoint dans ce dossier.";
                return;
            }

            documents.forEach((file) => {
                const extension = getExtension(file.name);
                const item = document.createElement("div");
                item.className = "document-item";

                const title = document.createElement("span");
                title.textContent =
                    getDocumentType(extension) + " — " + file.name;

                const link = document.createElement("a");
                link.href = file.download_url || file.html_url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent =
                    extension === "pdf" ? "Ouvrir" : "Télécharger";

                item.append(title, link);
                documentsList.appendChild(item);
            });
        } catch (error) {
            documentsList.textContent =
                "Impossible de charger les documents. Vérifie le dépôt, " +
                "le nom du dossier et la connexion Internet.";
        }
    }

    // Boutons HTML possibles :
    // <button data-documents="carte-01">Documents</button>
    // <button data-documents="carte-02">Documents</button>
    // <button data-documents="carte-03">Documents</button>

    document.querySelectorAll("[data-documents]").forEach((button) => {
        button.addEventListener("click", () => {
            loadDocuments(button.dataset.documents);
        });
    });

    // Fermeture en cliquant sur l'arrière-plan
    if (documentsModal) {
        documentsModal.addEventListener("click", (event) => {
            if (event.target === documentsModal) {
                closeDocumentsModal();
            }
        });

        const closeButton = documentsModal.querySelector(
            "[data-close-documents]"
        );

        if (closeButton) {
            closeButton.addEventListener("click", closeDocumentsModal);
        }
    }

});

// ===== كيقرا الملفات أوتوماتيك =====
async function openDocs(carteNum, type){
  const folderPath = `documents/carte${carteNum}/${type}`;
  const apiUrl = `https://api.github.com/repos/bilal-hammouti-26/my-website/contents/${folderPath}?ref=main`;
  
  document.getElementById('smallBarTitle').innerText = `${type.toUpperCase()} - Carte ${carteNum}`;
  document.getElementById('docList').innerHTML = `<p style="color:#fff; text-align:center;">⏳ ...</p>`;
  document.getElementById('smallBarModal').style.display = "block";
  document.body.style.overflow = "hidden";

  let files = [];
  try{
    const res = await fetch(apiUrl);
    if(!res.ok) throw new Error();
    const data = await res.json();
    files = data.filter(f=>f.type==='file' && f.name !== '.gitkeep' && !f.name.startsWith('.')).map(f=>{
      const pagesUrl = `https://bilal-hammouti-26.github.io/my-website/${folderPath}/${encodeURIComponent(f.name)}`;
      return {name:f.name, url: pagesUrl};
    });
  }catch(e){
    document.getElementById('docList').innerHTML = `<p style="color:#ff8; padding:15px; text-align:center;">📭 vide</p>`;
    return;
  }

  if(files.length===0){
    document.getElementById('docList').innerHTML = `<p style="color:#fff; text-align:center;">📭 vide</p>`;
    return;
  }

  const list = document.getElementById('docList');
  list.innerHTML = "";
  files.forEach(f=>{
    const row = document.createElement('div');
    row.className = "doc-row";
    const cleanName = f.name.replace('.pdf','').replace('.docx','').replace('.pptx','').replace(/_/g,' ');
    row.innerHTML = `<div class="doc-name">📄 ${cleanName}</div><button class="btn-voir">Voir</button>`;
    row.querySelector('.btn-voir').onclick = () => openPdfFull(f.name, f.url, type);
    list.appendChild(row);
  });
}

// ===== هادي هي اللي بدلناها باش PDF يتقرا ماشي يتحمل =====
function openPdfFull(name, url, type){
  document.getElementById('pdfFullTitle').innerText = name;
  const frame = document.getElementById('pdfFullFrame');

  let viewerUrl = '';
  
  // إلى كان PDF خليه بالقارئ القديم ديال Mozilla
  if(name.toLowerCase().endsWith('.pdf')){
      viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
  } 
  // إلى كان PPT ولا WORD خدم بقارئ ديال مايكروسوفت
  else {
      viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }
  
  frame.src = viewerUrl;

  document.getElementById('pdfFullModal').style.display = "flex";
  document.getElementById('smallBarModal').style.display = "none";
}
function closeSmallBar(){ document.getElementById('smallBarModal').style.display="none"; document.body.style.overflow="auto"; }
function closePdfFull(){ document.getElementById('pdfFullModal').style.display="none"; document.getElementById('pdfFullFrame').src=""; document.body.style.overflow="auto"; }

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.project-card').forEach(card=>{
    const numEl=card.querySelector('.project-number'); if(!numEl) return;
    const carteNum=numEl.textContent.trim();
    card.querySelectorAll('.file-button').forEach(btn=>{
      let type='pdf'; if(btn.classList.contains('word')) type='word'; if(btn.classList.contains('ppt')) type='ppt';
      btn.addEventListener('click',e=>{ e.preventDefault(); openDocs(carteNum,type); });
    });
  });
});



