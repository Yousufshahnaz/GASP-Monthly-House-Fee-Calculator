function printMessagesInfo(messages){
  messages.forEach(function(message){
    var from = message.getFrom();
    var date = message.getDate();
    var subject = message.getSubject();
    
    Logger.log('Message subject: "%s" from: %s  date:%s', subject, from, date);
  });
}

function main() {
  var label = GmailApp.getUserLabelByName("Need to be processed");
  var threads = label.getThreads();
  for (var i = threads.length - 1; i >= 0; i--) { //Process them in the order received
    var thread = threads[i];    
    printMessagesInfo(GmailApp.getMessagesForThread(thread));
  } 
}