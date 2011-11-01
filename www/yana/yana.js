$(document).ready(function () {
	// set up yana when the page is first loaded.
	// todo: should be smarter about regenerating state from dynamic urls with parameters to support deep linking.
	YANA.sectionById = {};
	//alert(JSON.stringify(YANA));
	$("#homeHeader").html("<h1>" + YANA.title + "</h1>");
	YANA.initializeSections("homeSection1List", YANA.sections[0]);
	YANA.initializeSections("homeSection2List", YANA.sections[1]);
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
	    //alert("Bean counter revenge: " + u.hash);
	    if ( u.hash.search(re) !== -1 ) {
		var params       = YANA.extractUrlParams(u.hash),
		    sectionId    = params['s'] ? params['s'] : null,
		    articleIndex = params['c'] ? params['c'] : null, // todo: should be article id.
		    level      = params['l'] ? params['l'] : null;
		if ( u.hash.search(/^#articlePage?/) !== -1 ){
		    // generate article page based on query parameters.
		    YANA.showArticle(sectionId,articleIndex,level);
		} else if ( u.hash.search(/#subSectionPage?/) !== -1 ) {
		    // generate rss subsection page based on query parameters.
		    var section    = YANA.sectionById[sectionId],
			subSection = section.subSections[level-2],
			article    = section.articles[articleIndex]; // todo: need parent, not root section for > 2 levels.
		    YANA.insertRemoteRss(subSection,article.link,level,"#subSectionList");
		    $("#subSectionHeader h1").html(article.title);
		    YANA.updateButton('#subSectionParentLink', subSection.parent.label, "#" + subSection.parent.id + "Page");
		}
		// not 100% sure why we have to comment this out from example code, but we do.
		//e.preventDefault();
	    }
	}
    });


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
    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        s.id = s.id ? s.id : YANA.label2id(s.label);
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
    //alert("Added subSections: " + JSON.stringify(section,null,2));
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
    if (section.type === 'rss') {
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
            //alert("opensearch support pending");
            YANA.insertOpenSearch(section)
        } else if (section.type === "favorites") {
            YANA.insertFavorites(section);
        } else {
            alert("unsupported type!" + section.type);
        }
    });
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

YANA.showArticle = function (sectionId, articleIndex, level) {
    // populate article page based on rss article info.
    var section = YANA.sectionById[sectionId];
    if ( level && level > 1 ) {
	section = section.subSections[level-2];
    }
    var article = section.articles[articleIndex];
    //alert("Show article: " + $('#articleParentLink').html());
    YANA.updateButton( "#articleParentLink", section.label,"#" + sectionId + "Page");
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

    moreHtml += YANA.addFavoritesButton();

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
    $("#articleContent").trigger("create");
};

YANA.addFavoritesButton = function(){
    var buttonId = "addToFavoritesButton";
    var label = "Favorite";
    YANA.clearButton(buttonId);
    return '<input onclick="YANA.addToFavorites()" type="button" id="' + buttonId + '" data-role="button" data-inline="true" rel="external" value="' + label + '"/> ';
};

YANA.addToFavorites = function(){
    //alert("Adding to favorites");
    var favorites = [ "Rock and roll dude!" ];
    amplify.store("YANA.favorites",favorites);
    //alert("Got this in favorites: " + JSON.stringify(amplify.store("YANA.favorites"),null,2));
};

YANA.addArticleLinkButton = function(buttonId,url,label) {
    YANA.clearButton(buttonId);
    return '<a id="' + buttonId + '" data-role="button" data-inline="true" rel="external" href="' + url + '">' + label + '</a> ';
};

YANA.clearButton = function(buttonId){
    buttonId = "#"+buttonId;
    try {
        $(buttonId).remove();
    } catch (e) {
	alert("Error removeing button: " + buttonId);
    }
};

