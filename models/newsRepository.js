const Repository = require('./Repository');
const NewsFilesRepository = require('./newsFIlesRepository.js');
const News = require('./news.js');
const utilities = require("../utilities");
module.exports = 
class NewsRepository extends Repository {
    constructor(req, params){
        super('Images', true);
        this.users = new Repository('Users');
        this.req = req;
        this.params = params;
        this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
    }
    bindUsernameAndImageURL(news){
        if (news) {
            let user = this.users.get(news.UserId);
            let username = "unknown";
            let userAvatarURL = "";
            if (user !== null) {
                username = user.Name;
                if (user.AvatarGUID != "")
                    userAvatarURL = "http://" + this.req.headers["host"] + NewsFilesRepository.getImageFileURL(user["AvatarGUID"]);
            } 
            let bindedImage = {...news};
            bindedImage["Username"] = username;
            bindedImage["UserAvatarURL"] = userAvatarURL;
            const datesOptions = { hour:'numeric', minute:'numeric', second:'numeric'};
            bindedImage["Date"] = new Date(news["Created"] * 1000).toLocaleDateString('fr-FR', datesOptions);

            if (news["GUID"] != ""){
                bindedImage["OriginalURL"] = "http://" + this.req.headers["host"] + NewsFilesRepository.getImageFileURL(news["GUID"]);
                bindedImage["ThumbnailURL"] = "http://" + this.req.headers["host"] + NewsFilesRepository.getThumbnailFileURL(news["GUID"]);
            } else {
                bindedImage["OriginalURL"] = "";
                bindedImage["ThumbnailURL"] = "";
            }
            return bindedImage;
        }
        return null;
    }
    
    add(image) {
        image["Created"] = utilities.nowInSeconds();
        if (News.valid(image)) {
            image["GUID"] = NewsFilesRepository.storeImageData("", image["ImageData"]);
            delete image["ImageData"];
            return super.add(image);
        }
        return null;
    }
    update(image) {
        image["Created"] = utilities.nowInSeconds();
        if (News.valid(image)) {
            let foundImage = super.get(image.Id);
            if (foundImage != null) {
                image["GUID"] = NewsFilesRepository.storeImageData(image["GUID"], image["ImageData"]);
                delete image["ImageData"];
                return super.update(image);
            }
        }
        return false;
    }
    remove(id){
        let foundImage = super.get(id);
        if (foundImage) {
            NewsFilesRepository.removeImageFile(foundImage["GUID"]);
            return super.remove(id);
        }
        return false;
    }
}