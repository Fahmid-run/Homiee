import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import httpStatus from "http-status";
import { propertyServices } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const ownerId = req.user?.authorId as string;

  const result = await propertyServices.createProperty(ownerId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Property Created  successfully",
    data: {
      ...result,
    },
  });
});

const getAllProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyServices.getAllProperties();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property Retrieved  successfully",
    data: result,
  });
});

const getPropertiesById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await propertyServices.getPropertiesById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property Retrieved  successfully",
    data: result,
  });
});

const getPropertiesByOwnerId = catchAsync(
  async (req: Request, res: Response) => {
    const ownerId = req.user?.authorId as string;

    console.log(ownerId);

    const result = await propertyServices.getPropertiesById(ownerId);
    console.log(result);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Property Retrieved  successfully",
      data: result,
    });
  },
);

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await propertyServices.deleteProperty(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property Deleted  successfully",
    data: {},
  });
});
export const properyController = {
  createProperty,
  getAllProperty,
  getPropertiesById,
  getPropertiesByOwnerId,
  deleteProperty,
};
