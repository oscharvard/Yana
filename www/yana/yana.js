$(document).ready(function () {
	// set up yana when the page is first loaded.
	// todo: should be smarter about regenerating state from dynamic urls with parameters to support deep linking.
	//alert("ready!");
	YANA.sectionById = {};
	$("#homeHeader").html("<h1>" + YANA.title + "</h1>");
	YANA.initializeSections("homeSection1List", YANA.sections[0]);
	YANA.initializeSections("homeSection2List", YANA.sections[1]);
	YANA.initFavorites();
    });


$(document).bind( "pagebeforechange", function( e, data ) {
	// Dynamically generate pages based or url arguments. A surprising pain.
	// Lifted from http://jquerymobile.com/test/docs/pages/page-dynamic.html
	// Listen for any attempts to call changePage().
	// Reinhard: TODO: also regenerate overwritten pages? Or can we circumvent this?
	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by URL.
	if ( typeof data.toPage === "string" ) {
	    var u = $.mobile.path.parseUrl( data.toPage ),
		re = /^#.*\?/;
	    //alert("reinos: pagebeforechange: " + u.hash);
	    //alert("amplify.store():  " + YANA.dump(amplify.store()));
	    if ( u.hash.search(re) !== -1 ) {
		// TODO: we need to be able to get data for article and subsection display.
		var params       = YANA.extractUrlParams(u.hash),
		    sectionId    = params['s'] ? params['s'] : null,
		    articleIndex = params['c'] ? params['c'] : null, // todo: should be article id.
		    level      = params['l'] ? params['l'] : null;
		YANA.regenerateNavState(sectionId,articleIndex,level,function() {
			//alert("Display callback!");
			if ( u.hash.search(/^#articlePage?/) !== -1 ){
			    // generate article page based on query parameters.
			    YANA.showArticleAtIndex(sectionId,articleIndex,level);
			} else if ( u.hash.search(/#subSectionPage?/) !== -1 ) {
			    //alert("Uh-oh. Subsection... this will probably break.");
			    // generate rss subsection page based on query parameters.
			    var section    = YANA.sectionById[sectionId],
				subSection = section.subSections[level-2],
				article    = section.articles[articleIndex]; // todo: need parent, not root section for > 2 levels.
			    YANA.insertRemoteRss(subSection,article.link,level,"#subSectionList");
			    $("#subSectionHeader h1").html(article.title);
			    YANA.updateButton('#subSectionParentLink', subSection.parent.label, "#" + subSection.parent.id + "Page");
			}
		    });
		// not 100% sure why we have to comment this out from example code, but we do.
		//e.preventDefault();
	    } else {
		//alert("GAGA: " + u.hash);
		//YANA.forceJQMRefresh(u.hash);
		// really irritating that this is necessary -- and we lose round rects.
		var listId = u.hash.replace("Page","List");
		//alert("GAGA: " + u.hash + " listId: " + listId);
		YANA.refreshListView(listId);
	    }
	}
    });

YANA.regenerateNavState = function(sectionId,articleIndex,level,displayCallback){
    // fetch any rss feeds we need to show the given article or subsection.
    // then update the display via a callback method.
    // problem: totally broken for subsections.
    //alert("Regenerate Nav State!");
    var section    = YANA.sectionById[sectionId];
    if ( level && level > 1 ) {
	section = section.subSections[level-2];
    }
    // Do we have the rss for the subsection? If not, request it and all intervening subsections.
    if (  ( (!section.hasOwnProperty('articles')) || section.articles.length === 0 )) {
	//alert("No articles found in section. Retrieving RSS articles for this section...");
	YANA.insertRemoteRss(section,null,null,null,displayCallback);
    } else {
	//alert("We already have the articles. No RSS.");
	displayCallback();
    }
};

YANA.extractUrlParams = function(url){
    // given a url, return a map of key = value pairs for query string.
    var params = {};
    var kvpairs = url.split("?")[1].split("&");
    for (var i=0;i<kvpairs.length;i++) {
        var pair = kvpairs[i].split("=");
	params[pair[0]]= decodeURIComponent(pair[1]);
    }
    return params;
};

YANA.initializeSections = function (listId, sections) {
    // generate html, listeners, and id lookup map for each section.
    var sectionTypeCount = {};
    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
	sectionTypeCount[s.type]++;
	if ( s.type == "favorites" ) {
	    if ( sectionTypeCount[s.type] > 1 ) {
		throw "Configuration error: There can only be one favorites section.";
	    }
	    s.id= s.type;
	} else {
	    s.id = s.id ? s.id : YANA.label2id(s.label);
	}
	if (s.levels > 1) {
	    YANA.addSubSections(s);
	}
        YANA.sectionById[s.id] = s;
        $("#" + listId).append('<li><a href="#' + s.id + 'Page"><img src="' + s.img + '" alt="' + s.label + '" class="ui-li-icon"></img>' + s.label + '</a></li>');
        $('body').append(YANA.buildPageHtml(s));
        YANA.addPageCreateHandler(s);
    }
};

YANA.addSubSections = function(section){
    // for multi-level sections, create child section objects. Hacky. Refactor.
    var clone = jQuery.extend(true, {}, section);
    section.subSections=[];
    for(var i=2; i <= section.levels; i++ ) {
	var subSection =  jQuery.extend(true, {}, clone);
	subSection.level = i;
	section.subSections.push(subSection);
	subSection.parent = i == 2 ? section : section.subSections[i-1];
    }
};

YANA.label2id = function(label){
    // generate a default id based on label.  
    return label.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
	    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
	}).replace(/\s+/g, '');
};

