# MIDI Base

A very simple server and client for acquiring and displaying MIDI data.

### Overall Architecture

The server and client communicate with a WebSocket. This communication link also coordinates when each runs.

The WebSocket data size is hardcoded at 30 rows by 4 columns. Each row contains MIDI data for a single MIDI event. The row format is: timestamp, MIDI code, MIDI note, and MIDI velocity. The server doesn't know details about the row format (it just gets MIDI data and sends it) and the client directly assumes the row format.

To run everything, type the following at the command line: python midi_base.py

Then, open a web browser with the following URL: localhost:5000

### Server

The server is written in Python and uses Flask and RTMidi. The server consists of two independent processes that are connected with a FIFO. The FIFO size is hardcoded equal to the WebSocket data size.

1. The main server code wakes up when it receives client_ready from the client through the WebSocket. The main server then pulls all data from the FIFO connecting it to the MIDI driver. The main server does not block the MIDI driver while emptying the FIFO. It puts this data into the WebSocket (data format as described above) and sends to the client as data_from_server.

2. The MIDI driver runs as a callback. Each time the physical device sends a MIDI messages, the driver wakes up and puts the MIDI data into the FIFO.

### Client

The client is written in TypeScript and is transcompiled to JavaScript. To compile, type the following at the command line: tsc -w --outFile MidiBase.js MidiBase.ts. The client uses HTML Canvas to draw graphics on the web page.

Upon starting, a client_ready message is sent to the server through the WebSocket. When the client receives a data_from_server message from the server, it pulls all data from the WebSocket (30 rows of MIDI data, each with 4 values). The client then checks the first value of each row (the timestamp) to see if it is zero. The client uses data from the WebSocket until it encounters the first zero value in a row. This is how the client knows how many of the 30 rows it receives from the server actually contain data.

The client puts the data from the WebSocket into its own internal buffer. This buffer is 40 rows by 4 columns. The buffer contains is what is displayed on the web page. By keeping a separate buffer, this allows the web page data to show historical MIDI data. The number of rows in the separate client buffer can be more than the number of WebSocket communicated rows (30), and in this case is more rows (40 vs 30). More rows means more historical data displayed on the web page. However, the number of columns (4) must match.

The client assumes the content of each row (timestamp, MIDI code, MIDI note, MIDI velocity).