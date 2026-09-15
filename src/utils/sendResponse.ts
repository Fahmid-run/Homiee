import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TResponseData<T> = {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T;
  meta?: TMeta;
};

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  const validStatusCode =
    typeof data.statusCode === "number" && Number.isInteger(data.statusCode)
      ? data.statusCode
      : 200;
  res.status(validStatusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
