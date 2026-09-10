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
import { configs } from "../../config";
import { getGrandToken } from "../../lib/bkash";

//STRIPE PAYMENT INTEGRATION
const createBillStripeCheckout = async (
  paymentProvider: PaymentMethod,
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
      provider: paymentProvider,
      amount: billShare.amount,
      currency: "BDT",
      reference: `BILL-${crypto.randomUUID()}`,
      status: PaymentStatus.PENDING,
    },
  });

  if (paymentProvider == PaymentMethod.STRIPE) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: "Utility Bill",
            },
            unit_amount: Math.round(billShare.amount * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        paymentId: payment.id,
      },

      success_url: `${configs.frontend_url}/dashboard/customer/payment/success`,

      cancel_url: `${configs.frontend_url}/dashboard/customer/payment/cancel`,
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
  }

  if (paymentProvider === PaymentMethod.BKASH) {
    const bkashIdToken = await getGrandToken();
    if (!bkashIdToken) {
      throw new AppError("Id token not found", httpstatus.NOT_FOUND);
    }

    const createPayment = await fetch(
      `${configs.bkash_baseUrl}/checkout/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authorization: bkashIdToken,
          "x-app-key": configs.bkash_app_key!,
        },
        body: JSON.stringify({
          agreementID: `BKASH-${crypto.randomUUID()}`,
          mode: "0011",
          payerReference: crypto.randomUUID(),
          callbackURL: `${configs.bkash_callback_Url}/callback`,
          merchantAssociationInfo: "MI05MID54RF09123456One",
          amount: billShare.amount,
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: billShareId,
        }),
      },
    );

    const res = await createPayment.json();

    const updatedPayment = await prisma.billPayment.update({
      where: {
        id: payment.id,
      },
      data: {
        bkashPaymentId: res.paymentID,
        status: PaymentStatus.PROCESSING,
      },
    });

    return {
      payment: updatedPayment,
      ...res,
    };
  }
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

const handleBkashCallback = async (query: any) => {
  const { paymentID, status, signature } = query;
  return prisma.$transaction(async (tx) => {
    const payment = await tx.billPayment.findUnique({
      where: {
        bkashPaymentId: paymentID,
      },
    });

    if (!payment) {
      throw new AppError("Payment not found", httpstatus.NOT_FOUND);
    }
    if (!status) {
      throw new AppError("Payment Failed", httpstatus.SERVICE_UNAVAILABLE);
    }

    if (payment.status === PaymentStatus.PAID) {
      return payment;
    }

    const updatedPayment = await tx.billPayment.update({
      where: {
        bkashPaymentId: paymentID,
      },
      data: {
        status: PaymentStatus.PAID,
        gatewayReference: signature,
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

export const paymentService = {
  createBillStripeCheckout,
  handleStripeWebhook,

  handleBkashCallback,
};