YANA.buildPageHtml = function (section) {
    // generate html for a given section.
    var html = '<section data-role="page" id="' + section.id + 'Page">';
    html += '<header data-role="header" id="' + section.id + 'Header">';
    html += '<h1>' + section.label + '</h1>';
    html += '<a href="#homePage" data-icon="home" data-iconpos="left" data-direction="reverse" class="ui-btn-right">Home</a>';
    html += '</header>';
    html += '<section data-role="content" class="' + section.type + 'Content" id="' + section.id + 'Content">';
    if (section.type === 'rss' || section.type === 'favorites') {
        var listId = section.id + "List";
        html += '<ul data-role="listview" data-inset="true" id="' + listId + '"><li></li></ul>';
    }
    html += '</section></section>';
    return html;
};

YANA.addPageCreateHandler = function (section) {
    // remember what this does and comment here -- looks important!
    $('#' + section.id + "Page").live('pagecreate', function (event) {
        if (section.type === "rss") {
            YANA.insertRemoteRss(section);
        } else if (section.type === "html") {
            YANA.insertRemoteHtml(section);
        } else if (section.type === "opensearch") {
            YANA.insertOpenSearch(section)
        } else if (section.type === "favorites") {
            YANA.insertFavorites(section);
        } else {
            alert("unsupported section type: " + section.type);
        }
    });
};

YANA.dump = function(object) {
    // Json dump that doesn't get freaked out by circular references etc.
    //http://www.thomasfrank.se/json_stringify_revisited.html
    JSONstring.compactOutput=false;     
    JSONstring.includeProtos=false;     
    JSONstring.includeFunctions=false;     
    JSONstring.detectCirculars=true;          
    JSONstring.restoreCirculars=false;
    return JSONstring.make(object);
};

YANA.getArticle = function(section,articleId){
    // todo: hide all this article index crap. replace with ids. but how to handle multi-level section articles?
};

YANA.updateButton = function(id,label,url) {
    // deep magic to refresh the back to parent button. could probably be pruned.
    if ($(id+' .ui-btn-text').html()) {
        $(id+' .ui-btn-text').html(label);
    } else {
	$(id).text(label);
    }
    $('#articleParentLink').attr("href", url);
};

YANA.listArticle = function(listId,article){
    // todo: problem with favorites. It remembers the original article sectioning which may not be current, may be expired, etc.
    // solution: let's transfer the article from its original section to the favorites section.
    var html = "<li><a href='"+article.listItemLink+"'>" + article.thumbnailHtml + "<h3>" + article.title + "</h3><p>" + article.preview + "</p></a></li>";
    $(listId).append(html);
};

YANA.refreshCurrentArticle = function(){
    YANA.showArticle(YANA.currentArticle,YANA.currentSection,YANA.currentLevel);
};

