import Stripe from "stripe";
import {
  BillShareStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../../../prisma/generated/prisma/enums";
import { stripe } from "../../config/stripe";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import httpstatus from "http-status";

//STRIPE PAYMENT INTEGRATION
const createBillStripeCheckout = async (
  billShareId: string,
  tenantId: string,
) => {
  const billShare = await prisma.utilityBillShare.findUnique({
    where: {
      id: billShareId,
    },
    include: {
      bill: true,
      tenant: true,
    },
  });

  if (!billShare) {
    throw new AppError("Bill share not found", httpstatus.NOT_FOUND);
  }

  if (billShare.tenantId !== tenantId) {
    throw new AppError("Forbidden", httpstatus.FORBIDDEN);
  }

  if (billShare.status === BillShareStatus.PAID) {
    throw new AppError("Bill already paid", httpstatus.BAD_REQUEST);
  }

  const existingPayment = await prisma.billPayment.findFirst({
    where: {
      billShareId,
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
      },
    },
  });

  if (existingPayment) {
    throw new AppError("Payment already initiated", httpstatus.BAD_REQUEST);
  }

  const payment = await prisma.billPayment.create({
    data: {
      billShareId,
      provider: PaymentMethod.STRIPE,
      amount: billShare.amount,
      currency: "BDT",
      reference: `BILL-${crypto.randomUUID()}`,
      status: PaymentStatus.PENDING,
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Utility Bill",
          },
          unit_amount: billShare.amount,
        },
        quantity: 1,
      },
    ],

    metadata: {
      paymentId: payment.id,
    },

    success_url: `${process.env.CLIENT_URL}/dashboard/customer/payment/success`,

    cancel_url: `${process.env.CLIENT_URL}/dashboard/customer/payment/cancel`,
  });

  const updatedPayment = await prisma.billPayment.update({
    where: {
      id: payment.id,
    },
    data: {
      stripeSessionId: session.id,
      status: PaymentStatus.PROCESSING,
    },
  });

  return {
    payment: updatedPayment,
    checkoutUrl: session.url,
  };
};

const handleStripeWebhook = async (session: Stripe.Checkout.Session) => {
  const paymentId = session.metadata?.paymentId;

  if (!paymentId) {
    throw new AppError("Payment ID missing", httpstatus.BAD_REQUEST);
  }

  await completeBillPayment(paymentId, session.id);
};

const completeBillPayment = async (
  paymentId: string,
  transactionId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.billPayment.findUnique({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      throw new AppError("Payment not found", httpstatus.NOT_FOUND);
    }

    if (payment.status === PaymentStatus.PAID) {
      return payment;
    }

    const updatedPayment = await tx.billPayment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: PaymentStatus.PAID,
        gatewayReference: transactionId,
        paidAt: new Date(),
      },
    });

    await tx.utilityBillShare.update({
      where: {
        id: payment.billShareId,
      },
      data: {
        status: BillShareStatus.PAID,
        paidAt: new Date(),
      },
    });

    return updatedPayment;
  });
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

// const getAllBillPayments = async () => {
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

export const paymentService = {
  createBillStripeCheckout,
  handleStripeWebhook,
};
