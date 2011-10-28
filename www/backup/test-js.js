function newFeed(name, file) {
    $.getJSON(
	      "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22"+encodeURIComponent(file)+"%22&format=json&callback=?",
	      function(d) {
		  var count = 0;
		  //grab ever rss item from the json result request
		  $(d.query.results.rss.channel.item).each(function() {
			  //if set up to be infinite or the limit is not reached, keep grabbing items
			  if(maxEntries == 0 || maxEntries>count){
			      var title = this.title;
			      var link = this.link;
			      var description = this.description;
			      var pubDate = this.pubDate;
			      // Format however you want, I only went for link and title
			      var anItem = "<a href='"+link+"' target='_blank'>"+title+"</a><br>";
			      //append to the div
			      $("#"+slug(name)).append(anItem);
			      count++;
			  }
		      });
	      });
}



function newFeed(name, file, format) {
    $.getJSON(
	      "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22"+encodeURIComponent(file)+"%22&format=json&callback=?",
	      function(data) {
		  var count = 0;
		  //grab ever rss item from the json result request
                  $.each(data.query.results.item || data.query.results.entry,function(){
			  //if set up to be infinite or the limit is not reached, keep grabbing items
			  if(maxEntries == 0 || maxEntries>count){
			      var title = this.title;
			      var link = this.link;
			      var description = this.description;
			      var pubDate = this.pubDate;
			      // Format however you want, I only went for link and title
			      var anItem = "<a href='"+link+"' target='_blank'>"+title+"</a><br>";
			      //append to the div
			      $("#"+slug(name)).append(anItem);
			      count++;
			  }
		      });
	      });
}
