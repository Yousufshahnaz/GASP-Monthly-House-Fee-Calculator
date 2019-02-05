function uploadInfoToGoogleSheets(input) {  
  var year = parseInt(input.date.substring(0,4));
  var month = parseInt(input.date.substring(5,7));
  fillSheetWithInfo(year, month, input.invoce);
  
}

function getMonthDiffFrom2017_10(year, month) {
    var months;
    months = (year - 2017) * 12;
    months -= 9 + 1;
    months += month;
    return months <= 0 ? 0 : months;
}

function getRowToEdit(year, month){
  var firtRowEditable = 5;
  var diff = getMonthDiffFrom2017_10(year, month);
  return firtRowEditable + diff;
}

function fillSheetWithInfo(year, month, invoce){
  var file = SpreadsheetApp.openById(config.googleSheetsFileId);
  Logger.log(file.getName());
  var row = getRowToEdit(year, month);  
  
  var sheet = file.getSheetByName("Foglio1");
  sheet.getRange("B"+row).setValue(year);
  sheet.getRange("C"+row).setValue(month);
  sheet.getRange("D"+row).setFormula(Utilities.formatString('=TEXT(DATE(B%s;C%s;1);"MMMM")',row,row));
  sheet.getRange("E"+row).setValue(650);
  sheet.getRange("F"+row).setValue(100);
  var valueForFormula = invoce.map(function(x) {
    return x.value;
  }).join(";");
  sheet.getRange("G"+row).setFormula('=SUM(' + valueForFormula + ')');

  var expenseDetails = invoce.map(function(x) {
    return x.company + "(" + x.type + ")";
  }).join(" + ");
  sheet.getRange("H"+row).setValue(expenseDetails);
  sheet.getRange("J"+row).setFormula(Utilities.formatString('=SUM(E%s;F%s;G%s)', row,row,row));

}
