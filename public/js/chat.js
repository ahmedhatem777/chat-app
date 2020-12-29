const socket = io();

//Elements
const $form = document.querySelector('#message-form');
const $messageFormInput = $form.querySelector('input');
const $messageFormButton = $form.querySelector('button');
const $locationButton = document.querySelector('#send-lokation');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
//Options
//Extracting the username and room name from the query string after a user has joined
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

//Autoscrolling the messages
const autoscroll = () =>{
    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //Scroll distance, 0 from the top and increases when going down
    const scrollOffset = $messages.scrollTop + visibleHeight;

    //Autoscroll
    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

//Listening to an event "message", which gives us messages coming from the server
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

//Listening to location message coming from the server
socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

//Listening to when room data is changed
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html;
})

//Listening to when a user joins and redirecting if error
socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/'
    }
})

//Adding an event listener to the send form and sending the message to the server
$form.addEventListener('submit', (e) =>{
    
    //Preventing the default form action which is reloading the page
    e.preventDefault();

    //Disabling the form
    $messageFormButton.setAttribute('disabled', 'disabled')

    //extracting the content of the input field called 'message'
    const message = e.target.elements.message.value;
      
    socket.emit('sendMessage', message, (serverResponse) => {
        console.log(serverResponse);

        //Enabling the form once again
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();


    });
})

//Sending location to the server using the built-in geolocation API
$locationButton.addEventListener('click', () => {

    //Disabling the button
    $locationButton.setAttribute('disabled', 'disabled');

    //Checking if browser is not supported
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your old ass browser')
    }

    navigator.geolocation.getCurrentPosition( (position) => {
        const location = {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }

        socket.emit('sendLocation', location, (serverResponse) => {
            console.log(serverResponse);

            //Enabling the button once again
            $locationButton.removeAttribute('disabled');
        })
    })
})


