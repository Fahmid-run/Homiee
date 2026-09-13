import AppError from "./appError"

export const checkExists = async (db: any, paylaod: any, errorMsg:string) => {
  const result = await db.findUnique({
    where: {
      id:paylaod
    },
  });
  if (!result) {
     throw new AppError(errorMsg,404);
  }
  return result


};