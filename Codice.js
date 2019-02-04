function getYearAndMonthStringFromDate(date){  
  if (date.getMonth() == 11) {    //I do a  month +1 because e.g the fee on January should be paid in February
    var nextMonth = new Date(date.getFullYear() + 1, 0, 1);
  } else {
    var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, date.getHours(), date.getMinutes(), 0, 0);
  }
  
  var month = nextMonth.getUTCMonth() + 1; //months from 1-12
  var day = nextMonth.getUTCDate();
  var year = nextMonth.getUTCFullYear();
  
  var stringYear = "" + year;
  var stringMonth = month<10 ? '0'+month : "";
  return stringYear + "-" + stringMonth;
}

function uploadAttachmentToDropbox(attachment, date, name){
  var path = config.bropboxBasePath + date + "/"+ date + "-" + name + ".pdf";
  uploadFileToDropbox(attachment, path);
}

function processesThread(thread){

  var messages = GmailApp.getMessagesForThread(thread);
  var message = messages[0];      //In my scenario normally I have only one message for thread for that kind of mail
  var yearAndMonth = getYearAndMonthStringFromDate(message.getDate());
  var newLabel = "Casa Gorgonzola/" + yearAndMonth;
  thread.addLabel(GmailApp.createLabel(newLabel)); 


  var attachments = message.getAttachments();
  attachments.forEach(function(fileBlob, index){
    Logger.log('"%s" (%s bytes)', fileBlob.getName(), fileBlob.getSize());    
    uploadAttachmentToDropbox(fileBlob, yearAndMonth, "pdf-"+index);    
  });
}

function isThreadAlreadyProcessed(thread){
  return thread.getLabels().some(function(label){ return label.getName() == "Processed by Google Script" });
}

function main() {
  var label = GmailApp.getUserLabelByName("Need to be processed");
  var threads = label.getThreads();
  for (var i = threads.length - 1; i >= 0; i--) { //Process them in the order received
    var thread = threads[i];   
    
    if (!isThreadAlreadyProcessed(thread)){    
      processesThread(thread);
      thread.addLabel(GmailApp.getUserLabelByName("Processed by Google Script"));
    }
  }  
}