$(document).ready(function(){
  $("#opt-info-clk").on('click', function(e) {
    var info = $('.avatar-info');
    e.preventDefault();
    if($(this).attr('data-indicate') == 'close') {
      $(this).attr('data-indicate', 'open');
      info.fadeIn('fast');
    } else {
      $(this).attr('data-indicate', 'close');
      info.fadeOut('fast');
    }
  });
});
