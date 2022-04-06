//helper functions
function hide(element){
    element.style.display = "none";
}
function show(element){
    element.style.display = "block";
}
function clear(element){
    element.value = "";
}

function defaultForm() {
    // clear all values
    clear(document.getElementById("title"));
    clear(document.getElementById("content"));
    clear(document.getElementById("event_id_placeholder"));
    clear(document.getElementById("invitee-email"));

    // show defaults
    hide(document.getElementById("save_edit_cancel"));
    show(document.getElementById("new_event_cancel"));
    hide(document.getElementById("save_edit_event"));
    show(document.getElementById("new_event_submit"));

    hide(document.getElementById("event_details"));
    show(document.getElementById("create_event"));
    show(document.getElementById("add_subscriber"));
    show(document.getElementById("add_unsubscriber"));
}

//click anywhere outside modal popup and modal will disappear
function closeModal(event) {
    if (event.target == document.getElementById("modal")) {
        hide(document.getElementById("modal"));
      }
}

// renders top events from a given day at an index (indexes 0-2)
function renderEvent(num){

     // if logged in, fetch php page to query events

    if (localStorage.isLoggedin == "true") {

        //only show max of 3 events per calendar entry, descending order.
        const data = { 'day' : num, 'token' : localStorage.token };

        fetch("backend/render_events.php", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'content-type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                
                // const events = document.querySelectorAll('.rendered-event');
                // events.forEach(event => {
                // event.remove();
                //     });
                let eventData = data["data"];
                // add 3 children nodes to display events on main cal when logged in (if there are 3 to render)
                for (let i = 0; i<3; i++){  
                    
                    if (eventData[i] != null){

                        newNode = document.createElement("div");
                        newNode.setAttribute("class","rendered-event"); // .class wasn't working
                        // change the background to the color of the tag
                        newNode.setAttribute("style", `background-color: ${eventData[i].tag};`);
                        newNode.innerText = `${eventData[i].title}, ${eventData[i].startTime.substring(10,16)}-${eventData[i].endTime.substring(10,16)}`;
                        if (currentMonth.month == parseInt(eventData[i].startTime.substring(5,7))-1 && currentMonth.year == parseInt(eventData[i].startTime.substring(0,4))){
                            document.getElementById(String(num)).appendChild(newNode);
                        
                            if (i==2){
                                // add "more..." in block if there are more than 3 events for a given day
                                if (eventData.length > 3){
                                    newNode = document.createElement("div");
                                    newNode.innerText = "More...";
                                    document.getElementById(String(num)).appendChild(newNode);
                                    
                                }
                            }
                        }

                    }
                }
                
            }
                )
            .catch(err => console.error(err));

    }
    //else prompt user to login
    else{
        console.log("Login to see events.");
    }
}

