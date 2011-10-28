//Use this file to configure Yana for your journal. Here you can add, delete, and rename menu items. You can also replace any of the default icons. For each menu item, supported "types" are: rss, html, opensearch, and favorites.

var YANA = {}; // Do not change this line
YANA.title = "Yana Demo Journal";

YANA.sections = [
// Yana has two content sections, one on top of the other. The code immediately below starts the Top (content) section.
[{
    label: "Current Issue",
    type: "rss",
    img: "../yana/img/icons/CurrentIssueIcon.png",
    url: "http://osc.hul.harvard.edu/yana/currentissue.xml"
},

{
    label: "Archive",
    type: "rss",
    img: "../yana/img/icons/ArchiveIcon.png",
    url: "http://osc.hul.harvard.edu/sites/osc.hul.harvard.edu.yana/mobile/archive.xml",
    levels: 2
},

{
    label: "Search",
    type: "opensearch",
    img: "../yana/img/icons/SearchIcon.png",
    url: "http://osc.hul.harvard.edu/yana/opensearch/node/"
},

//Below is an example of an additional, custom menu item. You can add extra menu items to your journal's application by following this pattern. Note that the menu item below is not currently active; the code has been "commented out" (i.e., surrounded by characters that indicate it is inactive). Removing the surrounding "//" characters will activate the code. If your new menu item is not the last one in the section, be sure to add a comma after the closing curly brace.
//{
//    label: "Galleries",
//    type: "html",
//    img: "../yana/img/icons/magnifier_24.png",
//    url: "http://pdrjournal.org/mobile/galleries.html"
//},

{
    label: "Favorites",
    type: "favorites",
    img: "../yana/img/icons/FavoritesIcon.png",
}

],
// Stop Top (content) section.
// Start Bottom (metadata) section.
[

{
    label: "About",
    type: "html",
    img: "../yana/img/icons/AboutIcon.png",
    url: "http://osc.hul.harvard.edu/sites/osc.hul.harvard.edu.yana/mobile/aboutyana.html"
},

{
    label: "Announcements",
    type: "rss",
    img: "../yana/img/icons/AnnouncementsIcon.png",
    url: "http://osc.hul.harvard.edu/yana/announcements.xml"
},

{
    label: "For Authors",
    type: "html",
    img: "../yana/img/icons/AuthorIcon.png",
    url: "http://osc.hul.harvard.edu/sites/osc.hul.harvard.edu.yana/mobile/forAuthors.html"
},

{
    label: "Links",
    type: "html",
    img: "../yana/img/icons/LinksIcon.png",
    url: "http://osc.hul.harvard.edu/sites/osc.hul.harvard.edu.yana/mobile/yana_links.html"
}

]
// Stop Bottom (metadata) section.
];