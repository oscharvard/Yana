
// yana configuration file. except for css, this is all you should
// have to mess with.

// supported "types" for each section: rss, html, opensearch, favorites.
// for rss you can optionally specify cache and prefetch settings (will default do something otherwise)
// for rss need some way to specify how many levels to go if > 1. For example: Archives -> Issues -> Articles in an Issue
// question: how to pass images for rss list items? not sure yet.
// question: how to specify local fallback options if no network?
// question: all kinds of caching issues.

var YANA = {}; // but do not mess with this line

YANA.title = "DASH";

YANA.remoteUrl="";

{
    var featured = {
	label: "Featured",
	id: "featured",
	type: "rss",
	img: "../yana/img/icons/book_24.png",
	url: "http://osc.hul.harvard.edu/dash/features.xml"
    };

    var most_viewed = {
	label: "Most Viewed",
	id: "most_viewed",
	type: "rss",
	img: "../yana/img/icons/link_24.png",
	url: "http://dash.harvard.edu/feed/rss_2.0/1/8"
    };

    var recent = {
	label: "Recent",
	id: "recent",
	type: "rss",
	img: "../yana/img/icons/storage_24.png",
	url: "http://dash.harvard.edu/feed/rss_2.0/1/8"
    };

    // TODO: opensearch is going to take some extra work...
    var search =  {
	label: "Search",
	id: "search",
	type: "opensearch",
	img: "../yana/img/icons/magnifier_24.png",
	url: "http://dash.harvard.edu/open-search",
	sort_by: 2,
	order: "desc",
	rpp: 5
    };

    // TODO: favorites are going to take some extra work...
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
	img: "icons/dashicon.png",
	url: "http://osc.hul.harvard.edu/yanadash/about.html"
    };


    var news = {
	label: "News",
	id: "news",
	type: "rss",
	img: "../yana/img/icons/speaker_24.png",
	url: "http://osc.hul.harvard.edu/highlights/rss.xml"
    };


    var forAuthors = {
	label: "For Authors",
	id: "forAuthors",
	type: "html",
	img: "../yana/img/icons/pencil_24.png",
	url: "http://osc.hul.harvard.edu/yanadash/forAuthors.html"
    };
   
    // which of the above sections do you want to list in the top content list?

    YANA.contentSections = [ featured, most_viewed, recent, search, favorites ];

    // which of the above sections do you want to list in the bottom metadata list?

    YANA.metaSections = [ about, news, forAuthors ];

}