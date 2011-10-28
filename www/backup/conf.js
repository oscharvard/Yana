
// yana configuration file. except for css, this is all you should
// have to mess with.

// supported "types" for each section: rss, html, opensearch, favorites.
// for rss you can optionally specify cache and prefetch settings (will default do something otherwise)
// for rss need some way to specify how many levels to go if > 1. For example: Archives -> Issues -> Articles in an Issue
// question: how to pass images for rss list items? not sure yet.
// question: how to specify local fallback options if no network?
// question: all kinds of caching issues.

var YANA = {}; // but do not mess with this line

YANA.title = "PDR";

YANA.remoteUrl="";

{

    // configure each of the main yana sections.

    var pdr_news = {
	label: "PDR (News)",
	id: "pdr_news",
	type: "rss",
	img: "img/icons/book_24.png",
	url: "http://pdrjournal.org/blog.xml",
	truncate: 200,
	cache: 20,
	prefetch: 10
    };

    // question how do we support multi level menus? rss to issues to articles.
    var archive =  {
	label: "Archive",
	id: "archive",
	type: "rss",
	img: "img/icons/storage_24.png",
	url: "http://pdrjournal.org/yana/archive.xml",
    };

    var dash_hls= {
	label: "DASH (HLS)",
	id: "dash_hls",
	type: "rss",
	img: "img/icons/storage_24.png",
	url: "http://dash.harvard.edu/feed/rss_2.0/1/8"
    };

    // TODO: opensearch is going to take some extra work...
    var search =  {
	label: "Search",
	id: "search",
	type: "opensearch",
	img: "img/icons/magnifier_24.png",
	url: "http://pdrjournal.org/yana/opensearch"
    };

    // TODO: favorites are going to take some extra work...
    var favorites =  {
	label: "Favorites",
	id: "favorites",
	type: "favorites",
	img: "img/icons/star_24.png",
	webapp: false
    };

    var about = {
	label: "About",
	id: "about",
	type: "html",
	img: "img/icons/info_24.png",
	url: "http://thestudyhabit.org/about.html?hi"
    };

    var forAuthors = {
	label: "For Authors",
	id: "forAuthors",
	type: "html",
	img: "img/icons/pencil_24.png",
	url: "http://pdrjournal.org/yana/forAuthors.html"
    };

    var nytimes = {
	label: "NY Times (World)",
	id: "nytimes",
	type: "rss",
	img: "img/icons/link_24.png",
	url: "http://feeds.nytimes.com/nyt/rss/World"
    };
 
    var yahoo = {
	label: "Yahoo",
	id: "yahoo",
	type: "rss",
	img: "img/icons/speaker_24.png",
	url: "http://news.yahoo.com/rss/"
    };

    var pdr_current = {
	label: "PDR (Current Issue)",
	id: "pdr_current",
	type: "rss",
	img: "img/icons/speaker_24.png",
	url: "http://pdrjournal.org/currentissue.xml"
    };
   
    // which of the above sections do you want to list in the top content list?

    YANA.contentSections = [ pdr_current, pdr_news, dash_hls, archive, search, favorites ];

    // which of the above sections do you want to list in the bottom metadata list?

    YANA.metaSections = [ about, forAuthors, nytimes, yahoo ];

}