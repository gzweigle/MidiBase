"""
Gregary C. Zweigle, 2020
"""

import collections


class Fifo:

    def __init__(self, fifo_length):
        self.fifo = collections.deque(maxlen=fifo_length)
        self.fifo_length = fifo_length
        print("Initialized the FIFO.")

    def put(self, data):
        if len(self.fifo) < self.fifo_length:
            self.fifo.append(data)
        else:
            # This will happen if the client isn't running.
            print("Sorry, FIFO is full. Please try again someday.")

    def get(self):
        try:
            data = self.fifo.popleft()
            data_valid = True
        except IndexError:
            data = 0
            data_valid = False
        return data, data_valid
