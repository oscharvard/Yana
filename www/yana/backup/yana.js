$(document).ready(function () {
    YANA.sectionById = {};
    //alert(JSON.stringify(YANA));
    $("#homeHeader").html("<h1>" + YANA.title + "</h1>");
    YANA.initializeSections("homeSection1List", YANA.sections[0]);
    YANA.initializeSections("homeSection2List", YANA.sections[1]);
});


// Dynamically generate pages based or url arguments. A surprising pain.
// Lifted from http://jquerymobile.com/test/docs/pages/page-dynamic.html
// Listen for any attempts to call changePage().
// Reinhard: TODO: also regenerate overwritten pages? Or can we circumvent this?
$(document).bind( "pagebeforechange", function( e, data ) {
	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by URL.
	if ( typeof data.toPage === "string" ) {
	    // We are being asked to load a page by URL, but we only
	    // want to handle URLs that request the data for a specific
	    // category.
	    var u = $.mobile.path.parseUrl( data.toPage ),
		re = /^#.*\?/;
	    //alert("Bean counter revenge: " + u.hash);
	    if ( u.hash.search(re) !== -1 ) {
		// We're being asked to display the items for a specific category.
		// Call our internal method that builds the content for the category
		// on the fly based on our in-memory category data structure.
		//showCategory( u, data.options );
		//alert("Hallo Reinhardo: " + u.hash + ":" + u.hash.search(re));
		// Make sure to tell changePage() we've handled this call so it doesn't
		// have to do anything.
		var params       = YANA.extractUrlParams(u.hash);
		var sectionId    = params['s'] ? params['s'] : null;
		var articleIndex = params['c'] ? params['c'] : null; // should be id.
		var level      = params['l'] ? params['l'] : null;
		if ( u.hash.search(/^#articlePage?/) !== -1 ){
		    // generate article page based on query parameters.
		    YANA.showArticle(sectionId,articleIndex,level);
		} else if ( u.hash.search(/#subSectionPage?/) !== -1 ) {
		    // generate rss subsection page based on query parameters.
		    var section    = YANA.sectionById[sectionId];
		    var subSection = section.subSections[level-2];
		    var rssUrl     = section.articles[articleIndex].link; // todo: need parent, not root section for > 2 levels.
		    YANA.insertRemoteRss(subSection,rssUrl,level,"#subSectionList");
		}
		// not 100% sure why we have to comment this out from example code, but we do.
		//e.preventDefault();
	    }
	}
    });


YANA.extractUrlParams = function(url){
    var params = {};
    var kvpairs = url.split("?")[1].split("&");
    for (var i=0;i<kvpairs.length;i++) {
        var pair = kvpairs[i].split("=");
	params[pair[0]]= decodeURIComponent(pair[1]);
    }
    return params;
};

YANA.initializeSections = function (listId, sections) {
    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        s.id = s.id ? s.id : YANA.label2id(s.label);
	if (s.levels > 1) {
	    YANA.addSubSections(s);
	}
        YANA.sectionById[s.id] = s;
        //var onclickHtml = ' onclick="return YANA.changePage(\'' + s.id + '\'); " ';
        //var onclickHtml="";
        $("#" + listId).append('<li><a href="#' + s.id + 'Page"><img src="' + s.img + '" alt="' + s.label + '" class="ui-li-icon"></img>' + s.label + '</a></li>');
        $('body').append(YANA.buildPageHtml(s));
        YANA.addPageCreateHandler(s);
    }
};

YANA.addSubSections = function(section){
    var clone = jQuery.extend(true, {}, section);
    section.subSections=[];
    for(var i=2; i <= section.levels; i++ ) {
	var subSection =  jQuery.extend(true, {}, clone);
	subSection.level = i;
	section.subSections.push(subSection);
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
    // TODO: we have to an a rel="external" tag to all links.
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

YANA.showArticle = function (sectionId, articleIndex, level) {
    //alert("mein dude. get the arguments for section and article id. Article: " + sectionId + ":" + articleIndex );
    var section = YANA.sectionById[sectionId];
    if ( level && level > 1 ) {
	section = section.subSections[level-2];
    }
    var article = section.articles[articleIndex];
    //alert("Show article: " + $('#articleSectionLink').html());
    if ($('#articleSectionLink .ui-btn-text').html()) {
        $('#articleSectionLink .ui-btn-text').html(section.label);
    } else {
        $('#articleSectionLink').text(section.label);
    }
    //$('#articleSectionLink').button();
    $('#articleSectionLink').attr("href", "#" + sectionId + "Page");
    var moreHtml = "<hr />";
    for (var i = 0; i < article.enclosures.length; i++) {
        var e = article.enclosures[i];
        // todo: base label on type.
        var label = "PDF";
        moreHtml += '<a href="' + e.url + '">' + label + '</a> ';
    }
    moreHtml += '<a href="' + article.link + '">' + "Web" + '</a> ';
    var titleHtml = "<h3>" + article.title + "</h3>";
    $('#articleContent').html(titleHtml + article.html + moreHtml);
    var absolutizeUrls = function (index, attr) {
        if (attr.indexOf("http") === 0) {
            // absolute url
            return attr;
        } else {
            // relative url. set base to rss base.
            if (attr.indexOf("/" !== 0)) {
                attr = "/" + attr;
            }
            return section.url + "/.." + attr;
        }
    };
    $("#articleContent img").attr("src", absolutizeUrls);
    $("#articleContent a").attr("href", absolutizeUrls);
};

YANA.refreshListView = function (listId) {
    try {
        $(listId).listview('refresh');
    } catch (e) {
        $(listId).listview();
    }
};

YANA.rssTruncate = function (text, length, ellipsis) {
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
    var html = "<p>Favorites doesn't work yet. Sorry.</p>";
    $(YANA.contentId(section)).html(html);
};

YANA.insertOpenSearch = function (section) {
    //alert("insertOpenSearch: " + section.id);
    var contentId = section.id + "Content";
    var html = "";
    html += "<form>";
    html += '<input id="' + section.id + 'QueryValue" type="text" placeholder="Your search term here." />';
    html += '<input type="button" value="search" onclick="YANA.runOpenSearch(\'' + section.id + '\')" />';
    html += "</form>";
    //alert("form html: " + html);
    var listId = section.id + "List";
    html += '<ul data-role="listview" data-inset="true" id="' + listId + '"><li></li></ul>';
    //html+="<table>";
    //for (key in section) {
    //	html+= '<tr><td>'+key+ '</td><td>' + section[key] + '</td></tr>';
    //}
    //html+="</table>";
    //http://dash.harvard.edu/open-search/?query=reinhard&sort_by=2&order=desc&rpp=5&format=rss
    $("#" + contentId).html(html);
    $('#' + listId).hide();
};

YANA.runOpenSearch = function (sectionId) {
    var section = YANA.sectionById[sectionId];
    var query = encodeURIComponent($('#' + sectionId + 'QueryValue').val());
    var url = section.url + "/?query=" + query + "&format=rss";
    var optionalOpenSearchKeys = ['rpp', 'sort_by', 'order'];
    var i = 0;
    for (i in optionalOpenSearchKeys) {
        var key = optionalOpenSearchKeys[i];
        if (key in section) {
            url += "&" + key + "=" + encodeURIComponent(section[key]);
        }
    }
    YANA.insertRemoteRss(section, url);
    $(YANA.listId(section)).show();
};

YANA.insertRemoteHtml = function (section) {
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
    if ( ! level ) {
        level = 1;
    }

    listId = listId ? listId : YANA.listId(section);
    rssUrl = rssUrl ? rssUrl : section.url;

    //alert("insertRemoteRss: " + section.id + " : " + rssUrl + " : level " + level + " listId: " + listId);

    var truncationLength = section.truncate;
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22" + encodeURIComponent(rssUrl) + "%22&format=json&callback=?", function (data) {
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
                        alert("Problem getting description: '" + description + "'");
                        reducedDescription = "Unable to get description for some reason (Reinhard will fix).";
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
            $(listId).append("<li><a href=\"" + rssUrl + "\">Error getting rss url " + rssUrl + "</a></li>");
            alert("Error Message: " + e);
            return;
        }
        
        YANA.refreshListView(listId);
    });
};