window.rawTpls = _.extend({}, window.rawTpls, {
adminToken:"<input name=\"admin-token\" placeholder=\"请输入 admin token\">",
sidebarVideo:"<a class=\"video\" href=\"#video=<%- d.videoKey %>\">\n    <%- d.videoText %>\n</a>"
});