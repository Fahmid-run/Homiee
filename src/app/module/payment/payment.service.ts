import Stripe from "stripe";
import {
  PaymentMethod,
  PaymentStatus,
} from "../../../../prisma/generated/prisma/enums";
import { stripe } from "../../config/stripe";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import { checkExists } from "../../utils/checkExist";
import httpstatus from "http-status";

//STRIPE PAYMENT INTEGRATION
const createCheckoutSession = async (tenancyID: string) => {
  const tenancyExists = await checkExists(
    prisma.tenancy,
    tenancyID,
    "Tenancy Does Not Exists",
  );

  const existingPayment = await prisma.rentalPayment.findUnique({
    where: {
      tenancyID,
    },
  });

  if (existingPayment) {
    throw new AppError("Payment already initiated", httpstatus.BAD_REQUEST);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "House Rent",
          },
          unit_amount: Math.round(tenancyExists.monthlyRent * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      tenancyID,
    },

    success_url: `${process.env.CLIENT_URL}/dashboard/customer/checkout/success/${tenancyID}`,

    cancel_url: `${process.env.CLIENT_URL}/dashboard/customer/checkout/cancel`,
  });

  const payment = await prisma.rentalPayment.create({
    data: {
      tenancyID,
      amount: tenancyExists.totalAmount,
      currency: "usd",
      paymentMethod: PaymentMethod.STRIPE,
      status: PaymentStatus.PENDING,
    },
  });

  return {
    payment,
    checkoutUrl: session.url,
  };
};

const handleCheckoutSuccess = async (session: Stripe.Checkout.Session) => {
  const tenancyID = session.metadata?.tenancyID;

  if (!tenancyID) {
    throw new AppError("tenancy ID missing", httpstatus.NOT_FOUND);
  }

  const payment = await prisma.rentalPayment.findUnique({
    where: {
      tenancyID,
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.rentalPayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.PAID,

        transactionId: session.id,

        paidAt: new Date(),
      },
    });

    // await tx.rentalOrder.update({
    //   where: {
    //     id: rentalOrderId,
    //   },

    //   data: {
    //     rentalStatus: Rental_Status.PAID,
    //   },
    // });

    return updatedPayment;
  });

  return result;
};

//BKASH PAYMENT INTEGRATION

// const getSinglePayment = async (rentalOrderId: string) => {
//   return prisma.payment.findUniqueOrThrow({
//     where: {
//       rentalOrderId,
//     },

//     include: {
//       rentalOrder: true,
//     },
//   });
// };

// const getAllPayments = async () => {
//   return prisma.payment.findMany();
// };

// const getMyPayments = async (customerId: string) => {
//   return prisma.payment.findMany({
//     where: {
//       rentalOrder: {
//         customerId,
//       },
//     },

//     include: {
//       rentalOrder: true,
//     },
//   });
// };

export const paymentService = { createCheckoutSession, handleCheckoutSuccess };
