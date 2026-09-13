import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import httpStatus from "http-status";
import { AdminService } from "./admin.service";

const banUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const result = await AdminService.banUserFromDb(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Blocked successfully",
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stats Retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  banUser,
  getStats,
};
