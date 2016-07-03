var app = (function () {
  var loadBanner = function () {
    var bannerSmall = document.querySelector('.banner-small')

    // can't just listen the bannerSmall's load event
    // but why ?
    var img = new Image()
    img.src = bannerSmall.src
    img.addEventListener('load', function (e) {
      bannerSmall.classList.add('loaded')
    }, false)

    var bannerLarge = new Image()
    bannerLarge.src = bannerSmall.dataset.src
    bannerLarge.addEventListener('load', function (e) {
      e.target.classList.add('loaded')
    }, false)

    bannerSmall.parentNode.appendChild(bannerLarge)
  }

  return {
    loadBanner: loadBanner
  }
})()

var extractRequestPostId = function () {
  var results = new RegExp('[\\?&]legacy-post=([^&#]*)').exec(window.location.href);
  if (!results) { return 0; }
  return results[1] || 0;
};

var redirectTo = function (url) {
  window.location.replace(url);
};


window.addEventListener('load', function (e) {
  var requestPostId = extractRequestPostId();
  var url = postUrls[requestPostId];
  if(url){
    redirectTo(url);
  }
  app.loadBanner();
}, false);

