# Troubleshooting

Work through problems in layers: power, cables, settings, then software. Most meet-day problems are a loose cable or a setting that changed.

## Console will not start

- Check the power supply light. No light means no power reaches the supply: try another outlet.
- If the supply light is on but the console stays dark, reseat the power connector at the console.
- A console that starts and then shuts down within a minute usually has a failing power supply.

## Console not found by the setup laptop

- Confirm the Ethernet cable is seated at both ends. The port light on the console should blink.
- Check the laptop's network adapter. "Not connected" means the link is down; chase the cable or the adapter.
- A USB Ethernet adapter can lose its link without warning. Moving it to another USB port often restores it.
- Auto discovery uses a broadcast on the local link. If discovery fails, enter the console's address by hand from the console's network screen.
- A firewall prompt on first start must be accepted, or discovery is blocked.

## Lane not recording touches

- Check that the lane is armed on the run screen.
- Check the pad cable at the deck harness. A connector that is half seated works intermittently.
- Swap the pad with a neighboring lane's pad. If the fault moves with the pad, the pad is faulty; if it stays, the harness channel is faulty.
- Wet connectors cause false or missed touches. Dry them and fit the covers.

## Backup buttons not registering

- Each button plugs into the harness at the lane's breakout. Check the plug.
- Test each button from the console's diagnostics screen, which shows a mark per press.
- A button that registers in diagnostics but not in races is usually assigned to the wrong lane in Settings.

## Scoreboard blank or frozen

- Check that BoardLink is running and not frozen. Restarting BoardLink clears most freezes.
- Check that the scoreboard laptop did not sleep. Set Sleep and Screen to Never, and disable USB selective suspend, so the serial adapter stays awake.
- Check the timing cable at both ends. A loose 1/4 inch plug shows as intermittent blanking when someone bumps the cable.
- Check the COM port in Device Manager against BoardLink's Timer Inputs setting. A reboot or a different USB port can change the number.
- Check that the console's scoreboard output is turned on from the run screen.

## Times not reaching the results laptop

- Check that the race was saved on the console. Unsaved races cannot be pulled.
- Check that the right event and heat are selected in MeetDesk.
- Check the COM port setting in MeetDesk against Device Manager on the results laptop.
- Check the USB cable at the console's results port.

## Names missing on the board

- Names come from the USB key load, not from the timing cable. Reload the start list file into BoardLink.
- Check that the event numbers in the file match the events in the console.

## Start system not starting the clock

- Check the start cable where it joins the deck harness.
- Fire the horn with the console on the run screen and watch the running time. If the time does not start, test the start input from diagnostics.
- A start system with a weak battery may sound but not send a start signal.

## After a software update

- Reboot every laptop before checking COM ports. An update can leave a port missing from BoardLink's list until a full reboot.
- Re-check the pool configuration. Some updates reset the lane count to the default.
- Run a one-lap test race and confirm times appear on the board and in MeetDesk.

## Known quirks on this rig

- The scoreboard laptop's USB serial adapter only works in the left USB port; the right port gives frequent dropouts.
- The deck harness connector for lane 4 is stiff and needs a firm push to seat.
- After a power cut, the console boots with the course set to 25 yards and must be set back to 25 m by hand.
- The spare horn battery is kept in the grey case under the timing desk.
- The results laptop's virtual COM port has been COM3, COM4 and COM6 in different sessions.
