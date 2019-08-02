var cmsEditor = function(options){

	 /*
     * Variables accessible
     * in the class
     */
    var vars = {
        baseCMSUrl  : "",
        contentDir : "content",
        uploadsDir : "content/uploads",
        token: "",
        siteName: "Admin Panel"
    };
 
    /*
     * Can access this.method
     * inside other methods using
     * root.method()
     */
    var root = this;
 
    /*
     * Constructor
     */
    this.construct = function(options){
        $.extend(vars , options);

 		vars.token = JSON.parse(localStorage.getItem("token"));

 		console.log(vars)
        if (isAuthenticated()){
			renderPageLayout();
		}
		else{
			var url = "/";    
        	$(location).attr('href',url);
		}

    }

    
 
 	/* Check if we have a valid token */
 	var isAuthenticated = function(){
 		console.log("check if authenticated");
 		console.log(vars.token);

 		if (vars.token !== null){
 			console.log("Valid Token Found: ");
 			return true;
 		}
 		else{
 			console.log("Invalid Token.")
 			return false;
 		}
 	}

 	var buildEndpoint = function(url){
 		return vars.baseCMSUrl + url;
 	}

 	var resetDisplay = function(){
 		$("#main section").hide();
 	}

	var renderPageLayout = function(){

		getNavigation();

	}

	var getNavigation = function(){

		// get the list of folders with posts from API
        var url = buildEndpoint("/git/contents/" + vars.contentDir);
        fetch(url, 
            { 
                'headers': {
                    'Authorization': vars.token
                }
            })
        .then(function(response){
            if (response.status == 200) { return response.json() }
            else if (response.status == 401) { logout(); }
            else { throw Error(`Request rejected with status ${res.status}`); }
        })
        .then(json => displayNavigation(json))
        .catch(error => console.error);
	}

	var displayNavigation = function(collections){
		
		console.log(collections);

		$("#title").html(vars.siteName)

		var nav_list = $("#nav ul");
		$.each(collections, function(i, c){
			if (c.type == "dir" && c.path != vars.uploadsDir){
				var item = $("<li>");
				var item_link = $("<a>");
				item_link.attr("href", "#" + c.name.toLowerCase());
				item_link.addClass("skel-layers-ignoreHref");

				var span = $("<span>");
				span.addClass("icon");
				span.addClass("fa-pencil");
				span.html(c.name.toLowerCase());

				item_link.append(span);
				item_link.click(function(){
					getPosts(c.path);
					return false;
				});
				item.append(item_link);
				nav_list.append(item);
			}
		})

		// add logout button
		var item = $("<li>");
		var item_link = $("<a>");
		item_link.attr("href", "#logout");
		item_link.addClass("skel-layers-ignoreHref");

		var span = $("<span>");
		span.addClass("icon");
		span.addClass("fa-sign-out");
		span.html("Sign Out");

		item_link.append(span);
		item.append(item_link);
		item.click(
			function(){ 
				localStorage.removeItem('token');
				window.location.reload();
		 	})
		nav_list.append(item);
	}

	var getPosts = function(collectionPath){

		// get the posts for the current collection selected.
		$("#collection_name").html(collectionPath);


		var url = buildEndpoint("/git/contents/" + collectionPath);
        fetch(url, 
            { 
                'headers': {
                    'Authorization': vars.token
                }
            })
        .then(function(response){
            if (response.status == 200) { return response.json() }
            else if (response.status == 401) { logout(); }
            else { throw Error(`Request rejected with status ${res.status}`); }
        })
        .then(json => displayPosts(json))
        .catch(error => console.error);

	}

	var displayPosts = function(posts){
		console.log(posts)
				 
		var card_template = $("#hidden-post-template").html();
		cardCol = $(".card-columns");
		cardCol.empty();

		$.each(posts, function(i, p){
				
            var card = $(card_template).clone();
            $(card).find('.card-header').html(p.name);
            $(card).find('.card-text').html(p.name);
            $(card).find('.card-footer').html("Last Updated: ???");
            $(card).click(function(){
            	getPost(p.path);
            })
        	cardCol.append(card);
		})



		resetDisplay();
		$("#posts").show();
	}

	var getPost = function(post_url){
		console.log("Edit Post: " + post_url);

		// get page content
		var url = buildEndpoint("/git/contents/" + post_url);
        fetch(url, 
            { 
                'headers': {
                    'Authorization': vars.token
                }
            })
        .then(function(response){
            if (response.status == 200) { return response.text() }
            else if (response.status == 401) { logout(); }
            else { throw Error(`Request rejected with status ${res.status}`); }
        })
        .then(raw => displayEditPost(raw))
        .catch(error => console.error);



	}

	var displayEditPost = function(raw){
		//console.log("Post: " + raw);


		try{
			content = frontmatter(raw);
		

			$("#editPostHeader").html(content.data.title);


		}
		catch(err) {
		  console.log(err.message);
		}


		


		resetDisplay();
		$("#editPost").show();
	}


	 /*
     * Pass options when class instantiated
     */
    this.construct(options);
};


jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

/*
 * Pass options when class instantiated
 */
	
$.loadScript("graymatter.js", function(){ 
	console.log("loaded graymatter.js");

	$.loadScript('config.js', function(){
	    //Stuff to do after someScript has loaded
	  	var cms = new cmsEditor(cmsConfig); 
	});
});

