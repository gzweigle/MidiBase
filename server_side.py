"""
Gregary C. Zweigle, 2020
"""

import midi_driver
import numpy as np
import os


class ServerSide:

    def __init__(self):
        # Set to the maximum number of midi values expect to get at once.
        self.fifo_length = 30
        self.width = 0
        self.height = 0
        # During development, and restarting things often, I was getting
        # multiple drivers sometimes and then things don't work. So, this
        # code makes sure to only instantiate a driver once.
        if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
            self.mdw = midi_driver.MidiDriver(self.fifo_length)
        print("Initialized the ServerSide.")

    def server(self, socket_io, width, height):
        self.display_width_height(width, height)
        midi_data = self.get_next_set_to_send()
        self.build_and_send_data(socket_io, midi_data)

    # This is just something for testing.
    def display_width_height(self, width, height):
        if width != self.width or height != self.height:
            print("New width={0} and height={1}".format(width, height))
        self.width = width
        self.height = height

    # Pull all data out of the FIFO connecting server to the MIDI driver.
    def get_next_set_to_send(self):
        midi_data = np.zeros((self.fifo_length, self.mdw.fifo_num_data()))
        for ind in range(self.fifo_length):
            data, valid = self.mdw.get_data_from_fifo()
            if not valid:
                break
            else:
                midi_data[ind, :] = data
        return midi_data

    def build_and_send_data(self, socket_io, send_data):
        transmit_dictionary = {'data': send_data.tolist()}
        socket_io.emit('data_from_server', transmit_dictionary)
