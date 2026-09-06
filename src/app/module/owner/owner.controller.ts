import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import httpStatus from "http-status";
import { ownerServices } from "./owner.service";

const updateApplicationStatus = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const ownerId = req.user?.authorId as string;
    const userid = req.user?.userId as string;

    const applicationId = req.params?.applicationId as string;

    const result = await ownerServices.updateApplicationStatus(
      userid,
      ownerId,
      applicationId,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Application status updated  successfully",
      data: result,
    });
  },
);

export const ownerController = {
  updateApplicationStatus,
};
