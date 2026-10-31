/*
 * Experience detail view: cover photo on each card, a modal with the full
 * write-up and photo gallery, and a full-screen lightbox.
 * Photo lists live in experience-galleries.js. Without JS, the <details>
 * dropdown on each card still works.
 */
(function () {
    "use strict";

    var IMAGE_ROOT = "resources/images/experiences/";
    var galleries = window.EXPERIENCE_GALLERIES || {};

    function normalizePhotos(id) {
        var list = galleries[id] || [];
        return list.map(function (p) {
            var photo = typeof p === "string" ? { src: p } : Object.assign({}, p);
            var resolve = function (f) {
                return f && f.indexOf("/") === -1 ? IMAGE_ROOT + id + "/" + f : f;
            };
            photo.src = resolve(photo.src);
            photo.thumb = resolve(photo.thumb) || photo.src;
            photo.alt = photo.alt || photo.caption || "";
            return photo;
        }).filter(function (p) { return p.src; });
    }

    function el(tag, className, attrs) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
        return node;
    }

    function photoImg(src, alt, className, onMissing) {
        var img = el("img", className, { src: src, alt: alt, loading: "lazy", decoding: "async" });
        img.addEventListener("error", onMissing);
        return img;
    }

    /* ---------- Lightbox ---------- */

    var lightbox = el("dialog", "experience-lightbox", { "aria-label": "Photo viewer" });
    lightbox.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="Close photo">&times;</button>' +
        '<button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous photo">&#8249;</button>' +
        '<figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>' +
        '<button type="button" class="lightbox-nav lightbox-next" aria-label="Next photo">&#8250;</button>';
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector("figcaption");
    var lbPhotos = [];
    var lbIndex = 0;

    function showLightboxPhoto(i) {
        lbIndex = (i + lbPhotos.length) % lbPhotos.length;
        var p = lbPhotos[lbIndex];
        lbImg.src = p.src;
        lbImg.alt = p.alt;
        var counter = lbPhotos.length > 1 ? (lbIndex + 1) + " / " + lbPhotos.length : "";
        lbCaption.textContent = [p.caption, counter].filter(Boolean).join("  ·  ");
        lightbox.classList.toggle("single", lbPhotos.length < 2);
    }

    function openLightbox(photos, i) {
        lbPhotos = photos;
        showLightboxPhoto(i);
        if (!lightbox.open) lightbox.showModal();
    }

    lightbox.querySelector(".lightbox-close").addEventListener("click", function () { lightbox.close(); });
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { showLightboxPhoto(lbIndex - 1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { showLightboxPhoto(lbIndex + 1); });
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) lightbox.close();
    });
    lightbox.addEventListener("keydown", function (e) {
        if (lbPhotos.length < 2) return;
        if (e.key === "ArrowLeft") showLightboxPhoto(lbIndex - 1);
        if (e.key === "ArrowRight") showLightboxPhoto(lbIndex + 1);
    });

    /* ---------- Detail modal ---------- */

    var modal = el("dialog", "experience-modal", { "aria-labelledby": "experience-modal-title" });
    modal.innerHTML =
        '<button type="button" class="experience-modal-close" aria-label="Close">&times;</button>' +
        '<div class="experience-modal-hero"></div>' +
        '<div class="experience-modal-body">' +
        '  <h3 id="experience-modal-title"></h3>' +
        '  <p class="experience-date"></p>' +
        '  <div class="experience-modal-description"></div>' +
        '  <section class="experience-modal-gallery">' +
        '    <h4>Gallery</h4>' +
        '    <div class="experience-gallery-grid"></div>' +
        '  </section>' +
        '</div>';
    var modalHero = modal.querySelector(".experience-modal-hero");
    var modalTitle = modal.querySelector("h3");
    var modalDate = modal.querySelector(".experience-date");
    var modalDesc = modal.querySelector(".experience-modal-description");
    var modalGallery = modal.querySelector(".experience-modal-gallery");
    var modalGrid = modal.querySelector(".experience-gallery-grid");

    // Missing files are removed so the lightbox doesn't step onto them
    function dropPhoto(photos, photo) {
        var i = photos.indexOf(photo);
        if (i !== -1) photos.splice(i, 1);
    }

    function openModal(item) {
        var photos = normalizePhotos(item.id);
        var details = item.querySelector(".experience-details-content");

        modalTitle.textContent = item.querySelector("h3").textContent;
        modalDate.textContent = (item.querySelector(".experience-date") || {}).textContent || "";
        modalDesc.innerHTML = details ? details.innerHTML : "";

        // Header photo
        modalHero.innerHTML = "";
        modalHero.hidden = photos.length === 0;
        if (photos.length) {
            var cover = photos[0];
            var hero = photoImg(cover.src, cover.alt, "", function () {
                modalHero.hidden = true;
                dropPhoto(photos, cover);
            });
            var heroBtn = el("button", "experience-photo-btn", { type: "button", "aria-label": "View photo full size" });
            heroBtn.appendChild(hero);
            heroBtn.addEventListener("click", function () { openLightbox(photos, photos.indexOf(cover)); });
            modalHero.appendChild(heroBtn);
        }

        // Gallery: everything after the cover
        modalGrid.innerHTML = "";
        photos.slice(1).forEach(function (p) {
            var btn = el("button", "experience-photo-btn", { type: "button", "aria-label": "View photo full size" });
            btn.appendChild(photoImg(p.thumb, p.alt, "", function () {
                btn.remove();
                dropPhoto(photos, p);
                modalGallery.hidden = !modalGrid.children.length;
            }));
            btn.addEventListener("click", function () { openLightbox(photos, photos.indexOf(p)); });
            modalGrid.appendChild(btn);
        });
        modalGallery.hidden = photos.length < 2;

        modal.scrollTop = 0;
        modal.showModal();
        history.replaceState(null, "", "#" + item.id);
    }

    modal.querySelector(".experience-modal-close").addEventListener("click", function () { modal.close(); });
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
    modal.addEventListener("close", function () {
        history.replaceState(null, "", location.pathname + location.search);
    });

    /* ---------- Cards ---------- */

    function enhanceCard(item) {
        var photos = normalizePhotos(item.id);
        var summary = item.querySelector(".experience-details summary");

        var count = null;

        if (photos.length) {
            var cover = el("button", "experience-cover experience-photo-btn", { type: "button", "aria-label": "View photos" });
            cover.appendChild(photoImg(photos[0].src, photos[0].alt, "", function () {
                cover.remove();
                item.classList.remove("has-cover");
                if (count) count.remove();
            }));
            cover.addEventListener("click", function () { openModal(item); });
            item.insertBefore(cover, item.firstChild);
            item.classList.add("has-cover");

            if (summary) {
                count = el("span", "photo-count");
                count.textContent = photos.length + (photos.length === 1 ? " photo" : " photos");
                summary.appendChild(count);
            }
        }

        if (summary) {
            summary.addEventListener("click", function (e) {
                e.preventDefault();
                openModal(item);
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.body.appendChild(modal);
        document.body.appendChild(lightbox);

        var items = document.querySelectorAll(".experiences .experience-vertical-item[id]");
        Array.prototype.forEach.call(items, enhanceCard);

        // Deep link: experiences.html#polaris opens that experience
        var target = location.hash && document.getElementById(location.hash.slice(1));
        if (target && target.classList.contains("experience-vertical-item")) openModal(target);
    });
})();