// Clicking on a given <td> expands it out into a modal showing all events on *that date*
function eventModal(day) {

    // if logged in, fetch php page to query events
    // add modal to page when clicked

   if(localStorage.isLoggedin == "true") {

    show(document.getElementById("modal"));

       //only show max of 3 events per calendar entry, descending order.
       const data = { 'day' : day, 'token' : localStorage.token };

       fetch("backend/render_events.php", {
               method: 'POST',
               body: JSON.stringify(data),
               headers: { 'content-type': 'application/json' }
           })
           .then(response => response.json())
           .then(data => {

            let modalContentNode = document.getElementById("modal-popup");
            while (modalContentNode.firstChild) {
                modalContentNode.removeChild(modalContentNode.firstChild);
            }

            console.log(data.message);

            // close button outside of for loop
            contentNode = document.createElement("div");

            closeNode = document.createElement("div");
            closeNode.id = "closeModal";
            closeNode.innerText = "(click outside modal to close)";
            contentNode.appendChild(closeNode);

            let eventData = data["data"];

            if (eventData.length > 0){
                todayNode = document.createElement("div");
                todayNode.id = "modal-title";
                todayNode.innerText = `Events on ${monthArray[currentMonth.month]} ${day}, ${currentMonth.year}`;
                contentNode.appendChild(todayNode);
            }
            
            // add all children nodes to display events
            else if (eventData.length == 0){
                contentNode.id = "modal-title";
                noEventNode = document.createTextNode(`No events on ${monthArray[currentMonth.month]} ${day}.`);
                contentNode.appendChild(noEventNode);
            }

            for (let i = 0; i < eventData.length; i++){
               
                if ((eventData[i]) != null){
                    //populating the modal (if the day clicked is the same as data point)

                    // if (currentMonth.day == day){ --> dont need since query covers this
                        // content
                        pNode = document.createElement("p");
                        if (eventData[i].invitee != ""){
                            textNode = document.createTextNode(`${i+1}. ${eventData[i].title}, ${eventData[i].startTime.substring(10,16)}-${eventData[i].endTime.substring(10,16)} (${eventData[i].duration}hr) \n ${eventData[i].content} (creator: ${eventData[i].username}) (guest: ${eventData[i].invitee})`);
                        }
                        else{
                            textNode = document.createTextNode(`${i+1}. ${eventData[i].title}, ${eventData[i].startTime.substring(10,16)}-${eventData[i].endTime.substring(10,16)} (${eventData[i].duration}hr) \n ${eventData[i].content} (creator: ${eventData[i].username})`);
                        }
                        pNode.appendChild(textNode);
                        pNode.id = eventData[i].event_id;
                        pNode.setAttribute("class","rendered-event");
                        pNode.setAttribute("style", `background-color: ${eventData[i].tag};`);
                        // render edit and delete buttons (iff correct user is logged in)
                        if (localStorage.user_id == eventData[i].creator){
                            lineBreak = document.createElement("br");
                            editNode = document.createElement("button");
                            editNode.innerText = "Edit";
                            // editNode.class = "edit-btn";
                            pNode.appendChild(editNode);
                            
                            editNode.addEventListener("click", () => {let editID = parseInt(eventData[i].event_id); editEvent(editID);}, false);

                            deleteNode = document.createElement("button");
                            deleteNode.innerText = "Delete";
                            // deleteNode.class = "delete-btn";
                            pNode.appendChild(deleteNode);
                            deleteNode.addEventListener("click", () => { let deleteID = parseInt(eventData[i].event_id); deleteEvent(deleteID);}, false);

                            
                        }
                        // append each pNode to the overall content node within modal-popup
                        contentNode.appendChild(pNode);
                    // }
                    
                }
            }
            modalContentNode.appendChild(contentNode);
        }
            )
           .catch(err => console.error(err));

   }

   else{
       alert("Login to see events.");
   }
}

document.getElementById("save_edit_event").addEventListener("click", () => saveEdits(parseInt(document.getElementById("event_id_placeholder").value)), false);


// MAIN CALENDAR FUNCTION

// current month in a global variable
let currentMonth = new Month(2022, 2); // March 2022
const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Change the month when the "next" button is pressed
document.getElementById("next-month").addEventListener("click", function(event){
	currentMonth = currentMonth.nextMonth();
	updateCalendar(); // As in the wiki, re-render the calendar in HTML
}, false);

// Also when "prev" button is pressed
document.getElementById("prev-month").addEventListener("click", function(event){
	currentMonth = currentMonth.prevMonth();
	updateCalendar(); // As in the wiki, re-render the calendar in HTML
}, false);

