function uploadFileToDropbox(file, path) {
  
    var parameters = {
      "path": path,
      "mode": "add",
      "autorename": true,
      "mute": false
    };
    
    //Dropbox Access Token
    var dropboxAccessToken = config.dropboxAccessToken;
    
    var headers = {
      "Content-Type": "application/octet-stream",
      'Authorization': 'Bearer ' + dropboxAccessToken,
      "Dropbox-API-Arg": JSON.stringify(parameters)
    };
      
    var options = {
      "method": "POST",
      "headers": headers,
      "payload": file.getBytes()
    };
    
    var apiUrl = "https://content.dropboxapi.com/2/files/upload";
    var response = JSON.parse(UrlFetchApp.fetch(apiUrl, options).getContentText());
    
    Logger.log("File uploaded successfully to Dropbox in %s", path);
  }