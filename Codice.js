function getYearAndMonthStringFromDate(date) {
  if (date.getMonth() == 11) {    //I do a  month +1 because e.g the fee on January should be paid in February
    var nextMonth = new Date(date.getFullYear() + 1, 0, 1);
  } else {
    var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, date.getHours(), date.getMinutes(), 0, 0);
  }

  var month = nextMonth.getUTCMonth() + 1; //months from 1-12
  var day = nextMonth.getUTCDate();
  var year = nextMonth.getUTCFullYear();

  var stringYear = "" + year;
  var stringMonth = month < 10 ? '0' + month : "";
  return stringYear + "-" + stringMonth;
}

function uploadAttachmentToDropbox(attachment, date, name) {
  var path = config.bropboxBasePath + date + "/" + date + "-" + name + ".pdf";
  uploadFileToDropbox(attachment, path);
}

function getInvoceCost(input, startString, endString) {
  var startIndex = input.indexOf(startString);

  var newinput = input.substring(startIndex + startString.length);
  var endIndex = newinput.indexOf(endString);

  var resultString = newinput.substring(0, endIndex);
  return resultString.match(/-?\d+\,?\d*/)[0];
}

function getDataFromFileText(filetext) {
  if (filetext.indexOf("cogeser") !== -1) {
    var startString = "Sintesi degli importi fatturati Euro (€)";
    var endString = "Spesa per la materia Gas Naturale";

    var cost = getInvoceCost(filetext, startString, endString);
    return {
      company: "Cogeser",
      type: "Gas",
      value: cost
    }

  } else if (filetext.indexOf("ENEGAN") !== -1) {
    var startString = "Totale da pagare: €";
    var endString = "••••••";

    var cost = getInvoceCost(filetext, startString, endString);
    return {
      company: "Enegan",
      type: "Energia Elettrica",
      value: cost
    }
  } else {
    throw "Found Unknown Attachments";
  }
}

function processesThread(thread) {
  var messages = GmailApp.getMessagesForThread(thread);
  var message = messages[0];      //In my scenario normally I have only one message for thread for that kind of mail
  var yearAndMonth = getYearAndMonthStringFromDate(message.getDate());
  var newLabel = config.homeLabel + "/" + yearAndMonth;
  thread.addLabel(GmailApp.createLabel(newLabel));

  var result = {
    date: yearAndMonth,
    invoce: []
  };

  var attachments = message.getAttachments();
  attachments.forEach(function (fileBlob, index) {
    Logger.log('"%s" (%s bytes)', fileBlob.getName(), fileBlob.getSize());

    var filetext = pdfToText(fileBlob, { keepTextfile: false });
    var invoceData = getDataFromFileText(filetext);
    result.invoce.push(invoceData);

    uploadAttachmentToDropbox(fileBlob, yearAndMonth, invoceData.company);
  });

  return result;
}

function isThreadAlreadyProcessed(thread) {
  return thread.getLabels().some(function (label) { return label.getName() == config.alreadyPrecessedLabel });
}

function main() {
  var label = GmailApp.getUserLabelByName(config.needToBeProcessedLabel);
  var threads = label.getThreads();
  for (var i = threads.length - 1; i >= 0; i--) { //Process them in the order received
    var thread = threads[i];

    if (!isThreadAlreadyProcessed(thread)) {
      var result = processesThread(thread);
      uploadInfoToGoogleSheets(result);
      Logger.log("result %s", JSON.stringify(result));

      thread.addLabel(GmailApp.getUserLabelByName(config.alreadyPrecessedLabel));
    }
  }
}