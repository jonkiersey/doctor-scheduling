import { Request, Response } from "express";
import { prisma } from "./prisma";
import { DATA_CONFLICT, OK } from "./statuses";

interface Availability {
  doctorId: string;
  startTime: Date;
  endTime: Date;
}

interface RouterResponse {
  status: number;
  response: any;
}

const post = async (req: Request, res: Response): Promise<RouterResponse> => {
  const { doctorId, startTime, endTime }: Availability = req.body;

  const intersections = await prisma.timeSlot.count({
    where: {
      doctorId,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  if (intersections > 0) {
    return {
      status: DATA_CONFLICT,
      response:
        "This timeslot interferes with an existing timeslot for this doctor.",
    };
  }
  const response = await prisma.timeSlot.create({
    data: {
      doctorId,
      startTime,
      endTime,
    },
  });
  return { status: OK, response };
};

const get = async (req: Request) => {
  const { doctorId: id, jurisdiction } = req.query;

  // casting query params to strings because they might be other things, but with how I'm using them today, they will be strings
  const response = await prisma.timeSlot.findMany({
    where: {
      doctorId: id as string,
      doctor: {
        licenses: {
          some: {
            jurisdiction: {
              equals: jurisdiction as string,
            },
          },
        },
      },
      patientId: null,
    },
  });
  return response;
};

const scheduleAppointment = async (req: Request): Promise<RouterResponse> => {
  const { timeslotId } = req.params;
  const { patientId } = req.body;
  const slot = await prisma.timeSlot.findUnique({
    where: { id: timeslotId },
  });
  if (slot?.patientId !== null) {
    return {
      status: DATA_CONFLICT,
      response: "This time slot is no longer available.",
    };
  }
  // RACE CONDITIONS ABOUND
  const response = await prisma.timeSlot.update({
    where: { id: timeslotId },
    data: {
      patient: {
        connect: {
          id: patientId,
        },
      },
    },
  });
  return { status: OK, response };
};

const cancelAppointment = async (req: Request) => {
  const { timeslotId } = req.params;
  const response = await prisma.timeSlot.update({
    where: { id: timeslotId },
    data: {
      patient: {
        disconnect: true,
      },
    },
  });
  return response;
};
export default { get, post, cancelAppointment, scheduleAppointment };
