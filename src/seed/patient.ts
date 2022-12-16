import { prisma } from "../prisma";

const seed = async () => {
  const response = await prisma.patient.create({
    data: {
      name: "Doug",
    },
  });

  console.log(response);
};

seed();
