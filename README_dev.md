
# Wedding RSVP Web App

This project is a Google Apps Script-based RSVP system for a wedding website. It is composed of **three separate Web App forms**, each serving a unique purpose in collecting information from invitees. The apps are designed to run sequentially based on user input and backend validation of guest data via a Google Sheet.

## 📁 Structure

- **PhoneVerification/** — First step to validate access to the RSVP form.
- **GuestInfoQuery/** — Collects attendance, dietary, and drink preferences per guest.
- **TravelInfoQuery/** — Collects interest in group hotel and air travel.

---

## 🔁 Flow Overview

1. **Phone Verification**
   - Embedded at [www.byankaandrobertovasquez.com/rsvp](http://www.byankaandrobertovasquez.com/rsvp)
   - Guests enter the phone number of the primary invitee.
   - If validated against a Google Sheet, guests are redirected to the Guest Info form.

2. **Guest Info Collection**
   - Begins with the primary invitee.
   - If primary guest is not attending, flow ends.
   - If attending, form continues for each guest in the invitation:
     - Attendance
     - Text/email updates
     - Allergies & preferences for wine, liquor, beer, soft drinks
     - Age verification

3. **Travel Inquiry**
   - Asks if user is interested in group hotel booking or air travel.
   - Collects desired budget, room configurations, commute tolerances, and seat count.

---

## Form Details

### PhoneVerification

PhoneVerification has 4 backend functions and 1 form(s).
- Backend Functions: doGet, include, getInviteData, acceptData
- Form Fields:
viewport
primaryPhone

### GuestInfoQuery

GuestInfoQuery has 6 backend functions and 1 form(s).
- Backend Functions: doGet, getInviteData, include, acceptData, updateResponseSheet, getFinishURL
- Form Fields:
viewport
isAttending
verifiedName
textUpdates
phoneNumber
emailUpdates
email
allergies
softDrink
over21
winePreference
liquorPreference
beerPreference

### TravelInfoQuery

TravelInfoQuery has 6 backend functions and 1 form(s).
- Backend Functions: doGet, getInviteData, include, acceptData, updateResponseSheet, getFinishURL
- Form Fields:
viewport
groupHotelInquire
maxBudget
minBudget
1BedRoomCount
2BedRoomCount
maxCommute
groupAirInquiry
groupAirSeats

---

## 📋 Example Route

1. Guest enters `123-456-7890` (primary phone) → verified.
2. Redirected to GuestInfoQuery form:
   - Primary guest confirms attendance
   - Provides preferences
   - Continues for Guest 2 & Guest 3 (if listed)
3. Final redirection to TravelInfoQuery:
   - Indicate interest in group hotel
   - Enter max/min budget, preferred commute
   - Optionally enter air travel seat interest

---

## 🔧 Deployment Notes

- Each subfolder is deployed as an individual Web App via Apps Script.
- Make sure `Code.gs` files have `doGet()` entrypoints.
- Update Google Sheet references inside `getInviteData()` functions.
- Use Google Apps Script dashboard to deploy & manage versioning.

