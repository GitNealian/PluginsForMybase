//sValidation=nyfjs
//sCaption=插入当日照片
//sHint=添加当日照片到附件
//sCategory=MainMenu.Tools
//sPosition=Par-1
//sCondition=CURDB; DBRW;
//sID=toos.insertDailyPhotos
//sAppVerMin=7.0
//sShortcutKey=
//sAuthor=nealian

function getFirstChildDir(parent) {
    var d = CLocalDir(parent);
    var folders = d.listFolders()
    if (folders.length < 3) {
        return null;
    }
    return parent + d.listFolders()[2] + '/';
}

var nyf = new CNyfDb(-1); //　-1表示当前数据库 
var gvfsDir = "/run/user/1000/gvfs/";
var mtpDir = getFirstChildDir(gvfsDir);

if (mtpDir) {
    var storageDir = getFirstChildDir(mtpDir);
    if (storageDir) {
        var photoDir = storageDir + 'DCIM/Camera/';
        var d = CLocalDir(photoDir);
        var files = d.listFiles("*.jpg");
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var cnt = 0;
        for (i in files) {
            var f = new CLocalFile(photoDir + files[i]);
            var createDay = f.getCreateTime();
            createDay.setHours(0, 0, 0, 0);
            if (today.getTime() == createDay.getTime()) {
                var nBytes = nyf.createFile(plugin.getCurInfoItem() + '/' + files[i], photoDir + files[i]);
                if (nBytes >= 0) {
                    cnt++;
                }
            }
        }
        alert("成功添加" + cnt + "张图片到附件");
        plugin.refreshDocViews(-1);
    } else {
        alert("未找到存储设备");
    }

} else {
    alert("未找到MTP设备");
}
