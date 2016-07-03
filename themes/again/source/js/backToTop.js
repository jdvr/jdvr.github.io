var initBackToTop = function() {
  $('.back-to-top').hide();
  var offset = $('main').height() * 0.15;
  var duration = 300;

  $(window).scroll(function() {
    console.log("asd");
    if ($(this).scrollTop() > offset) {
      $('.back-to-top').fadeIn(duration);
    } else {
      $('.back-to-top').fadeOut(duration);
    }
  });

  $('.back-to-top').click(function(event) {
    event.preventDefault();
    $('html, body').animate({scrollTop: 0}, duration);
    return false;
  });

};

window.addEventListener('load', initBackToTop, false);