YANA.showArticleAtIndex = function(sectionId,articleIndex, level){
    // populate article page based on rss article info.
    //alert("Show article at index:" + articleIndex);
    var section = YANA.sectionById[sectionId];
    //alert("got section name: " + section.label);
    if ( ! section ) {
	//alert("no section found for sectionId: " + sectionId);
	section = YANA.sectionById["favorites"];
    }
    if ( level && level > 1 ) {
	section = section.subSections[level-2];
    }
    if (  ( (!section.hasOwnProperty('articles')) || section.articles.length === 0 )) {
	alert("Error: no articles found in section.");
    }
    var article = section.articles[articleIndex];
    if ( ! article ) {
	alert("Error: no article found at index: " + articleIndex);
    }
    YANA.showArticle(article,section,level); 
};

YANA.showArticle = function (article,section,level){
    if ( article === null ) {
	alert("No article!");
    }
    //alert("got article!");
    $('#articleContent').html();
    YANA.currentArticle = article;
    YANA.currentSection = section;
    YANA.currentLevel   = level;
    YANA.updateButton( "#articleParentLink", section.label,"#" + section.id + "Page");
    var moreHtml = '<hr /><span id="articleLinks">';
    var buttonCount=0;
    var buttonId;
    for (var i = 0; i < article.enclosures.length; i++) {
        var e = article.enclosures[i];
        // todo: base label on type.
        var label = "PDF";
	buttonCount++;
	buttonId = 'articleLinkButton' + buttonCount;
	moreHtml += YANA.addArticleLinkButton(buttonId,e.url,label)
    }
    buttonCount++;
    buttonId = 'articleLinkButton' + buttonCount;
    YANA.clearButton(buttonId);
    moreHtml += YANA.addArticleLinkButton(buttonId,article.link,"Web");
    var titleHtml = "<h3>" + article.title + "</h3>";
    moreHtml += YANA.addFavoritesButton(article);
    $('#articleContent').html(titleHtml + article.html + moreHtml);
    var absolutizeUrls = function (index, attr) {
	if ( $.mobile.path.isAbsoluteUrl(attr) ) {
	    return attr;
	} else {
	    return $.mobile.path.makeUrlAbsolute(attr,section.url);
	}
    };
    $("#articleContent img").attr("src", absolutizeUrls);
    $("#articleContent a").attr("href", absolutizeUrls);
    YANA.refreshPage("#articleContent");
};

YANA.refreshPage = function(selector) {
    // jqm deep magic. no idea why this is sometimes necessary.
    try {
	$(selector).trigger("create");
    } catch (e){
	alert("Error: " + e);
    }
};

YANA.refreshListView = function (listId) {
    // more jqm deep magic that is sometimes necessary for jquery mobile lists to display properly.
    try {
        $(listId).listview('refresh');
    } catch (e) {
        $(listId).listview();
    }
};


YANA.addFavoritesButton = function(article){
    // or add remove favorites button if already a favorite.
    var buttonId = "addToFavoritesButton";
    var label,onclick;
    if (YANA.isFavorite(article)) {
	label = "Remove from Favorites";
	onclick = "removeFromFavorites";
    } else {
	label = "Add to Favorites";
	onclick = "addToFavorites";
    }
    YANA.clearButton(buttonId);
    return '<input onclick="YANA.' + onclick + '()" type="button" id="' + buttonId + '" data-role="button" data-inline="true" rel="external" value="' + label + '"/> ';
};

YANA.jsonifyArticle = function(a,section,articleIndex){
    // remove context that might be fragile.
    // articles are "de-issued" and made part of the favorites issue.
    // why? Because "current" will change. sort of annoying but better simple and dumb for now.
    // interesting that amplify seems not to be bothered by circular references...
    var ja =  {};
    $.each(['thumbnailHtml','title','preview', 'enclosures','link','html','guid','id','rssUrl'], function(index, value) { 
	    ja[value] = a[value];
	});
    ja.listItemLink = YANA.buildListItemLink("#articlePage",ja,section,articleIndex);
    return ja;
};


