"use client";

import { Scene } from "@/components/scene/Scene";
import { Caption, Chip, Fade, SvgNode, Wire, Zone } from "@/components/scene/svg";
import { anchor, curveV, line, type Box } from "@/components/scene/geometry";
import type { SceneStep } from "@/components/scene/types";

const W = 880;
const H = 500;

const user: Box = { x: 120, y: 74, w: 128, h: 46 };
const agent: Box = { x: 440, y: 74, w: 150, h: 56 };

const flight: Box = { x: 180, y: 250, w: 140, h: 52 };
const hotel: Box = { x: 440, y: 250, w: 140, h: 52 };
const calendar: Box = { x: 700, y: 250, w: 140, h: 52 };

const userToAgent = line(anchor(user, "right"), anchor(agent, "left"));
const agentToUser = line(anchor(agent, "left", 14), anchor(user, "right", 14));
const toFlight = curveV(anchor(agent, "bottom", -30), anchor(flight, "top"));
const toHotel = line(anchor(agent, "bottom"), anchor(hotel, "top"));
const toCal = curveV(anchor(agent, "bottom", 30), anchor(calendar, "top"));
const flightUp = curveV(anchor(flight, "top", 24), anchor(agent, "bottom", -52));
const hotelUp = line(anchor(hotel, "top", 24), anchor(agent, "bottom", 24));
/* The wire that never existed: a U-shaped route dipping below the server
   row so it reads as its own (dead) path rather than hugging the boxes. */
const crossWire =
  "M 180 278 C 180 344, 300 360, 440 360 C 580 360, 700 344, 700 278";

const steps: SceneStep[] = [
  {
    id: "intent",
    label: "Intent",
    title: "“Book me a Paris trip. Check with me before paying.”",
    body: "One sentence of intent. No server on this diagram will ever see the whole of it — only the agent holds the objective.",
    hold: 3200,
  },
  {
    id: "fan",
    label: "Fan out",
    title: "The agent searches flights and hotels in parallel.",
    body: "Two independent servers, two independent calls. Neither knows the other is part of a trip.",
    hold: 3200,
  },
  {
    id: "results",
    label: "Handles back",
    title: "Results come back as data plus handles.",
    body: (
      <>
        <code>flight_option LX39</code>, <code>hotel_option H-204</code>. The
        agent compares them against the intent — the reasoning step no server
        could do.
      </>
    ),
    hold: 3600,
  },
  {
    id: "pause",
    label: "Approval",
    title: "Booking pauses on input_required, and the human decides.",
    body: (
      <>
        The flight server needs a payment approval. The agent routes it to the
        person — <code>$1,240, confirm?</code> — because that is what the
        intent asked for.
      </>
    ),
    hold: 3800,
  },
  {
    id: "task",
    label: "Ticketing task",
    title: "Confirmation returns a task; ticketing takes a while.",
    body: "The agent holds the task handle. Nothing else in the trip is blocked while the airline's back office does its thing.",
    hold: 3400,
  },
  {
    id: "event",
    label: "Completion",
    title: "The completion event unlocks the rest of the plan.",
    body: "Booked. Now — and only now — is it worth reserving the hotel and writing the calendar, using dates that came out of the flight result.",
    hold: 3400,
  },
  {
    id: "finish",
    label: "Compose on",
    title: "Hotel reserved, calendar written, using the flight's facts.",
    body: (
      <>
        The calendar event contains <code>LX39</code>&apos;s arrival time. That
        fact travelled through the agent — not through any server-to-server
        integration.
      </>
    ),
    hold: 3800,
  },
  {
    id: "absent",
    label: "What never happened",
    title: "The wire that never existed.",
    body: "Flight → Calendar. Nobody built it, nobody maintains it, and next week the same three servers can be composed into an entirely different workflow.",
    hold: 4200,
  },
];

