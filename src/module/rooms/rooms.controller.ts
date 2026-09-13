import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import httpStatus from "http-status";
import { roomServices } from "./rooms.service";

const createRoom = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const propertyId = req.params?.propertyId as string;

  const result = await roomServices.createRoom(propertyId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Room Created  successfully",
    data: result,
  });
});

const getAllRooms = catchAsync(async (req: Request, res: Response) => {
  const result = await roomServices.getAllRooms();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rooms Retrieved  successfully",
    data: result,
  });
});

const getRoomsById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params?.roomId as string;

  const result = await roomServices.getRoomsById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rooms Retrieved  successfully",
    data: result,
  });
});

const getRoomsByOwnerId = catchAsync(async (req: Request, res: Response) => {
  const ownerId = req.user?.authorId as string;

  console.log(ownerId);

  const result = await roomServices.getRoomsByOwnerId(ownerId);
  console.log(result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rooms Retrieved  successfully",
    data: result,
  });
});

const deleteRoom = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await roomServices.deleteRoom(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property Deleted  successfully",
    data: {},
  });
});
export const roomController = {
  createRoom,
  getAllRooms,
  getRoomsByOwnerId,
  getRoomsById,
  deleteRoom,
};
