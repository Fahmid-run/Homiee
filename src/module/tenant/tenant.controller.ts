import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import httpStatus from "http-status";
import { tenantServices } from "./tenant.service";

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

export const tenantController = {
  createViewReq,
  createApplication,
  createRoomMatePreference,
};
