// Gregary C. Zweigle, 2020

namespace MidiDisplay {
export class MidiDisplay {
    private timestamp : number[];
    private midiCode : number[];
    private midiNote : number[];
    private midiVelocity : number[];
    private writeRow : number;
    private numRows : number;
    constructor() {
        // Buffers for local storage of MIDI data received from the WebSocket.
        this.timestamp = [];
        this.midiCode = [];
        this.midiNote = [];
        this.midiVelocity = [];
        this.writeRow = 0;
        // Fix the size of the buffer for MIDI data.
        // This sets how much data is displayed.
        this.numRows = 40;
        for (let row = 0; row < this.numRows; row++) {
            this.timestamp.push(0);
            this.midiCode.push(0);
            this.midiNote.push(0);
            this.midiVelocity.push(0);
        }
    }

    updateDisplay(context : any, data : number[][], width : number,
        height : number) {
        this.updateBuffers(data);
        context.clearRect(0, 0, width, height);  // Erase the screen.
        this.drawDisplay(context, width, height);
    }

    private drawDisplay(context : any, width : number, height : number) {
        let rowStart : number = 10;
        let colStart : number = 10;
        // Set increment so that the data exactly fills the screen.
        // The columns are divided by 5 because displaying 5 values.
        let rowInc : number = Math.round((height-rowStart)/(this.numRows+1));
        let colInc : number = Math.round((width-colStart)/5);
        rowStart = this.drawHeader(context, rowStart, rowInc, colStart, colInc);
        // Start reading data to display with the last data written.
        let readRow : number = this.writeRow;
        // This is for displaying the timestamp difference.
        let timestampLast : number = this.timestamp[readRow];
        for (let row : number = 0; row < this.numRows; row++) {
            if (this.timestamp[readRow] == 0) {
                // If the timestamp is zero that indicates no more data.
                // This only happens until get enough data to fill the screen.
                break;
            }
            else {
                context.fillText(this.timestamp[readRow].toString(),
                colStart + 0*colInc, rowStart);
                context.fillText((this.timestamp[readRow]-timestampLast).toString(),
                colStart + 1*colInc, rowStart);
                context.fillText(this.midiCode[readRow].toString(),
                colStart + 2*colInc, rowStart);
                context.fillText(this.midiNote[readRow].toString(),
                colStart + 3*colInc, rowStart);
                context.fillText(this.midiVelocity[readRow].toString(),
                colStart + 4*colInc, rowStart);

                // For displaying the time stamp difference, save the present
                // timestamp so can use it next time.
                timestampLast = this.timestamp[readRow];

                // Go backwards through the FIFO, taking data backwards in time.
                readRow--;
                if (readRow < 0) {
                    readRow = this.numRows - 1;
                }

                // Move the y-axis where data is written to the web display.
                rowStart += rowInc;
            }
        }
    }

    private drawHeader(context : any, rowStart : number, rowInc : number,
        colStart : number, colInc : number) {
        context.fillStyle = "#FFFFFF";
        context.font = "14px Ariel";
        context.fillText("TimeStamp", colStart + 0*colInc, rowStart);
        context.fillText("TimeDiff", colStart + 1*colInc, rowStart);
        context.fillText("MIDICode", colStart + 2*colInc, rowStart);
        context.fillText("MIDIKey", colStart + 3*colInc, rowStart);
        context.fillText("MIDIVelocity", colStart + 4*colInc, rowStart);
        rowStart += rowInc;
        return rowStart;
    }

    // Pull data out of the WebSocket and put into the local buffers.
    // There is one buffer for each of the types of MIDI data received
    // through the WebSocket.
    private updateBuffers(data : number[][]) {
        for (let row = 0; row < data.length; row++) {
            if (data[row][0] == 0) {
                // If the timestamp is zero that indicates no more data.
                break;
            }
            else {
                // First increment writeRow, then use it to write data.
                // Therefore, writeRow holds the most recent write
                // location in the FIFO.
                if (this.writeRow == this.numRows - 1)
                    this.writeRow = 0;
                else
                    this.writeRow++;
                this.timestamp[this.writeRow] = data[row][0];
                this.midiCode[this.writeRow] = data[row][1];
                this.midiNote[this.writeRow] = data[row][2];
                this.midiVelocity[this.writeRow] = data[row][3];
            }
        }
    }
}
}