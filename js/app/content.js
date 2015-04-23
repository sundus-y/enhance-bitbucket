function addDiffTool(){
    clean();
    var commits = jQuery("td.changeset:not(:has(span.merge-lozenge))");
    jQuery.each(commits,function(i,commit){
        var link = jQuery(commit).find('a.changesetid').attr('href')
        link = window.location.origin + link
        jQuery(commit).append("<span class='diff' data-link='"+link+"'>DIFF</span>");
    });
    jQuery('span.diff').click(function(){
        cleanDiff();
       var response = loadDiff(this);
       renderDiff(response)
    });
}

function clean(){
    var diff = jQuery("span.diff");
    diff.remove();
}

function cleanDiff(){
    var diff_box = jQuery("#diff_container");
    var diff_overlay = jQuery("#overlay");
    diff_box.remove();
    diff_overlay.remove();
}

function loadDiff(elem){
    return jQuery(elem).data('link');
}

function renderDiff(diff_page){
    var body = jQuery('body');
    body.prepend("<div id='overlay'></div>");

    jQuery('#overlay').append("<iframe id='diff_container' src='"+diff_page+"'></iframe>>");
    var cont = $('#diff_container');
    cont.load(function() {
        $(this.contentDocument).find('nav').remove();
        $(this.contentDocument).find('div.aui-sidebar').hide();
        $(this.contentDocument).find('.aui-page-panel').css('padding-left','0px');
        this.contentDocument.body.addEventListener('keyup', function(e){
            if(e.keyCode === 27 /* Esc key */){ cleanDiff(); }
            return true;
        }, false);
    });

    jQuery('#overlay').click(function(){
       cleanDiff();
    });
}

jQuery(document).ready(function() {
    document.body.addEventListener('keydown', function(e){
        if(e.keyCode === 18 /* Alt (option) key */){ addDiffTool(); }
        return true;
    }, false);
    document.body.addEventListener('keyup', function(e){
        if(e.keyCode === 18 /* Alt (option) key */){ clean(); }
        else if(e.keyCode === 27 /* Esc key */){ cleanDiff(); }
        return true;
    }, false);
});

