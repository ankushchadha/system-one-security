# Rig parameters: Harbor Pool timing rig

This file is the single source of truth for this rig's own values. The other files describe general procedures; where they mention a value for this rig, this table governs.

| Parameter | This rig | Status |
|---|---|---|
| Lanes / ends used | 8 lanes, start end only (turn-end pads not wired) | confirmed |
| Course | 25 m short course meters | confirmed |
| Console model | Tempo T5-L (Legacy variant) | confirmed |
| Console software | Tempo Swim v3.2.1 | confirmed |
| Scoreboard app | BoardLink v2.4.0 on the scoreboard laptop | confirmed |
| Lane harness | H8-8 (8-lane primary harness) | confirmed |
| Scoreboard output in use | 1/4 inch legacy jack; RS-485 outputs empty | confirmed |
| BoardLink timer input | COM5, "Tempo" protocol | confirmed |
| Results software | MeetDesk 6.1 on the results laptop | confirmed |
| Console to results laptop | USB Type-B results port, virtual COM port (number drifts between sessions) | confirmed |
| Console to setup laptop | Ethernet, link-local 169.254.x.x addressing | confirmed |
| Names transport | USB key, loaded into the console and BoardLink | confirmed |
| Start system | Horn and strobe; its cable joins the deck harness, not a panel jack | confirmed |

## The three machines on deck

1. Setup laptop: runs Tempo Swim v3.2.1 and talks to the console over Ethernet. Meets and events are built here.
2. Scoreboard laptop: runs BoardLink v2.4.0 and reads live times from the console on COM5.
3. Results laptop: runs MeetDesk 6.1 and pulls times from the console's results port.

The pool is 8 lanes and races are timed at the start end only. Courses are 25 m.
