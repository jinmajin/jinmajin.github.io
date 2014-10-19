function navTo(page){
	var mainDivs = document.querySelectorAll("#content .main");
	for(var i = 0; i < mainDivs.length; i++){
		mainDivs[i].style.display = "none";
	}
	var menuItems = document.querySelectorAll("#header .menuitem");
	for(var i = 0; i < menuItems.length; i++){
		menuItems[i].className = "menuitem";
	}
	document.getElementById(page).style.display = "block";
	document.getElementById(page + "_item").className = "menuitem active";
}