YANA.refreshListView = function (listId) {
    // deep magic that is sometimes necessary for jquery mobile lists to display properly.
    try {
        $(listId).listview('refresh');
    } catch (e) {
        $(listId).listview();
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

YANA.insertFavorites = function (section) {
    var html = "These are your favorites:";
    html += JSON.stringify(amplify.store("YANA.favorites"),null,2);
    $(YANA.contentId(section)).html(html);
};

YANA.insertOpenSearch = function (section) {
    // insert opensearch search from into given section.
    var contentId = section.id + "Content";
    var qvid = section.id+'QueryValue';
    var html = "";
    html += '<form id="f" onsubmit="alert(\'wtf\'); YANA.runOpenSearch(\'' + section.id + '\')" />';
    //html += '<div data-role="fieldcontain">';
    html += '<input results="10" type="search" name="'+qvid+'" id="'+qvid+'" value=""  placeholder="Enter search terms here" />'
    // html += '</div>';
    html += '<input type="button" value="search"  onclick="alert(\'wtf\'); YANA.runOpenSearch(\'' + section.id + '\')"/>';
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
    // 
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

YANA.insertRemoteRss = function (section, rssUrl, level, listId) {
    // insert rss content into given section.
    // this method is WAY too long and the section/level stuff needs to be rethought.
    if ( ! level ) {
        level = 1;
    }
    listId = listId ? listId : YANA.listId(section);
    rssUrl = rssUrl ? rssUrl : section.url;
    //alert("insertRemoteRss: " + section.id + " : " + rssUrl + " : level " + level + " listId: " + listId);
    var truncationLength = section.truncate;
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22" + encodeURIComponent(rssUrl) + "%22&format=json&_maxAge=300&callback=?", function (data) {
        var count = 0;
        //var html="";//"<ul data-role=\"listview\" data-inset=\"true\" id=\"rssList\"> ";
        var maxEntries = 100;
        //alert(listId+":"+$("#"+listId).html());
        $(listId).html("");
        // grab ever rss item from the json result request
        // works for dash, pdr: data.query.results.rss.channel.item
        // works for ehjournal: data.query.results.RDF.item
        section.data = data;
        section.articles = [];
        try {
	    if ( ! ( data.query.results.rss.channel.item || data.query.results.entry ) ) {
	    	$(listId).append("No matching articles.");
	    	return;
	    }
            $.each(data.query.results.rss.channel.item || data.query.results.entry, function () {
                //if set up to be infinite or the limit is not reached, keep grabbing items
                if (maxEntries == 0 || maxEntries > count) {
                    var title = this.title;
                    var link = this.link;
                    var articleHtml = "";
                    if (link instanceof Array) {
                        link = link[0];
                    }
                    var description = this.description;
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
                    if (this.hasOwnProperty('enclosure')) {
                        if (this.enclosure instanceof Array) {
                            enclosures = this.enclosure;
                        } else {
                            enclosures.push(this.enclosure);
                        }
                    }
                    var reducedDescription = YANA.rssTruncate(description, truncationLength);
                    if (!reducedDescription) {
			//alert("Problem getting description: '" + description + "'"  + JSON.stringify(this,null,2));
                        reducedDescription = "";//Unable to get description for some reason (Reinhard will fix).";
                    }
                    //var pubDate = this.pubDate;
                    //alert(JSON.stringify(this,null,2));
                    
                    //$("#"+listId).append("<li><a rel=\"external\" href='"+link+"'>" + thumbnailHtml +"<h3>"+title+"</h3><p>" + reducedDescription + "</p></a></li>");
                    var article = {};
                    article.id = this.guid;
                    article.title = title;
                    article.thumbnail = this.content ? (this.content.url ? this.content.url : "") : "";
                    article.link = link;
                    article.preview = reducedDescription;
                    article.html = articleHtml;
                    article.enclosures = enclosures;
                    section.articles.push(article);
                    
                    var thumbnailHtml = article.thumbnail ? '<img class="thumbnail" src="' + article.thumbnail + '" />' : '';
                    var onclick="";
		    var href, nextLevel;
                    //alert("section.levels: " + section.label + ": " + section.levels);
                    if (section.levels &&  (level < section.levels) ) {
                        //onclick = " onclick=\"alert('RSS of RSS not yet supported!')\" ";
                        //onclick = " onclick=\"YANA.insertRemoteRss(YANA.sectionById['" + section.id + "'],'" + article.link + "'," +(level+1)+")\" ";         
                        //alert("REINOS: " + onclick);
                        // problem: we overwrite the archive html here.
                        //href=YANA.pageId(section);
			href = "#subSectionPage";
			nextLevel = level+1;
                    } else {
                        href = "#articlePage";
			nextLevel = level;
                    }
                    href+="?s=" + section.id + "&l=" + (nextLevel) + "&rss=" + "&c=" + count;
                    $(listId).append("<li><a href='"+href+"' " + onclick + ">" + thumbnailHtml + "<h3>" + title + "</h3><p>" + reducedDescription + "</p></a></li>");
                    count++;
                }
            });
        } catch (e) {
            $(listId).append("<li>Error getting rss url: <a href=\"" + rssUrl + "\"> " + rssUrl + "</a><pre>" + e + "</pre></li>");
            //alert("Error Message: " + e);
            return;
        }
        
        YANA.refreshListView(listId);
    });
};