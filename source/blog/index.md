---
title: blog
date: 2016-06-07 19:33:10
---

<script type="text/javascript">

var postUrls = {};



var extractRequestPostId = function () {
	var results = new RegExp('[\\?&]p=([^&#]*)').exec(window.location.href);
	if (!results) { return 0; }
	return results[1] || 0;
};

document.addEventListener("DOMContentLoaded", function(event) { 
	var requestPostId = extractRequestPostId();
	var params = "";
	if(requestPostId){
		params = "?legacy-post=" + requestPostId;
	}
	window.location.replace("/" + params);
});
</script>
