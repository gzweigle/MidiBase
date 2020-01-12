// Gregary C. Zweigle, 2020
/// <reference path="MidiDisplay.ts" />

var socket = io.connect("http://localhost:5000");
var canvas = <HTMLCanvasElement> document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var midiDisplay = new MidiDisplay.MidiDisplay();

// If the web browser is resized, get the new size.
window.addEventListener('resize',
    function(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
);
window.dispatchEvent(new Event('resize'));

// Tell the server to start sending data.
socket.emit('client_ready', {
    'width': canvas.width,
    'height': canvas.height,
});

socket.on('data_from_server', function(data_from_server) {
    let data : number[][] = data_from_server['data'];
    midiDisplay.updateDisplay(context, data, canvas.width, canvas.height);
    // After finished displaying the data, tell the server to send more data.
    socket.emit('client_ready', {
        'width': canvas.width,
        'height': canvas.height,
    });
    
});