//sValidation=nyfjs
//sCaption=复制条目链接
//sHint=复制当前条目链接到剪贴板
//sCategory=Context.Outline
//sPosition=Par-103
//sCondition=CURDB; DBRW; CURINFOITEM;
//sID=item.copypath
//sAppVerMin=7.0
//sShortcutKey=
//sAuthor=nealian

var SUCCESS = "复制成功：";
try {
    var nyf = new CNyfDb(-1); //-1: for the current one;
    var path = plugin.getCurInfoItem();
    var id = nyf.getItemIDByPath(path);
    var hint = nyf.getFolderHint(path);
    var html = "<a href=\"nyf://entry?itemid=" + id + "&itemtext=" + hint + "\">" + hint + "</a>";
    platform.setClipboardHtml(html);
    alert(SUCCESS + hint);
} catch (e) {
    alert(e);
}