// This updateCalendar() function populates the dates in the currently specified month
function updateCalendar(){

    // remove all children from date-table dom
    const dateNode = document.getElementById("date-table");
    while (dateNode.firstChild) {
    dateNode.removeChild(dateNode.firstChild);
    }

    // render Month, Year into "my-render" id
    document.getElementById("my-render").textContent = `${monthArray[currentMonth.month]}, ${currentMonth.year}`;

    //create new children <tr> nodes by the amount of weeks
    //create new children <td> nodes by days, per <tr> node

    let weeks = currentMonth.getWeeks();

    // 29 total days (inclusive) in month + day of the week of last day of month - first day of week of month
    const date = new Date(currentMonth.year, currentMonth.month,1);
    const dayBeforeNextMonth = new Date(currentMonth.year, currentMonth.month + 1, 0);
    let firstDay = date.getDay();
    let lastDay = (weeks.length-1)*7+1 + dayBeforeNextMonth.getDay() - firstDay;


    // for loops

	for(let w in weeks){
		let days = weeks[w].getDates();
		// days contains normal JavaScript Date objects
		
    document.getElementById("date-table").appendChild(document.createElement("tr"));
		
		for(let d in days){
            // to calculate actual day: multiply 7 by week index, add day+1 (0 indexed) and subtract start date of month
            let num = parseInt(w)*7 + parseInt(d) +1 - firstDay;
			// Only print if between 1 and 31
			document.getElementsByTagName("tr")[w].appendChild(document.createElement("td"));

            if (num > 0 && num <= lastDay){
                document.getElementsByTagName("tr")[w].getElementsByTagName("td")[d].id = num;
                document.getElementsByTagName("tr")[w].getElementsByTagName("td")[d].textContent = num;
            
                if (localStorage.isLoggedin == "true") {
                    //render top 3 elements on cal
                    renderEvent(num);

                    //adding event listner for modals within for loop
                    // this should work with for loop "let" d as days -> each variable has its own function
                    document.getElementById(String(num)).addEventListener("click", () => eventModal(num), false);

                }
            }
		}
	}
}

// manual update of calendar since different js pages do not connect
document.addEventListener("DOMContentLoaded", updateCalendar, false);

// closing the modal
window.addEventListener("click", closeModal, false);


// EVENTS

// createNewEvent, renderEvent (when clicked), editEvent, deleteEvent

//render this once new event button is clicked
function newEventForm(event){

    //show or hide buttons accordingly
    hide(document.getElementById("create_event"));
    hide(document.getElementById("add_subscriber"));
    hide(document.getElementById("add_unsubscriber"));
    show(document.getElementById("event_details"));

}

//ajax fetch create_event.php file
function createNewEvent(event) {

    const title = document.getElementById("title").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const content = document.getElementById("content").value;
    const tag = document.getElementById("tag").value;
    const invitee = document.getElementById("invitee-email").value;

    // const creator = localStorage.username;
    //for duration calculation
    const startEvent = new Date(start);
    const endEvent = new Date(end);
    const eventDuration = ((endEvent - startEvent) / 3600000).toFixed(2); //to convert milliseconds to hours, divide by 3.6 million


    // Make a URL-encoded string for passing POST data:
    const data = { 'title': title, 'start': start, 'end' : end, 'duration' : eventDuration, 'content' : content, 'tag' : tag, 'invitee' : invitee, 'token' : localStorage.token };

    fetch("backend/create_event.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            hide(document.getElementById("event_details"));
            show(document.getElementById("create_event"));
            show(document.getElementById("add_subscriber"));
            show(document.getElementById("add_unsubscriber"));
            updateCalendar();

            clear(document.getElementById("title"));
            clear(document.getElementById("content"));
            clear(document.getElementById("invitee-email"));

            //remove selection from <select> element - not needed?
            //document.getSelection().removeAllRanges();
        })
        .catch(err => console.error(err));

}

// SHARING THE CALENDAR
function newSubscriberForm(){

    //show or hide buttons accordingly
    hide(document.getElementById("create_event"));
    hide(document.getElementById("add_subscriber"));
    hide(document.getElementById("add_unsubscriber"));
    show(document.getElementById("subscriber_details"));

}

function newUnsubscriberForm(){

    //show or hide buttons accordingly
    hide(document.getElementById("create_event"));
    hide(document.getElementById("add_unsubscriber"));
    hide(document.getElementById("add_subscriber"));
    show(document.getElementById("unsubscriber_details"));

}

function unsubscribe() {
    const email = document.getElementById("unsubscriber-email").value;

    const data = { 'email': email, 'token' : localStorage.token };

    fetch("backend/unsubscribe.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        hide(document.getElementById("unsubscriber_details"));
        show(document.getElementById("create_event"));
        show(document.getElementById("add_unsubscriber"));
        show(document.getElementById("add_subscriber"));
        updateCalendar();

        clear(document.getElementById("unsubscriber-email"));
    })
    .catch(err => console.error(err));


}