YANA.initFavorites = function(a){
    // this really shouldn't be necessary.
    // partial bandaid for issue with getting amplify.store favorites.
    var favoritesSection = YANA.sectionById['favorites'];
    if ( favoritesSection ) {
	favoritesSection.articles = YANA.getFavorites();
    }
    //alert("initFavorites: favoritesSection: " + YANA.dump(favoritesSection));
};

YANA.getFavorites = function(a){
    // not sure why, but sometimes amplify.store returns null.  seems
    // to be only once they have already been retrieved and only in
    // safari and chrome (firefox fine).  is this a bug in amplify? we
    // can get around for reading here, but writing will be messed up.
    // 
    var favorites =  amplify.store("YANA.favorites");
    if ( ! favorites ) {
	//alert("REINOS. FAVORITES FALSE. Why??????" + YANA.dump(favorites));
	var favoritesSection = YANA.sectionById['favorites'];
	if ( favoritesSection && favoritesSection.hasOwnProperty('articles') ) {
	    favorites = favoritesSection.articles;
	}
	if ( ! favorites ) {
	    //alert("REINOS: FAVORITES DOUBLE FALSE. Why????" + YANA.dump(favoritesSection));
	    favorites = [];
	}
    }
    
    return favorites;
};

YANA.isFavorite = function(a){
    var favorites =  YANA.getFavorites();
    var isFavorite = false;
    $.each(favorites, function(index, favorite) { 
	    if ( favorite.id === a.id ) {
		isFavorite = true;
		return;
	    }
	});
    return isFavorite;
};

YANA.addToFavorites = function(){
    var favorites =  YANA.getFavorites();
    var a = YANA.jsonifyArticle(YANA.currentArticle,YANA.sectionById["favorites"],favorites.length);
    favorites.push(a);
    amplify.store("YANA.favorites",favorites);
    YANA.regenerateFavoritesList();
    YANA.refreshCurrentArticle();
};

YANA.removeFromFavorites = function(){
    var a = YANA.currentArticle;
    var oldFavorites = YANA.getFavorites();
    var newFavorites = [];
    $.each(oldFavorites, function(index, favorite) { 
	    if ( favorite.id !== a.id ) {
		newFavorites.push(favorite);
	    }
	});
    amplify.store("YANA.favorites",newFavorites);
    YANA.regenerateFavoritesList();
    if ( YANA.currentSection.type === "favorites" ) {
	document.location="#favoritesPage";
    } else {
	YANA.refreshCurrentArticle();
    }
};

YANA.clearFavorites = function(){
    amplify.store("YANA.favorites",[]);
};

YANA.regenerateFavoritesList = function(){
    var section = YANA.sectionById["favorites"];
    YANA.insertFavorites(section);

};

YANA.insertFavorites = function (section) {
    var listId = YANA.listId(section);
    $(listId).empty();
    section.articles = YANA.getFavorites();
    $.each(section.articles,function(index,article) {
	    YANA.listArticle(listId,article);
	});
    YANA.refreshListView(listId);
};

YANA.buildListItemLink = function(baseUrl,item,rootSection,itemIndex){
    // this level/ item index stuff is crap. Fix.
    // if long urls are what scare you, use js LZJB (might be nice for localstorage too?)
   return baseUrl+"?s=" + rootSection.id + "&l=" + (item.nextLevel ? item.nextLevel : 0 ) + "&c=" + itemIndex;
};

YANA.addArticleLinkButton = function(buttonId,url,label) {
    YANA.clearButton(buttonId);
    return '<a id="' + buttonId + '" data-role="button" data-inline="true" rel="external" href="' + url + '">' + label + '</a> ';
};

YANA.clearButton = function(buttonId){
    buttonId = "#"+buttonId;
    try {
        //$(buttonId).remove();
    } catch (e) {
	alert("Error removing button: " + buttonId);
    }
};

YANA.rssTruncate = function (text, length, ellipsis) {
    if ( ! text  ) {
	return "";
    }
    // annoying that this is neccesary. Not sure it really is. Somewhat buggy. Revisit.
    // Set length and ellipsis to defaults if not defined
    if (typeof length == 'undefined') var length = 100;
    if (typeof ellipsis == 'undefined') var ellipsis = '...';
    // Return if the text is already lower than the cutoff
    if (text.length < length) return text;
    // Otherwise, check if the last character is a space.
    // If not, keep counting down from the last character
    // until we find a character that is a space
    for (var i = length - 1; text.charAt(i) != ' '; i--) {
        length--;
    }
    // The for() loop ends when it finds a space, and the length var
    // has been updated so it doesn't cut in the middle of a word.
    return text.substr(0, length) + ellipsis;
};

