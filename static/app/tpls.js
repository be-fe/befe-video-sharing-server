window.rawTpls = _.extend({}, window.rawTpls, {
adminToken:"<input name=\"admin-token\" placeholder=\"请输入 admin token\">",
editVideo:"\n<div class=\"row\">\n    <label>操作: </label>\n    <a id=\"remove-video\" class=\"vex-dialog-button\">删除视频</a>\n</div>\n\n<div class=\"row\">\n    <label for=\"video-name\">视频名称</label>\n    <input type=\"text\" name=\"video-name\" value=\"<%- d.name %>\"/>\n</div>",
sidebarVideo:"<a class=\"video\" href=\"#video=<%- d.videoKey %>\">\n    <%- d.videoText %>\n    <span class=\"fa fa-edit edit\"></span>\n</a>"
});