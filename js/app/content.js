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

function addPullRequestTool(){
    var pull_requests_page = jQuery("h2:contains('Pull requests')");
    var pull_request_page = jQuery("div.pull-request-content>h3:contains('Activity')");
    if (pull_requests_page.size() == 1) {highlight();}
    if (pull_request_page.size() == 1) {showInReviewButton();}
}

function highlight() {
    var pull_requests = jQuery('table.pull-requests-table').find('td.id');
    var project_path = window.location.pathname.match(/\/projects\/(.*)\/pull-requests/)[1];
    jQuery.each(pull_requests, function (i, pull_request) {
        var pull_request_num = jQuery(pull_request).find('a')[0].innerHTML.match(/#(.*)/)[1];
        var activity_url = "https://git.its.uiowa.edu/rest/api/latest/projects/" + project_path +
            "/pull-requests/" + pull_request_num + "/activities?start=0&limit=100";
        $.ajax({
            context: pull_request,
            url: activity_url
        }).done(function (data) {
            var in_review = false;
            jQuery.each(data.values, function(i,activity){
               if (activity.action == "COMMENTED" && activity.comment.text == "IN REVIEW") {
                   in_review = true;
               }
            });
            if (in_review){
                jQuery(this).closest('tr').css('background-color','rgba(230, 255, 98, 0.87)')
            }
        });
    });
}

function showInReviewButton(){
    var details_title = jQuery("div.pull-request-content>div>div>h3:contains('Details')");
    jQuery(details_title).append(" <span class='in_review'> In Review </span>");
    jQuery('span.in_review').click(function(){
        jQuery('form.new-comment-form').find('textarea').val('IN REVIEW');
        jQuery('form.new-comment-form').find("button:contains('Comment')").click();
    });
}

function clean(){
    var diff = jQuery("span.diff");
    var in_review= jQuery("span.in_review");
    diff.remove();
    in_review.remove();
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
        if(e.keyCode === 18 /* Alt (option) key */){
            addDiffTool();
            addPullRequestTool();
        }
        return true;
    }, false);
    document.body.addEventListener('keyup', function(e){
        if(e.keyCode === 18 /* Alt (option) key */){ clean(); }
        else if(e.keyCode === 27 /* Esc key */){ cleanDiff(); }
        return true;
    }, false);
});