function fetchSubscriberId() {
    const email = document.getElementById("subscriber-email").value;

    const data = { 'email': email, 'token' : localStorage.token };

    fetch("backend/locate_subscriber.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        
        createNewSubscriber(data.subscriber_id, data.subscriber_email);
    })
    .catch(err => console.error(err));


}

//ajax fetch create_event.php file
function createNewSubscriber(subscriber_id, subscriber_email) {

    // Make a URL-encoded string for passing POST data:
    const data = { 'subscriber': subscriber_email, 'subscriber_id' : subscriber_id, 'token' : localStorage.token };

    fetch("backend/add_subscriber.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            hide(document.getElementById("subscriber_details"));
            show(document.getElementById("create_event"));
            show(document.getElementById("add_subscriber"));
            updateCalendar();

            clear(document.getElementById("subscriber-email"));

            //remove selection from <select> element - not needed?
            //document.getSelection().removeAllRanges();
        })
        .catch(err => console.error(err));

}

// new subscriber event listeners
document.getElementById("add_subscriber").addEventListener("click", newSubscriberForm, false);
document.getElementById("new_subscriber_submit").addEventListener("click", fetchSubscriberId, false);
document.getElementById("new_subscriber_cancel").addEventListener("click", function(){
    hide(document.getElementById("subscriber_details"));
    show(document.getElementById("add_subscriber"));
    show(document.getElementById("add_unsubscriber"));
    show(document.getElementById("create_event"));
}, false);

// unsubscribe event listeners
document.getElementById("add_unsubscriber").addEventListener("click", newUnsubscriberForm, false);
document.getElementById("new_unsubscriber_submit").addEventListener("click", unsubscribe, false);
document.getElementById("new_unsubscriber_cancel").addEventListener("click", function(){
    hide(document.getElementById("unsubscriber_details"));
    show(document.getElementById("add_subscriber"));
    show(document.getElementById("add_unsubscriber"));
    show(document.getElementById("create_event"));
}, false);

// new event flow event listeners
document.getElementById("create_event").addEventListener("click", newEventForm, false);
document.getElementById("new_event_submit").addEventListener("click", createNewEvent, false);
document.getElementById("new_event_cancel").addEventListener("click", function(){
    hide(document.getElementById("event_details"));
    show(document.getElementById("create_event"));
    show(document.getElementById("add_subscriber"));
    show(document.getElementById("add_unsubscriber"));
}, false);
document.getElementById("save_edit_cancel").addEventListener("click", defaultForm, false);

// SAVE EDITS
function saveEdits(id) {
    // tedious to have two separate functions, but makes sense to me

    const title = document.getElementById("title").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const content = document.getElementById("content").value;
    const tag = document.getElementById("tag").value;
    const invitee = document.getElementById("invitee-email").value;
    
    //for duration calculation
    const startEvent = new Date(start);
    const endEvent = new Date(end);
    const eventDuration = ((endEvent - startEvent) / 3600000).toFixed(2);

    // just id to query the info
    const data = { 'event_id' : id, 'title': title, 'start': start, 'end' : end, 'duration' : eventDuration, 'content' : content, 'tag' : tag, 'invitee' : invitee, 'token' : localStorage.token };

    fetch("backend/save_edit_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // show(document.getElementById("new_event_submit"));
        // hide(document.getElementById("event_details"));
        // hide(document.getElementById("save_edit_event"));
        // show(document.getElementById("create_event"));
        defaultForm();
        updateCalendar();
    })
    .catch(err => console.error(err));

}
// EDIT EVENT
function editEvent(id) {

    // just id to query the info
    const data = { 'event_id' : id, 'token' : localStorage.token };

    fetch("backend/edit_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {

        hide(document.getElementById("create_event"));
        hide(document.getElementById("add_subscriber"));
        hide(document.getElementById("add_unsubscriber"));

        document.getElementById("title").value = data[0].title;
        document.getElementById("start").value = data[0].startTime;
        document.getElementById("end").value = data[0].endTime;
        document.getElementById("content").value = data[0].content;
        document.getElementById("event_id_placeholder").value = data[0].event_id;
        document.getElementById("tag").value = data[0].tag;
        document.getElementById("invitee-email").value = data[0].invitee;

        hide(document.getElementById("modal"));
        show(document.getElementById("event_details"));
        hide(document.getElementById("new_event_submit"));
        show(document.getElementById("save_edit_event"));
        hide(document.getElementById("new_event_cancel"));
        show(document.getElementById("save_edit_cancel"));

    })
    .catch(err => console.error(err));
}
// DELETE EVENT
function deleteEvent(id) {
    // just id to query the info
    const data = { 'event_id' : id, 'token' : localStorage.token };

    fetch("backend/delete_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        hide(document.getElementById("modal"));
        updateCalendar();
    })
    .catch(err => console.error(err));
}

