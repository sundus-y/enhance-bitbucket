console.log('inside content.js');

function addDiffTool(){
    console.log("Reading Commits");
    clean();
    var commits = jQuery("td.changeset:not(:has(span.merge-lozenge))");
    commits.append("<span class='diff'>DIFF</span>");

}

function clean(){
    var diff = jQuery("span.diff")
    diff.remove();
}
