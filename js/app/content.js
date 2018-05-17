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
        hideBuildStausValue();
        addColumnToPullRequestTable('pull-request-merge-conflict-status-column merge_conflict_header','pull-request-merge-conflict-status-value','Merge Conflict',-1);
        addColumnToPullRequestTable('pull-request-pivotal-tracker-labels-column pivotal_tracker_labels_header','pull-request-pivotal-tracker-labels-value','PivotalTracker Labels',1);
        addColumnToPullRequestTable('pull-request-pivotal-tracker-state-column pivotal_tracker_state_header','pull-request-pivotal-tracker-state-value','PivotalTracker State',2);
        var pull_requests = getPullRequests();
        pull_requests.forEach(function(pull_request){
            markMergeConflicts(pull_request);
            if(pull_request.story_number){
                addPivotalTrackerColumnValues(pull_request);
            }
        });
    }
}

function getProjectPath(){
    return window.location.pathname.match(/\/projects\/(.*)\/pull-requests/)[1];
}

function markMergeConflicts(pull_request) {
    hasMergeConflict(pull_request).done(function(){
        applyConflictStyle(pull_request);
    });
}

function addPivotalTrackerColumnValues(pull_request){
    getPivotalTrackerData(pull_request).done(function(data){
        data.labels.forEach(function(label){
            addLabel(pull_request,label.name);
        });
        addStateWithLink(pull_request,data);
    });
}

function addColumnToPullRequestTable(thClass,tdClass,thLabel,insertAfterIndex){
    var pr_table = jQuery('table.pull-requests-table');
    if(insertAfterIndex === -1){
        insertAfterIndex = pr_table.find('thead th').length;
    }
    var afterElem = pr_table.find('thead tr th:nth-child('+insertAfterIndex+')');
    jQuery('<th class="'+thClass+'">'+thLabel+'</th>').insertAfter(afterElem);
    pr_table.find('tbody tr').each(function(){
        afterElem = jQuery(this).find('td:nth-child('+insertAfterIndex+')');
        jQuery('<td class="'+tdClass+'"></td>').insertAfter(afterElem);
    });
}

function hideBuildStausValue(){
    var build_status_col = jQuery('table.pull-request-table th.build-status-pr-list-col');
    if(!build_status_col.is(':visible')){
        jQuery('td.build-status-pr-list-col-value').hide();
    }
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
        var story_number = jQuery(pr).find('a').text().match(/^(\d*).*/);
        if(story_number){
            story_number = story_number[1];
        }
        return {
            id: id,
            name: 'Test',
            merge_url: '/rest/api/latest/projects/'+getProjectPath()+'/pull-requests/'+id+'/merge',
            elem: pr,
            story_number: story_number,
            pivotal_trakcer_url: 'https://www.pivotaltracker.com/services/v5/stories/' + story_number
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

function getPivotalTrackerData(pull_request){
    var trackerDataReady = jQuery.Deferred();
    jQuery.get(pull_request.pivotal_trakcer_url).done(function(data){
        trackerDataReady.resolve(data);
    }).fail(function(data){
        trackerDataReady.reject();
    });
    return trackerDataReady;
}

function applyConflictStyle(pull_request){
    jQuery(pull_request.elem).
        closest('tr').
        find('.pull-request-merge-conflict-status-value').
        append('<span style="background-color: #f6c342;display: inline-grid;padding: 9px;border-radius: 9px;margin-left: 13px;">' +
            '<span title="Possible Merge Conflict" class="aui-icon aui-icon-small aui-iconfont-warning">' +
                'Possible Merge Conflict' +
            '</span>' +
        '</span>');

}

function addLabel(pull_request,label){
    jQuery(pull_request.elem).
        closest('tr').
        find('.pull-request-pivotal-tracker-labels-value').
        append('<span class="aui-lozenge aui-lozenge-moved">'+label+'</span> ');

}

function addStateWithLink(pull_request,data){
    var state_css = '';
    switch (data.current_state) {
        case 'accepted':
            state_css = 'success';
            break;
        case 'rejected':
            state_css = 'error';
            break;
        case 'delivered':
            state_css = 'moved';
            break;
        case 'finished':
            state_css = 'current';
            break;
        case 'started':
            state_css = 'complete';
            break;
    }
    jQuery(pull_request.elem).
    closest('tr').
    find('.pull-request-pivotal-tracker-state-value').
    append('<span class="aui-lozenge aui-lozenge-'+state_css+'">'+data.current_state+'</span> '+
    '<a target="_blank" href="'+data.url+'"><span class="aui-icon aui-icon-small aui-iconfont-share">Open PivotalTracker</span></a>');
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

