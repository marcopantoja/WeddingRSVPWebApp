function doGet(e) {
  var phoneNumber = e.parameter.phoneNumber;
  var guestID = e.parameter.guestID;
  var guestData = getInviteData(phoneNumber);
  var guestName = guestData.allNames[parseInt(guestID)];
  var template = HtmlService.createTemplateFromFile('index');
  template.phoneNumber = phoneNumber;
  template.guestName = guestName;
  return template.evaluate().addMetaTag(
      "viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function getInviteData(phoneNumber) {
  var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties("SheetID"));
  var sheet = ss.getSheetByName('InviteList');
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var invitePhoneNumberCol = header.indexOf('PhoneNumber');
  var invitePersonNameCol = header.indexOf('PrimaryName');
  var inviteGuestNamesCol = header.indexOf('GuestNamesCommaSeparated');
  var personRow = null;
  for (var i = 1; i < data.length; i++) {
    if (data[i][invitePhoneNumberCol] === phoneNumber) {
      personRow = data[i];
      break;
    }
  }
  var personName = personRow[invitePersonNameCol];
  var phoneNumber = personRow[invitePhoneNumberCol];
  var guestList = personRow[inviteGuestNamesCol] ? personRow[inviteGuestNamesCol].split(',').map(name => name.trim()) : [];
  return {//Guest Data
      phoneNumber: phoneNumber,
      primaryInvite: personName,
      guestList: guestList,
      allNames: [personName].concat(guestList)
    };
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
function acceptData(data) {
  console.log(data);
  return getFinishURL(data);
}
function updateResponseSheet(data, guestData) {
  // Data Template
  // { verifiedName: 'TEST INVITE',
  // email: 'testemail@test.com',
  // softDrink: 'water',
  // isAttending: 'yes',
  // allergies: 'no',
  // winePreference: 'red',
  // phoneNumber: [ '1234567890', '8884445555', '8884445555' ],
  // textUpdates: 'yes',
  // emailUpdates: 'yes',
  // beerPreference: 'none',
  // over21: 'yes',
  // liquorPreference: [ 'vodka', 'tequila' ] }
  Logger.log(guestData);
  data.guestName = guestData.allNames[parseInt(data.guestID)];
  data.primaryInvite = guestData.primaryInvite;
  var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties("SheetID"));
  var responseSheet = ss.getSheetByName("Responses");
  var responseData = responseSheet.getDataRange().getValues();
  var responseHeader = responseData[0];
  var dateSubmittedCol = responseHeader.indexOf('DateSubmitted');
  var timeSubmittedCol = responseHeader.indexOf('TimeSubmitted');
  var guestNameCol = responseHeader.indexOf('GuestName');
  var verifiedGuestNameCol = responseHeader.indexOf('VerifiedGuestName');
  var primaryInviteCol = responseHeader.indexOf('PrimaryInvite');
  var phoneNumberCol = responseHeader.indexOf('PhoneNumber');
  var textUpdatesCol = responseHeader.indexOf('TextUpdates');
  var emailCol = responseHeader.indexOf('EmailAddress');
  var emailUpdatesCol = responseHeader.indexOf('EmailUpdates');
  var isAttendingCol = responseHeader.indexOf('IsAttending');
  var over21Col = responseHeader.indexOf('Over21');
  var softDrinkPrefCol = responseHeader.indexOf('SoftDrinkPref');
  var winePrefCol = responseHeader.indexOf('WinePref');
  var beerPrefCol = responseHeader.indexOf('BeerPref');
  var liquorPrefCol = responseHeader.indexOf('LiquorPref');
  var allergiesCol = responseHeader.indexOf('Allergies');
  // Find the row to update
  let rowIndexToUpdate = -1;
  for (let i = 1; i < responseData.length; i++) { // Start at 1 to skip the header row
    if (responseData[i][guestNameCol] === data.guestName && responseData[i][primaryInviteCol] === data.primaryInvite) {
      rowIndexToUpdate = i + 1; // Add 1 because sheet rows are 1-indexed, not 0-indexed
      break; // Exit the loop once found
    }
  }
  if (rowIndexToUpdate === -1){
    var rowDataToUpdate = [];
    for (var i=0; i<responseHeader.length; i++){
      rowDataToUpdate.push(null);
    }
  }else{
    var rowDataToUpdate = responseSheet.getRange(rowIndexToUpdate,1,1,responseHeader.length).getValues()[0];
  }
    // Clean data in case of backward form navigation
    if (data.isOver21 === 'no' || data.isAttending === 'no'){
      data.winePreference = '';
      data.beerPreference = '';
      data.liquorPreference = '';
    }
    if (data.isAttending === 'no') {
      data.verifiedName = '';
      data.phoneNumber = '';
      data.email = '';
      data.emailUpdates = '';
      data.textUpdates = '';
      data.softDrink = '';
      data.over21 = '';
      data.allergies = '';
    }
    if (data.textUpdates === 'no' ){
      data.phoneNumber[0] = '';
    }
    if (data.guestID === '0'){
      data.phoneNumber[0] = data.phoneNumber[1];
    }
    if (data.emailUpdates === 'no'){
      data.email = '';
    }
    if (data.over21 === 'no'){
      data.winePreference = '';
      data.beerPreference = '';
      data.liquorPreferece = '';
    }else {
      data.winePreference = data.winePreference.toString();
      data.liquorPreference = data.liquorPreference.toString();
      data.beerPreference = data.beerPreference.toLowerCase();
    }
    data.allergies = data.allergies.toLowerCase();
    if (data.allergies.replace(/\s/g, "") === 'no' || data.allergies.replace(/\s/g, "") === 'none'){ data.allergies = '';}
    if (data.beerPreference.replace(/\s/g, "") === 'no' || data.beerPreference.replace(/\s/g, "") === 'none'){ data.beerPreference = '';}
    var now = new Date();
    var timezone = Session.getScriptTimeZone();
    var date = Utilities.formatDate(now, timezone, "yyyy-MM-dd");
    var time = Utilities.formatDate(now, timezone, "HH:mm:ss");
    // Update the row data with the form responses.
    if (dateSubmittedCol > -1) rowDataToUpdate[dateSubmittedCol] = date;
    if (timeSubmittedCol > -1) rowDataToUpdate[timeSubmittedCol] = time;
    if (guestNameCol > -1) rowDataToUpdate[guestNameCol] = data.guestName;
    if (verifiedGuestNameCol > -1) rowDataToUpdate[verifiedGuestNameCol] = data.verifiedName;
    if (primaryInviteCol > -1) rowDataToUpdate[primaryInviteCol] = data.primaryInvite;
    if (phoneNumberCol > -1) rowDataToUpdate[phoneNumberCol] = data.phoneNumber[0];
    if (textUpdatesCol > -1) rowDataToUpdate[textUpdatesCol] = data.textUpdates;
    if (emailCol > -1) rowDataToUpdate[emailCol] = data.email;
    if (emailUpdatesCol > -1) rowDataToUpdate[emailUpdatesCol] = data.emailUpdates;
    if (isAttendingCol > -1) rowDataToUpdate[isAttendingCol] = data.isAttending;
    if (over21Col > -1) rowDataToUpdate[over21Col] = data.over21;
    if (softDrinkPrefCol > -1) rowDataToUpdate[softDrinkPrefCol] = data.softDrink.toLowerCase();
    if (winePrefCol > -1) rowDataToUpdate[winePrefCol] = data.winePreference;
    if (beerPrefCol > -1) rowDataToUpdate[beerPrefCol] = data.beerPreference;
    if (liquorPrefCol > -1) rowDataToUpdate[liquorPrefCol] = data.liquorPreference;
    if (allergiesCol > -1) rowDataToUpdate[allergiesCol] = data.allergies;
  if (rowIndexToUpdate > -1) {//Already in the table overwrite previous values
    // Write the updated row data back to the sheet.
    responseSheet.getRange(rowIndexToUpdate, 1, 1, responseHeader.length).setValues([rowDataToUpdate]);
    console.log("Updated row "+ rowIndexToUpdate +" for Guest: "+ data.guestName+ ", Primary: " + data.primaryInvite);
  } else {// Not in the table append row
    responseSheet.appendRow(rowDataToUpdate);
    console.log("Appended row for Guest: " + data.guestName + ", Primary: " + data.primaryInvite);
  }
}
function getFinishURL(data) {
  var guestData = getInviteData(data.phoneNumber[1]);
  var guestID = parseInt(data.guestID);
  var nextURL = "https://script.google.com/macros/s/AKfycbx2QcIQEFNBTWx4Kkm9dmC-J79zpBE0iIbub8ME43khvkWf6ruVf4bP68RkX7NTXWbjLg/exec?phoneNumber=";
  nextURL += data.phoneNumber[1];
  nextURL += "&guestID="+(guestID+1);
  if (guestID === 0 && data.isAttending === 'no'){
    var nextURL = "https://www.byankaandrobertovasquez.com/rsvp-thank-you";
  }else if (guestID === guestData.guestList.length) { //all guests rsvp complete go to air/hotel
    var nextURL = "https://script.google.com/macros/s/AKfycbzcMT2unjcrEZQjNhqATzZwzqsbfQ8QmJpeUjWAWVjhGSbY4gjVj6nm6BNT2nf8axvx/exec?phoneNumber="+data.phoneNumber[1];
  }
  updateResponseSheet(data,guestData);
  return nextURL;
}