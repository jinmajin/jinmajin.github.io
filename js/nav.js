function navTo(page){
	$('#content .main').hide();
	$('#header .menuitem').removeClass('active');
	$('#'+ page).show();
	$('#'+ page + '_item').addClass('active');
}

function toggleSlide(section) {
	$(section).find('.project_info').slideToggle();
}
