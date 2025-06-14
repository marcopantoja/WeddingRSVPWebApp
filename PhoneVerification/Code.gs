function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().addMetaTag(
      "viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
function getInviteData(phoneNumber) {
  var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties("SheetID"));
  var sheet = ss.getSheetByName('InviteList');
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var phoneNumberCol = header.indexOf('PhoneNumber');
  var personRow = null;
  for (var i = 1; i < data.length; i++) {
    if (data[i][phoneNumberCol] === phoneNumber) {
      personRow = data[i];
      Logger.log('matched entry to phone in invite list!');
      break;
    }
  }
  Logger.log(personRow);
  return personRow
}
function acceptData(formData){
  var phoneNumber = formData.primaryPhone;
  var personRow = getInviteData(phoneNumber);
  
  if (personRow) {
    var form2Url = 'https://script.google.com/macros/s/AKfycbx2QcIQEFNBTWx4Kkm9dmC-J79zpBE0iIbub8ME43khvkWf6ruVf4bP68RkX7NTXWbjLg/exec';
    form2Url += '?phoneNumber=' + phoneNumber;
    form2Url += '&guestID=0'
    Logger.log('URL-Redirect: '+form2Url);
  }else {
    var form2Url = 'NA';
  }
  return form2Url
}