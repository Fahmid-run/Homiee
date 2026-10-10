import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import httpStatus from "http-status";
import { tenantServices } from "./tenant.service";
import Stripe from "stripe";
import { stripe } from "../../config/stripe";

const getMyViewRequest = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.authorId as string;

  const result = await tenantServices.getMyViewRequest(tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "View Requests Retrieved Sucessfully",
    data: result,
  });
});

const createViewReq = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const tenantId = req.user?.userId as string;
  const roomId = req.params?.roomId as string;

  const result = await tenantServices.createViewReq(roomId, tenantId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "View Request  successfully",
    data: result,
  });
});

const createApplication = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const tenantId = req.user?.userId as string;
  const roomId = req.params?.roomId as string;

  const result = await tenantServices.createApplication(
    roomId,
    tenantId,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Application Submitted  successfully",
    data: result,
  });
});

const createRoomMatePreference = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const tenantId = req.user?.authorId as string;

    const result = await tenantServices.createRoomMatePreference(
      tenantId,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Roommate Preference Created  successfully",
      data: result,
    });
  },
);

//RenTal Payment

const createRentalCheckoutSession = catchAsync(async (req, res) => {
  const { renatalId, paymentProvider } = req.body;
  const tenantId = req.user?.userId as string;

  const result = await tenantServices.createRentCheckout(
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
    signature!,
    process.env.STRIPE_RENTAL_WEBHOOK_SECRET! as string,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await tenantServices.handleRentalStripeWebhook(session);
  }

  res.status(httpStatus.OK).json({
    received: true,
  });
});

const handleRentalBkashCallback = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await tenantServices.handleRentalBkashCallback(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "true",
    data: result,
  });
});

const createBillCheckoutSession = catchAsync(async (req, res) => {
  const { billShareId, paymentProvider } = req.body;
  const tenantId = req.user?.userId as string;

  const result = await tenantServices.createBillStripeCheckout(
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
    signature!,
    process.env.STRIPE_BILL_WEBHOOK_SECRET! as string,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await tenantServices.handleStripeWebhook(session);
  }

  res.status(httpStatus.OK).json({
    received: true,
  });
});

const handleBillBkashCallback = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await tenantServices.handleBkashCallback(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "true",
    data: result,
  });
});

const getRecentPayments = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.authorId as string;

  const result = await tenantServices.recentPayments(tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments Retrieved Sucessfully",
    data: result,
  });
});

export const tenantController = {
  getMyViewRequest,
  createViewReq,
  createApplication,
  createRoomMatePreference,
  createRentalCheckoutSession,
  rentalBillWebhook,
  billwebhook,
  handleBillBkashCallback,
  handleRentalBkashCallback,
  createBillCheckoutSession,
  getRecentPayments,
};
