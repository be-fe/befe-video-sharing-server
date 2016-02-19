window.rawTpls = _.extend({}, window.rawTpls, {
adminToken:"<input name=\"admin-token\" placeholder=\"请输入 admin token\">",
editVideo:"\n<div id=\"edit-video\">\n    <div class=\"row\">\n        <label>操作: </label>\n        <a class=\"remove-video vex-dialog-button vex-dialog-button-secondary\">删除视频</a>\n    </div>\n\n    <div class=\"row\">\n        <label for=\"video-name\">视频名称</label>\n        <input type=\"text\" name=\"video-name\" value=\"<%- d.videoName %>\"/>\n    </div>\n</div>",
sidebarVideo:"<a class=\"video\" video-key=\"<%- d.videoKey %>\" href=\"#video=<%- d.videoKey %>\">\n    <%- d.videoText %>\n    <span class=\"fa fa-edit edit\"></span>\n</a>"
});