import { prisma } from "../prisma";

const seed = async () => {
  const response = await prisma.doctor.create({
    data: {
      name: "Fred",
      licenses: {
        create: {
          jurisdiction: "Florida",
        },
      },
    },
  });

  console.log(response);
};

seed();
