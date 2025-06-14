function doGet(e) {
  return HtmlService.createTemplateFromFile('index').evaluate().addMetaTag(
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
function updateResponseSheet(data,guestData) {
  // Data Template
  // { groupAirSeats: '',
  // maxCommute: '',
  // groupAirInquiry: 'no',
  // '1BedRoomCount': '0',
  // phoneNumber: '8884445555',
  // maxBudget: '',
  // groupHotelInquire: 'no',
  // minBudget: '',
  // '2BedRoomCount': '0' }
  var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties("SheetID"));
  var responseSheet = ss.getSheetByName("Responses");
  var responseData = responseSheet.getDataRange().getValues();
  var responseHeader = responseData[0];
  var guestNameCol = responseHeader.indexOf('GuestName');
  var phoneNumberCol = responseHeader.indexOf('PhoneNumber');
  var groupHotelCol = responseHeader.indexOf('GroupHotel');
  var hotelBudMinCol = responseHeader.indexOf('HotelBudgetMin');
  var hotelBudgetMaxCol = responseHeader.indexOf('HotelBudgetMax');
  var oneBedRoomsCol = responseHeader.indexOf('OneBedRooms');
  var twoBedRoomsCol = responseHeader.indexOf('TwoBedRooms');
  var maxCommuteCol = responseHeader.indexOf('MaxCommute');
  var groupAirCol = responseHeader.indexOf('GroupAir');
  var numSeatsCol = responseHeader.indexOf('NumSeats');
  // Find the row to update
  let rowIndexToUpdate = -1;
  for (let i = 1; i < responseData.length; i++) { // Start at 1 to skip the header row
    if (responseData[i][guestNameCol].toString() === guestData.primaryInvite && responseData[i][phoneNumberCol].toString() === data.phoneNumber) {
      rowIndexToUpdate = i + 1; // Add 1 because sheet rows are 1-indexed, not 0-indexed
      break; // Exit the loop once found
    }
  }

  if (rowIndexToUpdate > -1) {
    // Create an array to hold the data for the row to update
    var rowDataToUpdate = responseSheet.getRange(rowIndexToUpdate,1,1,responseHeader.length).getValues()[0];
    if (data.groupHotelInquire === 'no'){
      data['1BedRoomCount'] = '';
      data['2BedRoomCount'] = '';
      data.minBudget = '';
      data.maxBudget = '';
      data.maxCommute = '';
    }
    if (data.groupAirInquiry === 'no') {
      data.groupAirSeats = '0';
    }
    // Update the row data with the form responses.
    if (groupHotelCol > -1) rowDataToUpdate[groupHotelCol] = data.groupHotelInquire;
    if (hotelBudMinCol > -1) rowDataToUpdate[hotelBudMinCol] = data.minBudget;
    if (hotelBudgetMaxCol > -1) rowDataToUpdate[hotelBudgetMaxCol] = data.maxBudget;
    if (oneBedRoomsCol > -1) rowDataToUpdate[oneBedRoomsCol] = data['1BedRoomCount'];
    if (twoBedRoomsCol > -1) rowDataToUpdate[twoBedRoomsCol] = data['2BedRoomCount'];
    if (maxCommuteCol > -1) rowDataToUpdate[maxCommuteCol] = data.maxCommute;
    if (groupAirCol > -1) rowDataToUpdate[groupAirCol] = data.groupAirInquiry;
    if (numSeatsCol > -1) rowDataToUpdate[numSeatsCol] = data.groupAirSeats;
    
    // Write the updated row data back to the sheet.
    responseSheet.getRange(rowIndexToUpdate, 1, 1, responseHeader.length).setValues([rowDataToUpdate]);
    console.log("Updated row " + rowIndexToUpdate + " for PrimaryInvite: " + guestData.primaryInvite + ", Phone Number: " + data.phoneNumber);
  } else {
    console.log("Row not found for PrimaryInvite: " + guestData.primaryInvite + ", Phone Number: " + data.phoneNumber);
    // Consider throwing an error or handling this case appropriately (e.g., write to an error sheet)
  }
}
function getFinishURL(data) {
  var guestData = getInviteData(data.phoneNumber);
  updateResponseSheet(data,guestData);
  return "https://www.byankaandrobertovasquez.com/rsvp-thank-you";
}