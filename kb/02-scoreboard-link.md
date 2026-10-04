# Scoreboard link

## How times reach the board

The console sends live running times and finish times to the scoreboard laptop over a serial cable. BoardLink reads that stream and drives the LED board. On this rig the cable runs from the console's 1/4 inch legacy jack to a USB serial adapter on the scoreboard laptop, which Windows shows as COM5.

In BoardLink, open Settings, then Timer Inputs, and set Timer 1 to the COM port shown in Device Manager, with the "Tempo" protocol. If the COM number in Device Manager changes, update it here too.

## Swimmer names

Names are not sent over the timing cable. Before the meet, export the start lists from MeetDesk to a USB key, then load the file into the console and into BoardLink. Live names over a cable require the RS-485 outputs, which are not wired on this rig.

## Port numbers on different laptops

The scoreboard laptop and the results laptop are separate machines. Each has its own COM port numbering, and the numbers do not need to match.

## Board brightness

BoardLink sets brightness per scene. Outdoor meets usually need the Day scene. The board itself has no brightness control.
