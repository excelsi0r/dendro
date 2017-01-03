function UploadManager ()
{
    var self = this;

    if(self.__uploads == null)
    {
        self.__uploads = {};
    }
}

UploadManager.prototype.add_upload = function(username, filename, parent_folder)
{
    var newUpload = new Upload(username, filename, parent_folder);
    var id = newUpload.id;
    self.__uploads[id] = newUpload;
}

UploadManage.prototype.get_upload_by_id = function(id)
{
    var self = this;
    return self.__uploads[id];
}

exports.UploadManager = UploadManager;