export function TripScene() {
  return (
    <Scene
      id="fig-trip"
      fig="Fig. 11"
      title="One trip, three servers, zero integrations"
      hint="The whole argument in a single composed workflow."
      steps={steps}
      viewBox={`0 0 ${W} ${H}`}
    >
      {({ index, runKey }) => {
        const fanning = index === 1;
        const returning = index === 2;
        const pausing = index === 3;
        const tasking = index === 4;
        const eventing = index === 5;
        const finishing = index >= 6;
        const absent = index === 7;

        return (
          <>
            <Zone
              x={70}
              y={176}
              w={W - 140}
              h={170}
              role="server"
              label="independent MCP servers"
              opacity={0.5}
            />

            {/* Intent */}
            <Wire
              key={`u-${runKey}`}
              d={userToAgent}
              role="human"
              state={index === 0 ? "on" : "off"}
              flow={index === 0 ? "once" : null}
              dot
              runKey={runKey}
              speed={780}
            />
            {/* Approval round trip */}
            <Wire
              key={`au-${runKey}`}
              d={agentToUser}
              role="human"
              state={pausing ? "on" : "off"}
              flow={pausing ? "once" : null}
              runKey={runKey}
              speed={720}
            />

            {/* Fan-out wires */}
            <Wire
              key={`f-${runKey}`}
              d={toFlight}
              role="agent"
              state={fanning || pausing || tasking ? "on" : "off"}
              flow={fanning ? "once" : null}
              dot
              runKey={runKey}
              speed={780}
            />
            <Wire
              key={`h-${runKey}`}
              d={toHotel}
              role="agent"
              state={fanning || index === 6 ? "on" : "off"}
              flow={fanning || index === 6 ? "once" : null}
              dot
              runKey={`${runKey}-h`}
              speed={840}
            />
            <Wire
              key={`c-${runKey}`}
              d={toCal}
              role="agent"
              state={finishing ? "on" : "off"}
              flow={index === 6 ? "once" : null}
              dot
              runKey={`${runKey}-c`}
              speed={900}
            />

            {/* Returns */}
            <Wire
              key={`fu-${runKey}`}
              d={flightUp}
              role={eventing ? "event" : "server"}
              state={returning || eventing ? "on" : "off"}
              flow={returning || eventing ? "once" : null}
              runKey={`${runKey}-fu`}
              speed={780}
            />
            <Wire
              key={`hu-${runKey}`}
              d={hotelUp}
              role="server"
              state={returning ? "on" : "off"}
              flow={returning ? "once" : null}
              runKey={`${runKey}-hu`}
              speed={840}
            />

            {/* The wire that never existed */}
            <Fade show={absent}>
              <Wire d={crossWire} role="danger" state="dead" arrow={false} />
              <Chip x={440} y={386} text="integration that was never built" role="danger" />
            </Fade>

            {/* Nodes */}
            <SvgNode
              box={user}
              role="human"
              state={index === 0 || pausing ? "active" : "dim"}
              title="User"
              sub={pausing ? "approves $1,240" : "intent"}
            />
            <SvgNode
              box={agent}
              role="agent"
              state="active"
              title="Agent"
              sub={
                index === 0
                  ? "receives intent"
                  : returning
                    ? "compares options"
                    : pausing
                      ? "routes the question"
                      : tasking
                        ? "holds task handle"
                        : eventing
                          ? "reacts to event"
                          : finishing
                            ? "carries flight facts"
                            : "composes"
              }
            />
            <SvgNode
              box={flight}
              role="server"
              state={
                fanning || returning || pausing || tasking || eventing
                  ? "active"
                  : finishing
                    ? "done"
                    : "idle"
              }
              title="Flight MCP"
              sub="search · book"
              badge={tasking || eventing ? "task tkt-88" : undefined}
            />
            <SvgNode
              box={hotel}
              role="server"
              state={
                fanning || returning ? "active" : index === 6 ? "active" : finishing ? "done" : "idle"
              }
              title="Hotel MCP"
              sub="search · reserve"
            />
            <SvgNode
              box={calendar}
              role="server"
              state={finishing ? (absent ? "done" : "active") : "idle"}
              title="Calendar MCP"
              sub="create_event"
            />

            {/* State the agent holds */}
            <Fade show={index >= 2}>
              <Zone x={640} y={30} w={216} h={index >= 4 ? 128 : 96} role="agent" label="handles the agent carries" />
              <Chip x={748} y={74} text="flight LX39" role="agent" fontSize={9.5} />
              <Chip x={748} y={104} text="hotel H-204" role="server" fontSize={9.5} />
              {index >= 4 ? (
                <Chip x={748} y={134} text="task tkt-88" role="task" fontSize={9.5} />
              ) : null}
            </Fade>

            {/* Step annotations */}
            {index === 0 ? (
              <Chip x={280} y={46} text='"Paris, ask before paying"' role="human" tone="solid" />
            ) : null}
            {fanning ? (
              <>
                <Chip x={230} y={166} text="search_flights()" role="agent" fontSize={9.5} />
                <Chip x={470} y={166} text="search_hotels()" role="agent" fontSize={9.5} />
              </>
            ) : null}
            {pausing ? (
              <Chip x={280} y={120} text="input_required: approve $1,240?" role="human" tone="solid" />
            ) : null}
            {tasking ? (
              <Chip x={300} y={166} text='resultType: "task"' role="task" tone="solid" />
            ) : null}
            {eventing ? (
              <Chip x={300} y={150} text="event: ticketing completed" role="event" tone="solid" />
            ) : null}
            {index === 6 ? (
              <Chip x={610} y={166} text="create_event(arrival 14:05)" role="agent" fontSize={9.5} />
            ) : null}

            <Caption x={W / 2} y={H - 18}>
              {absent
                ? "the workflow existed only inside the agent — the servers stayed strangers"
                : index >= 6
                  ? "flight facts reach the calendar through the agent, not through a wire"
                  : "every arrow above is the same protocol: discover, call, pause, resume"}
            </Caption>
          </>
        );
      }}
    </Scene>
  );
}
