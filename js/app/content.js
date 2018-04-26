function addDiffTool(){
    clean();
    var commits = jQuery("td.commit");
    jQuery.each(commits,function(i,commit){
        var link = jQuery(commit).find('a.commitid').attr('href')
        link = window.location.origin + link
        jQuery(commit).append("<span class='diff' data-link='"+link+"'>DIFF</span>");
    });
    jQuery('span.diff').click(function(){
        cleanDiff();
       var response = loadDiff(this);
       renderDiff(response)
    });
}

function addPullRequestTools(){
    var pull_requests_page = jQuery("h2:contains('Pull requests')");
    if (pull_requests_page.size() == 1) {
        markMergeConflicts();
    }
}

function getProjectPath(){
    return window.location.pathname.match(/\/projects\/(.*)\/pull-requests/)[1];
}

function markMergeConflicts() {
    var pull_requests = getPullRequests();
    pull_requests.forEach(function(pull_request){
        hasMergeConflict(pull_request).done(function(){
            applyConflictStyle(pull_request);
        });
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

function getPullRequests(){
    var prs = jQuery('table.pull-requests-table').find('td.title');
    return prs.map(function(i,pr){
        var id = jQuery(pr).find('a')[0].href.match(/pull-requests\/(.*)\//)[1];
        return {
            id: id,
            name: 'Test',
            merge_url: '/rest/api/latest/projects/'+getProjectPath()+'/pull-requests/'+id+'/merge',
            elem: pr
        }
    }).toArray();
}

function hasMergeConflict(pull_request){
    var hasConflict = jQuery.Deferred();
    jQuery.get(pull_request.merge_url).done(function (data) {
        if(data.conflicted){
            hasConflict.resolve();
        } else {
            hasConflict.reject();
        }
    }).fail(function(data){
        hasConflict.reject();
    });
    return hasConflict;
}

function applyConflictStyle(pull_request){
    jQuery(pull_request.elem).
        closest('tr').
        find('.build-status-pr-list-col-value').
        append('<span title="Possible Merge Conflict" class="aui-icon aui-icon-small aui-iconfont-warning">Possible Merge Conflict</span>').
        css('background-color','#f6c342');

}

jQuery(document).ready(function() {
    document.body.addEventListener('keydown', function(e){
        if(e.keyCode === 18 /* Alt (option) key */){
            addDiffTool();
        }
        return true;
    }, false);
    document.body.addEventListener('keyup', function(e){
        if(e.keyCode === 18 /* Alt (option) key */){ clean(); }
        else if(e.keyCode === 27 /* Esc key */){ cleanDiff(); }
        return true;
    }, false);
    addPullRequestTools();
});