// LOGIN LOGOUT

//Login functionality - login, logout, conditional renders, main calendar rendering when logged in

//Login, logout, conditional renders when logged in or out
function hide(element){
    element.style.display = "none";
}
function show(element){
    element.style.display = "block";
}
function clear(element){
    element.value = "";
}

// if user is logged in, don't display the login or signup flow anymore, add username to navbar
function conditionalRender(){
    //if logged in
    if(localStorage.isLoggedin == "true") {

        // hide login flow and sign up flow when logged in
        hide(document.getElementById("login_flow"));
        clear(document.getElementById("login_username"));
        clear(document.getElementById("login_password"));

        hide(document.getElementById("signup_flow"));
        clear(document.getElementById("register_username"));
        clear(document.getElementById("register_password"));

        hide(document.getElementById("event_details"));
        clear(document.getElementById("title"));
        clear(document.getElementById("content"));
    
        document.getElementById("current_user").innerText = localStorage.username;

        document.getElementById("logout-btn").textContent = "Logout";
        document.getElementById("logout-btn").addEventListener("click", logoutUser, false);

        show(document.getElementById("create_event"));
        show(document.getElementById("add_subscriber"));
        show(document.getElementById("add_unsubscriber"));
        
    }
    else{
        document.getElementById("current_user").textContent = "";
        document.getElementById("logout-btn").textContent = "";

        hide(document.getElementById("create_event"));
        hide(document.getElementById("add_subscriber"));
        hide(document.getElementById("add_unsubscriber"));
        show(document.getElementById("login_flow"));
        show(document.getElementById("signup_flow"));
        
    }

}

// logout user
function logoutUser() {
    fetch("backend/logout.php", {
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    })
    .then(response => {
        console.log("logged out!");
        localStorage.isLoggedin = false;
        localStorage.username = "";
        localStorage.token = "";
        localStorage.user_id = -1;
        conditionalRender();
        hide(document.getElementById("event_details"));
        updateCalendar();
    })
    .catch(err => console.error(err));

}

// login user
function loginUser() {
    const username = document.getElementById("login_username").value; // Get the username from the form
    const password = document.getElementById("login_password").value; // Get the password from the form

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password };

    fetch("backend/login.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success == true){
                console.log("logged in!");
                localStorage.isLoggedin = true;
                localStorage.username = data.username;
                localStorage.user_id = data.user_id;
                localStorage.token = data.token;
                conditionalRender();
                updateCalendar();
            }
            else{
                alert(`You were not logged in, ${data.message}`);
            }
        })
        .catch(err => console.error(err));
    
}

document.getElementById("login_submit").addEventListener("click", loginUser, false);
document.addEventListener("DOMContentLoaded", conditionalRender, false);



// REGISTER

function createNewUser(event) {
    const username = document.getElementById("register_username").value; // Get the username from the form
    const password = document.getElementById("register_password").value; // Get the password from the form
    const email = document.getElementById("email").value; // Get the email from the form

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password, 'email' : email };

    fetch("backend/createUser.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => alert(data.success ? "User created!" : `User could not be added ${data.message}`))
        .catch(err => console.error(err));

        document.getElementById("register_username").value = "";
        document.getElementById("register_password").value = ""; 
        document.getElementById("email").value = ""; 
}

document.getElementById("register_submit").addEventListener("click", createNewUser, false);