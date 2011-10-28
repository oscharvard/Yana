// yana configuration file. except for css, this is all you should
// have to mess with.
// supported "types" for each section: rss, html, opensearch, favorites.
var YANA = {}; // but do not mess with this line
YANA.title = "DASH";

YANA.sections = [
// Start Top (content) section.
[{
    label: "Featured",
    type: "rss",
    img: "../yana/img/icons/book_24.png",
    url: "http://osc.hul.harvard.edu/dash/features.xml"
},

{
    label: "Most Viewed",
    type: "rss",
    img: "../yana/img/icons/link_24.png",
    url: "http://dash.harvard.edu/feed/rss_2.0/1/8"
},

{
    label: "Recent",
    type: "rss",
    img: "../yana/img/icons/storage_24.png",
    url: "http://dash.harvard.edu/feed/rss_2.0/1/8"
},

{
    label: "Search",
    type: "opensearch",
    img: "../yana/img/icons/magnifier_24.png",
    url: "http://dash.harvard.edu/open-search/?sort_by=2&order=desc&rpp=5&format=rss&query="
},

{
    label: "Favorites",
    type: "favorites",
    img: "../yana/img/icons/star_24.png"
}],
// Stop Top (content) section.
// Start Bottom (metadata) section.
[{
    label: "About",
    type: "html",
    img: "icons/dashicon.png",
    url: "http://osc.hul.harvard.edu/yanadash/about.html"
},

{
    label: "News",
    id: "news",
    type: "rss",
    img: "../yana/img/icons/speaker_24.png",
    url: "http://osc.hul.harvard.edu/highlights/rss.xml"
},

{
    label: "For Authors",
    id: "forAuthors",
    type: "html",
    img: "../yana/img/icons/pencil_24.png",
    url: "http://osc.hul.harvard.edu/yanadash/forAuthors.html"
}]
// Stop Bottom (metadata) section.
];