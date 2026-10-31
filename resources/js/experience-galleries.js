/*
 * Experience photo galleries
 * --------------------------
 * Keys match the id="" on each .experience-vertical-item in experiences.html.
 *
 * To add photos to an experience:
 *   1. Drop the files into  resources/images/experiences/<id>/
 *   2. List them below. The FIRST photo is the cover shown at the top of the
 *      card and as the header of the detail view; the rest form the gallery.
 *
 * Each photo can be a plain filename string, or an object for more control:
 *   "booth.jpg"
 *   { src: "booth.jpg", alt: "Presenting at the booth", caption: "Final demo day" }
 *   { src: "booth.jpg", thumb: "booth-small.jpg" }   // optional smaller grid image
 *
 * Filenames are relative to the experience's folder. Full paths (containing a
 * "/") are used as-is. Photos that fail to load are hidden automatically, and
 * experiences with an empty list simply show no photos.
 *
 * To add a new experience: give its card an id in experiences.html and add a
 * matching key here.
 */
window.EXPERIENCE_GALLERIES = {
    "samsat-pm": [],
    "polaris": [],
    "samsat-rd": [],
    "icr": [],
    "spring-research": [],
    "cosa-it": [],
    "accenture": [],
    "cosa-public-works": []
};
