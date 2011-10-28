

$(document).ready(function() {  

	// reinos: todo: make selector for radio change event more specific.

	$('input[type=radio]').live('change', function() {
		var sectionId = $("input[@name=sectsradio]:checked").val();
		switchToSection(sectionId);
	    });

    });


function switchToSection(sectionId){
    //alert("section id: " + sectionId);
    // todo: name and id should be separate.
    $('#currentHeader > h1').html(sectionId);
    alert(  sectionId.toLowerCase()+'Content' + ":" + $(sectionId.toLowerCase()+'Content').html());
    $('#currentContent').html( $(sectionId.toLowerCase()+'Content').html() );
}