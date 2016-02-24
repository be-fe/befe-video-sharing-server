<div id="edit-tag">
    <div class="row">
        <label>时间</label>
        <a class="remove-tag vex-dialog-button vex-dialog-button-secondary">删除</a>
        <a class="set-as-current vex-dialog-button vex-dialog-button-secondary">当前时间</a>
        <input type="text" class="tag-time" value="<%- d.tagTimeId %>" name="tag-time"/>
    </div>
    <div class="row">
        <label for="">时间点名称</label>
        <input type="text" class="tag-name" value="<%- d.tagName %>" name="tag-name"/>
    </div>
</div>