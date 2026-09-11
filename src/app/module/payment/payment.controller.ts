import Stripe from "stripe";
import { stripe } from "../../config/stripe";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import { PaymentMethod } from "../../../../prisma/generated/prisma/enums";

import httpStatus from "http-status";

const createBillCheckoutSession = catchAsync(async (req, res) => {
  const { billShareId, paymentProvider } = req.body;
  const tenantId = req.user?.userId as string;

  const result = await paymentService.createBillStripeCheckout(
    paymentProvider,
    billShareId,
    tenantId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checkout created",
    data: result,
  });
});

const billwebhook = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await paymentService.handleStripeWebhook(session);
  }

  res.status(httpStatus.OK).json({
    received: true,
  });
});

const handleBillBkashCallback = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await paymentService.handleBkashCallback(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "true",
    data: result,
  });
});

//RenTal Payment

const createRentalCheckoutSession = catchAsync(async (req, res) => {
  const { renatalId, paymentProvider } = req.body;
  const tenantId = req.user?.userId as string;

  console.log(renatalId);

  const result = await paymentService.createRentCheckout(
    paymentProvider,
    renatalId,
    tenantId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checkout created",
    data: result,
  });
});

const rentalBillWebhook = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await paymentService.handleRentalStripeWebhook(session);
  }

  res.status(httpStatus.OK).json({
    received: true,
  });
});

const handleRentalBkashCallback = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await paymentService.handleRentalBkashCallback(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "true",
    data: result,
  });
});

// const getAllPAyments = catchAsync(async (req, res) => {
//   const result = await paymentService.getAllPayments();

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Payments Retrieved",
//     data: result,
//   });
// });

// const getSinglePayment = catchAsync(async (req, res) => {
//   const id = req.params.rentalOrderId as string;
//   const result = await paymentService.getSinglePayment(id);

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Payment Retrieved",
//     data: result,
//   });
// });

// const getMyPayments = catchAsync(async (req, res) => {
//   const id = req.user?.authorId as string;
//   const result = await paymentService.getMyPayments(id);

//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "Payments Retrieved",
//     data: result,
//   });
// });

export const paymentController = {
  createBillCheckoutSession,
  billwebhook,
  rentalBillWebhook,
  handleBillBkashCallback,
  handleRentalBkashCallback,

  createRentalCheckoutSession,
};
