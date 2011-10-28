// yana configuration file. except for css, this is all you should
// have to mess with.
// supported "types" for each section: rss, html, opensearch, favorites.

var YANA = {}; // but do not mess with this line
YANA.title = "Printer's Devil Review";

YANA.sections = [
// Start Top (content) section.
[{
    label: "Current Issue",
    type: "rss",
    img: "../yana/img/icons/book_24.png",
    url: "http://pdrjournal.org/currentissue.xml"
},

{
    label: "Archive",
    type: "rss",
    img: "../yana/img/icons/storage_24.png",
    url: "http://pdrjournal.org/mobile/archive.xml",
    levels: 2
},

{
    label: "Galleries",
    type: "html",
    img: "../yana/img/icons/magnifier_24.png",
    url: "http://pdrjournal.org/mobile/galleries.html"
},

{
    label: "Favorites",
    type: "favorites",
    img: "../yana/img/icons/star_24.png",
}

],
// Stop Top (content) section.
// Start Bottom (metadata) section.
[

{
    label: "About",
    type: "html",
    img: "icons/pdr_splat.png",
    url: "http://pdrjournal.org/mobile/about.html"
},

{
    label: "Blog",
    type: "rss",
    img: "../yana/img/icons/speaker_24.png",
    url: "http://pdrjournal.org/blog.xml"
},

{
    label: "For Authors",
    type: "html",
    img: "../yana/img/icons/pencil_24.png",
    url: "http://pdrjournal.org/mobile/forAuthors.html"
}

]
// Stop Bottom (metadata) section.
];