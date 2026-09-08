import Stripe from "stripe";
import {
  BillShareStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../../../prisma/generated/prisma/enums";
import { stripe } from "../../config/stripe";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import { checkExists } from "../../utils/checkExist";
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

  // Make sure this bill belongs to the logged-in tenant
  if (billShare.tenantId !== tenantId) {
    throw new AppError("Forbidden", httpstatus.FORBIDDEN);
  }

  // Already paid?
  if (billShare.status === BillShareStatus.PAID) {
    throw new AppError("Bill already paid", httpstatus.BAD_REQUEST);
  }

  // Check if there is already an active payment
  const existingPayment = await prisma.billPayment.findFirst({
    where: {
      billShareId,
      status: {
        in: [PaymentStatus.PENDING],
      },
    },
  });

  if (existingPayment) {
    throw new AppError("Payment already initiated", httpstatus.BAD_REQUEST);
  }

  // Create YOUR payment first
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

  // Create Stripe checkout
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

  // Save Stripe session
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

const handleStripeWebhook = async (event: Stripe.Event) => {
  if (event.type !== "checkout.session.completed") {
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;

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

    // Webhook can arrive multiple times
    if (payment.status === PaymentStatus.PAID) {
      return payment;
    }

    // Mark payment paid
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

    // Mark individual bill share paid
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

export const paymentService = {
  createBillStripeCheckout,
  handleStripeWebhook,
};