YANA.insertOpenSearch = function (section) {
    // insert opensearch search from into given section.
    var contentId = section.id + "Content";
    var qvid = section.id+'QueryValue';
    var html = "";
    html += '<form id="f" onsubmit=" YANA.runOpenSearch(\'' + section.id + '\')" />';
    //html += '<div data-role="fieldcontain">';
    html += '<input results="10" type="search" name="'+qvid+'" id="'+qvid+'" value=""  placeholder="Enter search terms here" />'
    // html += '</div>';
    html += '<input type="button" value="search"  onclick="YANA.runOpenSearch(\'' + section.id + '\')"/>';
    html += "</form>";
    var listId = section.id + "List";
    html += '<ul data-role="listview" data-inset="true" id="' + listId + '"><li></li></ul>';
    //http://dash.harvard.edu/open-search/?query=reinhard&sort_by=2&order=desc&rpp=5&format=rss
    $("#" + contentId).html(html);
    $('#' + listId).hide();
    $('#' + qvid).focus(true);
    $("#" + contentId).trigger( "create" );
    //alert("hell yes: " +  $('#' + qvid).attr("placeholder"));
};

YANA.runOpenSearch = function (sectionId) {
    // run open search query and show results.
    var section = YANA.sectionById[sectionId];
    var query = encodeURIComponent($('#' + sectionId + 'QueryValue').val());
    var url = section.url + query;
    YANA.insertRemoteRss(section, url);
    $(YANA.listId(section)).show();
};

YANA.insertRemoteHtml = function (section) {
    // stick remote html into given section. problem: what if a subsection? rethink this whole section/subsection thing.
    var htmlUrl = section.url;
    var yqlUrl  = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent(htmlUrl) + "%22&format=xml&callback=?";
    $.getJSON(yqlUrl, function (data) {
        var html = "";
        if (data.results[0]) {
            // REINOS: detect rss and handle differently.           
            if ( true) {
                YANA.processHtml(section,data.results[0]);
            }
        } else {
            YANA.error(section,'<p>Error loading url: <a href="' + htmlUrl + '">' + htmlUrl + '</a></p>');
        }
    });
};

YANA.contentId = function(section){
    return "#" + section.id + "Content";
};

YANA.pageId = function(section){
    return "#" + section.id + "Page";
}

YANA.listId = function(section){
    return "#" + section.id + "List";
}

YANA.error = function(section,message) {
    alert("Yana Error: " + message);
    YANA.processHtml(section,message);
};

YANA.processHtml = function(section,html) {
    var contentId = YANA.contentId(section);
    $(contentId).html(html);
    $(contentId + 'Page :a').attr('rel', 'external');
};

YANA.filterYqlHtml = function (data) {
    // Lifted from: http://icant.co.uk/articles/crossdomain-ajax-with-jquery/error-handling.html
    // filter all the nasties out
    // no body tags
    data = data.replace(/<?\/body[^>]*>/g, '');
    // no linebreaks
    data = data.replace(/[\r|\n]+/g, '');
    // no comments
    data = data.replace(/<--[\S\s]*?-->/g, '');
    // no noscript blocks
    data = data.replace(/<noscript[^>]*>[\S\s]*?<\/noscript>/g, '');
    // no script blocks
    data = data.replace(/<script[^>]*>[\S\s]*?<\/script>/g, '');
    // no self closing scripts
    data = data.replace(/<script.*\/>/, '');
    // [... add as needed ...]
    return data;
};

