//sValidation=nyfjs
//sCaption=记录思维片段
//sHint=记录稍纵即逝的灵感
//sCategory=MainMenu.Tools
//sPosition=Par-1
//sCondition=CURDB; DBRW;
//sID=toos.recordThought
//sAppVerMin=7.0
//sShortcutKey=
//sAuthor=nealian

var nyf = new CNyfDb(-1); //　-1表示当前数据库 

var _createItemIfNotExist = function (ssgPath, title, id) {
    var xChild = new CLocalFile(ssgPath);
    xChild.append(id);
    if (!nyf.entryExists(xChild)) {
        if (nyf.createFolder(xChild)) {
            if (title) {
                nyf.setFolderHint(xChild, title);
            }
        } else {
            return null;
        }
    }
    return xChild.toString();
};
// 在ssgpath目录下新建一个目录，并设置标题为title
var _insertItem = function (ssgPath, title) {
    return _createItemIfNotExist(ssgPath, title, nyf.getChildEntry(ssgPath));

};
var thTitle = plugin.getLocaleMsg('ReocrdThoughts.thTitle', '思维片段') // 顶层目录标题
var thRootPath = '/Organizer/data/'; //　根目录ssg地址
var thId = '_thOuGhts'

// 如果顶层目录不存在则新建
var _createRootDirIfNotExist = function () {
    return _createItemIfNotExist(thRootPath, thTitle, thId);
};

// 调用输入框获得想法内容
var _getThoughts = function () {
    var title = plugin.getLocaleMsg('ReocrdThoughts.Input.title', '记录此刻的想法');
    var label = plugin.getLocaleMsg('ReocrdThoughts.Input.label', '内容');
    var thInput = input(title, [{
        sField: 'textarea',
        sLabel: label,
        bWordwrap: true,
        sInit: '',
        bRequired: true
    }]);
    if (thInput) {
        return thInput[0].toString();
    }
    return null;
};

// 在parentPath目录下通过子目录的标题找到子目录
// 假定这些目录只由本插件添加而没有其它人为操作，那么目录的标题是唯一的
var _findEntryByHint = function (parentPath, hint) {
    var folders = nyf.listFolders(parentPath);
    for (i in folders) {
        var parent = new CLocalFile(parentPath);
        parent.append(folders[i])
        if (nyf.getFolderHint(parent) == hint) {
            return parent;
        }
    }
    return null;
};

// 删除空的条目
var _removeEmptyDir = function (ssgpath) {
    if (nyf.getFolderCount(ssgpath) == 0) {
        nyf.deleteEntry(ssgpath);
    } else {
        var folders = nyf.listFolders();
        for (var i in folders) {
            var parent = new CLocalFile(ssgpath);
            _removeEmptyDir(parent.append(folders[i]));
        }
    }
};

//　添加失败时进行回滚操作
var _revertOnFail = function (failPath) {
    if (failPath) {
        nyf.deleteEntry(failPath);
    }
    _removeEmptyDir(thRootPath + thId);
};

var thText = _getThoughts();
if (thText && thText.length > 0) {
    if (_createRootDirIfNotExist()) {
        var curDate = new Date();
        var curYearFolder = _findEntryByHint(thRootPath+thId, curDate.getFullYear().toString());
        if (!curYearFolder) { //　不存在年目录
            curYearFolder = _insertItem(thRootPath+thId, curDate.getFullYear().toString())
        }
        if (curYearFolder) {
            var curMonth = curDate.getMonth() + 1;
            var curMonthFolder = _findEntryByHint(curYearFolder, curMonth.toString());
            if (!curMonthFolder) { //　不存在月目录
                curMonthFolder = _insertItem(curYearFolder, curMonth.toString());
            }
            if (curMonthFolder) {
                var curTimeFolder = _insertItem(curMonthFolder, curDate.toTimeString());
                if (curTimeFolder) {
                    if (nyf.linkCalendar(curTimeFolder, curDate, curDate, 0, 0)) { //建立日历关联
                        var xFn = new CLocalFile(curTimeFolder);
                        xFn.append(plugin.getDefNoteFn('html')); //新建hmtl文档
                        var thHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' +
                            '<html>\n' +
                            '<head>\n' +
                            '</head>\n' +
                            '<body><span style="font-family: \'Ubuntu Mono\'"><span style="white-space:pre"></span>' +
                            thText + '</span>\n'
                        '</body>\n' +
                        '</html>';
                        if (nyf.createTextFile(xFn, thHtml) >= 0) {
                            alert(plugin.getLocaleMsg('ReocrdThoughts.AddRecord.Success', '添加一条记录'))
                            plugin.refreshOutline(-1, thRootPath);
                            plugin.refreshCalendar(-1);
                            plugin.refreshOverview(-1);
                        } else {
                            _revertOnFail(curTimeFolder);
                            alert(plugin.getLocaleMsg('ReocrdThoughts.AddRecord.Fail', '添加记录失败'))
                        }
                    } else {
                        _revertOnFail(curTimeFolder);
                        alert(plugin.getLocaleMsg('ReocrdThoughts.LinkCalendar.Fail', '建立日历关联失败'))
                    }
                }

            }
        }
        if (!curYearFolder || !curMonthFolder || !curTimeFolder) {
            _revertOnFail();
            alert(plugin.getLocaleMsg('ReocrdThoughts.CreateItem.Fail', '创建条目失败'));
        }
    } else {
        alert(plugin.getLocaleMsg('ReocrdThoughts.CreateRootDir.Fail', '创建根目录失败'));
    }
}
