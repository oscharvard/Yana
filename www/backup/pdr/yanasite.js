
// yana configuration file. except for css, this is all you should
// have to mess with.

// supported "types" for each section: rss, html, opensearch, favorites.
// for rss you can optionally specify cache and prefetch settings (will default do something otherwise)
// for rss need some way to specify how many levels to go if > 1. For example: Archives -> Issues -> Articles in an Issue
// question: how to pass images for rss list items? not sure yet.
// question: how to specify local fallback options if no network?
// question: all kinds of caching issues.

var YANA = {}; // but do not mess with this line

YANA.title = "Printer's Devil Review";

YANA.remoteUrl="";

{
    var current = {
	label: "Current Issue",
	id: "current",
	type: "rss",
	img: "../yana/img/icons/book_24.png",
	url: "http://pdrjournal.org/currentissue.xml"
    };


    var archive = {
	label: "Archive",
	id: "archive",
	type: "rss",
	img: "../yana/img/icons/storage_24.png",
	url: "http://pdrjournal.org/mobile/archive.xml"
    };

	var galleries = {
	label: "Galleries",
	id: "galleries",
	type: "html",
	img: "../yana/img/icons/magnifier_24.png",
	url: "http://pdrjournal.org/mobile/galleries.html"
	};


//    var search =  {
//	label: "Search",
//	id: "search",
//	type: "opensearch",
//	img: "../yana/img/icons/magnifier_24.png",
//	webapp: false
//    };

    var favorites =  {
	label: "Favorites",
	id: "favorites",
	type: "favorites",
	img: "../yana/img/icons/star_24.png",
	webapp: false
    };

    var about = {
	label: "About",
	id: "about",
	type: "html",
	img: "icons/pdr_splat.png",
	url: "http://pdrjournal.org/mobile/about.html"
    };

    var news = {
	label: "Blog",
	id: "news",
	type: "rss",
	img: "../yana/img/icons/speaker_24.png",
	url: "http://pdrjournal.org/blog.xml"
    };

    var forAuthors = {
	label: "For Authors",
	id: "forAuthors",
	type: "html",
	img: "../yana/img/icons/pencil_24.png",
	url: "http://pdrjournal.org/mobile/forAuthors.html"
    };
   
    // which of the above sections do you want to list in the top content list?

    YANA.contentSections = [ current, archive, galleries, favorites ];

    // which of the above sections do you want to list in the bottom metadata list?

    YANA.metaSections = [ about, news, forAuthors ];

}