YANA.insertRemoteRss = function (section, rssUrl, level, listId, callback) {
    // insert rss content into given section.
    if ( ! level ) {
        level = 1;
    }
    listId = listId ? listId : YANA.listId(section);
    rssUrl = rssUrl ? rssUrl : section.url;
    $(listId).html("");
    section.articles=[];
    YANA.getRssArticles(rssUrl,section, function() {
	    if ( ! section.articles ) {
		alert("Error: insert rss section articles FALSE");
	    }	    
	    $.each(section.articles, function(index,article) {
		    YANA.attachListItemLink(article,section,level,index);
		    YANA.listArticle(listId,article);
		});
	    if ( callback ) {
		// optional "listener" code to be run after the rss has been inserted into the UI.
		callback();
	    } else {
		YANA.refreshListView(listId);
	    }
	});
};


YANA.getRssArticles = function(rssUrl,section,callback){
    section.articles = [];
    var maxEntries = 100;
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22" + encodeURIComponent(rssUrl) + "%22&format=json&_maxAge=300&callback=?", function (data) {
	    if ( ! ( data.query.results.rss.channel.item || data.query.results.entry ) ) {
		$(listId).append("No matching articles.");
		return;
	    }
	    $.each(data.query.results.rss.channel.item || data.query.results.entry || [], function () {
		    //if set up to be infinite or the limit is not reached, keep grabbing items
		    if (maxEntries == 0 || maxEntries > section.articles.length) {
			var article = YANA.parseRssEntry(this,rssUrl,section.articles.length);
			section.articles.push(article);
		    }
		});
	    callback();
	});
};


YANA.parseRssEntry= function(entry,rssUrl,articleIndex) {
    var title = entry.title;
    var link = entry.link;
    var articleHtml = "";
    if (link instanceof Array) {
	link = link[0];
    }
    var description = entry.description;
    if ( ! description ) {
	description = "";
    }
    var articleHtml = description;
    var enclosures = [];
    if (description instanceof Array) {
	var concatenatedDescription = "";
	for (var i = 0; i < description.length; i++) {
	    concatenatedDescription += description[i] + "\n";
	}
	description = concatenatedDescription;
	articleHtml = description;
    } else {
	try {
	    if ($(description).text()) {
		description = $(description).text();
	    }
	} catch (ee) {
	    //alert("ERROR GETTING DESCRIPTION");
	}
    }
    if (entry.hasOwnProperty('enclosure')) {
	if (entry.enclosure instanceof Array) {
	    enclosures = entry.enclosure;
	} else {
	    enclosures.push(entry.enclosure);
	}
    }
    var article = {};
    article.preview = YANA.rssTruncate(description, 100);
    if (!article.preview) {
	//alert("Problem getting description: '" + description + "'"  + JSON.stringify(entry,null,2));
	article.preview = "";//Unable to get description for some reason (Reinhard will fix).";
    }
    article.guid = entry.guid;
    article.rssUrl = rssUrl;
    if ( entry.hasOwnProperty('guid') ) {
	if ( article.guid.isPermalink ) {
	    // this is what we like: permalink from the content provider to use as id.
	    article.id = article.guid.content;
	} else {
	    if ( article.guid.hasOwnProperty('content') ) {
		// 2nd best. At least they give us some kind of id.
		article.id = rssUrl + ":guid:" + article.guid.content;
	    } else {
		// I think this is just an error?
		alert("Strange rss article guid: " + JSON.stringify(article.guid));
		article.id = rssUrl + ":index:" + articleIndex;
	    }
	}
    } else {
	// no guid given at all.
	article.id = rssUrl + ":index:" + articleIndex;
    }
    //alert("WHat the guid? " + JSON.stringify(entry.guid,null,2));
    article.title = title;
    article.thumbnail = entry.content ? (entry.content.url ? entry.content.url : "") : "";
    article.link = link;
    article.html = articleHtml;
    article.enclosures = enclosures;
    article.thumbnailHtml = article.thumbnail ? '<img class="thumbnail" src="' + article.thumbnail + '" />' : '';
    return article;
};

YANA.attachListItemLink = function(article,section,level,articleIndex) {
    // attempt to contain "level" hackery. 
    article.listItemLink= null;
    article.nextLevel=null;
    var baseUrl = ""
    if (section.levels &&  (level < section.levels) ) {
	baseUrl = "#subSectionPage";
	article.nextLevel = level+1;
    } else {
	baseUrl = "#articlePage";
	article.nextLevel = level;
    }
    article.listItemLink =  YANA.buildListItemLink(baseUrl,article,section,articleIndex);
};
