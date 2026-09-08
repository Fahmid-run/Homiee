import Stripe from "stripe";
import { stripe } from "../../config/stripe";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

import httpStatus from "http-status";

const createCheckoutSession = catchAsync(async (req, res) => {
  const { billShareId } = req.body;

  const tenantId = req.user?.authorId as string;

  const result = await paymentService.createBillStripeCheckout(
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

const webhook = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await paymentService.handleCheckoutSuccess(session);
  }

  res.status(httpStatus.OK).json({
    received: true,
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

export const paymentController = {
  createCheckoutSession,
  webhook,
};
