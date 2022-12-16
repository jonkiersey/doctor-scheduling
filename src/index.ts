"use strict";

import express from "express";
import timeslot from "./timeslot";

const PORT = 8080;
const HOST = "0.0.0.0";

const app = express();
app.use(express.json());
app.post("/timeslot", async (req, res) => {
  const { status, response } = await timeslot.post(req, res);
  res.status(status);
  res.send(response);
});
app.get("/timeslot", async (req, res) => {
  const result = await timeslot.get(req);
  res.send(result);
});
app.post("/timeslot/:timeslotId/schedule", async (req, res) => {
  const { status, response } = await timeslot.scheduleAppointment(req);
  res.status(status);
  res.send(response);
});
app.post("/timeslot/:timeslotId/cancel", async (req, res) => {
  const result = await timeslot.cancelAppointment(req);
  res.send(result);
});

app.use((req, res) => {
  res.status(404);
  res.send("Not Found");
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
