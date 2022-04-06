# CSE330

Zach Glabman 466464 zachglabman

Justin Novellas 486351 jj4619

# Welcome to zCal
- CSRF token passed for every fetch to the database to prevent malicious attacks, and relevant input is sanitized and output is escaped
- Validator returns no errors
- User stays logged in on refresh and AJAX is performed with POST

## Link

-  [Homepage](http://ec2-54-196-240-51.compute-1.amazonaws.com/~zachglabman/module5-group-m5-466464-486351/frontend.html)

## Login info
Try logging in with the below users (there are more but these few have events)

- username: zach // password: hi
- username: jj // password: jj

You can also create a user if you want to try that functionality out. Make sure you add an email when creating a user.

## Creative Portion

I mostly followed the wiki when adding a creative portion to the site. Tried my best to make it look pretty as well, so part of my creative (extra) was to create modals to display event information. Spent a lot of time trying to make a good user experience for the creative parts, so I had a few different moving pieces (js functions and php files) to make it work effectively.

**1. Tags**
- Add an optional tag when creating an event
- Tags will color the event when it is rendered on the frontend
- Remove or change the tag anytime by clicking the edit button within the event modal
**2. Invitee (adding a guest to an event)**
- The creator of an event can add an optional guest to the event
- The guest can see the event on their calendar, but cannot edit or delete the event
- The invitee can be changed by the creator any time by clicking the edit button
**3. Sharing calendar**
- A user can share their calendar with whomever they please (any number of emails)
- A recipient of the calendar can see all events, but not edit or delete any of them
- A recipient can be removed by clicking "Unshare calendar" and entering the email  accordingly
**4. Modals**
- When an event is clicked, a modal pops up, containing information for all events
- The creator of events can edit and delete events from within the modal
- Collapse the modal by clicking outside the modal
  

