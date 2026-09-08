import bcrypt from "bcrypt";
import { JwtPayload, SignOptions } from "jsonwebtoken";

import { configs } from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import {
  ILoginUserPayload,
  IRegisterPatientPayload,
  IRequestUser,
} from "./auth.interface";

import AppError from "../../utils/appError";

import httpstatus from "http-status";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";

const registerUser = async (payload: IRegisterPatientPayload) => {
  const { name, password, role = "TENANT" } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(
      "User with this email already exists",
      httpstatus.NOT_FOUND,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      status: UserStatus.ACTIVE,
      isEmailVerified: false,
      tenantProfile: role === "TENANT" ? { create: {} } : undefined,
      propertyOwner: role === "PROPERTY_OWNER" ? { create: {} } : undefined,
    },
    omit: { password: true },
    include: {
      tenantProfile: true,
      propertyOwner: true,
    },
  });

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authorId: user.tenantProfile?.id || user.propertyOwner?.id,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    configs.jwt_access_secret,
    configs.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    configs.jwt_refresh_secret,
    configs.jwt_refresh_expires_in as SignOptions,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;

  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      tenantProfile: true,
      propertyOwner: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", httpstatus.NOT_FOUND);
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError("User is blocked", httpstatus.FORBIDDEN);
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError("User is deleted", httpstatus.NOT_FOUND);
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password!);

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authorId: user.tenantProfile?.id || user.propertyOwner?.id,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    configs.jwt_access_secret,
    configs.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    configs.jwt_refresh_secret,
    configs.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      tenantProfile: true,
      propertyOwner: true,
    },
    omit: {
      password: true,
    },
  });

  if (!isUserExists) {
    throw new Error("User not found");
  }

  return isUserExists;
};

const refreshToken = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    configs.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new Error(
      configs.node_env === "development"
        ? verifiedRefreshToken.error
        : "Invalid refresh token",
    );
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new Error("User is inactive or not found");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    configs.jwt_access_secret,
    configs.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    configs.jwt_refresh_secret,
    configs.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// const googleLogin = async (payload: IGoogleLoginPayload) => {
//   let googleIdTokenPayload: TokenPayload | null | undefined = null;
//   try {
//     const ticket = await googleClient.verifyIdToken({
//       idToken: payload.idToken,
//       audience: configs.google_client_id,
//     });

//     googleIdTokenPayload = ticket.getPayload();
//   } catch (error) {
//     console.log("Google ID Token Verification Failed", error);
//     throw new Error("Invalid Or Expired Google Id Token");
//   }

//   if (!googleIdTokenPayload) {
//     throw new Error("Invalid Or Expired Google Id Token");
//   }

//   if (!googleIdTokenPayload.email) {
//     throw new Error("Google Email Not Found");
//   }
//   if (!googleIdTokenPayload.name) {
//     throw new Error("Google Email User Name Not Found");
//   }

//   const ifPatientExistWithGoogleAuth = await prisma.user.findUnique({
//     where: {
//       email: googleIdTokenPayload.email,
//       role: Role.PATIENT,
//       googleId: googleIdTokenPayload.sub,
//     },
//   });

//   let user = ifPatientExistWithGoogleAuth;

//   if (!ifPatientExistWithGoogleAuth) {
//     const ifPatientExistWithCredentials = await prisma.user.findUnique({
//       where: {
//         email: googleIdTokenPayload.email,
//         role: Role.PATIENT,
//         authProvider: AuthProvider.CREDENTIAL,
//       },
//     });

//     if (ifPatientExistWithCredentials) {
//       if (!ifPatientExistWithCredentials.emailVerified) {
//         throw new Error("Email Not Verified");
//       }

//       if (ifPatientExistWithCredentials.status === UserStatus.BLOCKED) {
//         throw new Error("User Is Blocked");
//       }

//       if (
//         ifPatientExistWithCredentials.isDeleted ||
//         ifPatientExistWithCredentials.status === UserStatus.DELETED
//       ) {
//         throw new Error("User Is Deleted");
//       }

//       user = await prisma.user.update({
//         where: {
//           id: ifPatientExistWithCredentials.id,
//         },

//         data: {
//           googleId: googleIdTokenPayload.sub,
//         },
//       });
//     } else {
//       // Google Register
//       user = await prisma.user.create({
//         data: {
//           name: googleIdTokenPayload.name,
//           email: googleIdTokenPayload.email,
//           role: Role.PATIENT,
//           googleId: googleIdTokenPayload.sub,
//           authProvider: AuthProvider.GOOGLE,
//           emailVerified: true,
//           patient: {
//             create: {
//               name: googleIdTokenPayload.name,
//               email: googleIdTokenPayload.email,
//             },
//           },
//         },
//       });
//     }
//   }

//   if (!user) {
//     throw new Error("User Not Found");
//   }

//   if (user.status === UserStatus.BLOCKED) {
//     throw new Error("User Is Blocked");
//   }

//   if (user.isDeleted || user.status === UserStatus.DELETED) {
//     throw new Error("User Is Deleted");
//   }

//   const jwtPayload = {
//     userId: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//   };

//   const accessToken = jwtUtils.createToken(
//     jwtPayload,
//     config.jwt_access_secret,
//     config.jwt_access_expires_in as SignOptions,
//   );

//   const refreshToken = jwtUtils.createToken(
//     jwtPayload,
//     config.jwt_refresh_secret,
//     config.jwt_refresh_expires_in as SignOptions,
//   );

//   return {
//     accessToken,
//     refreshToken,
//   };
// };

// const forgotPassword = async (payload: IForgotPasswordPayload) => {
//   const { email } = payload;

//   const isUserExist = await prisma.user.findUnique({
//     where: {
//       email,
//     },
//   });

//   if (!isUserExist) {
//     throw new Error("User Does Not Exist!");
//   }

//   if (isUserExist.status === "BLOCKED") {
//     throw new Error("User is Blocked");
//   }

//   if (!isUserExist.emailVerified) {
//     throw new Error("User Not Verified");
//   }

//   if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
//     throw new Error("User is Deleted");
//   }

//   if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
//     throw new Error("User Has Account With Google");
//   }

//   const otp = crypto.randomInt(100000, 1000000).toString();

//   const key = `forgor-password-otp:${isUserExist.email}`;

//   const expirationSeconds = 5 * 60;

//   await redisClient.set(key, otp, {
//     expiration: {
//       type: "EX",
//       value: expirationSeconds,
//     },
//   });

//   const tempatePath = path.join(
//     process.cwd(),
//     "src/app/templates/forgot-password.ejs",
//   );

//   const templateData = {
//     name: isUserExist.name,
//     otp,
//     expirationMinutes: expirationSeconds / 60,
//   };

//   const html = await ejs.renderFile(tempatePath, templateData);

//   await transporter.sendMail({
//     from: config.email_sender,
//     to: isUserExist.email,
//     subject: "Forgot Password",
//     // text : `Your OTP is ${otp}`
//     // html: `<h1>Your OTP is ${otp}</h1>`
//     html,
//   });
// };

// const resetPassword = async (payload: IResetPasswordPayload) => {
//   const { email, otp, newPassword } = payload;

//   const isUserExist = await prisma.user.findUnique({
//     where: {
//       email,
//     },
//   });

//   if (!isUserExist) {
//     throw new Error("User Does Not Exist!");
//   }

//   if (isUserExist.status === "BLOCKED") {
//     throw new Error("User is Blocked");
//   }

//   if (!isUserExist.emailVerified) {
//     throw new Error("User Not Verified");
//   }

//   if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
//     throw new Error("User is Deleted");
//   }

//   if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
//     throw new Error("User Has Account With Google");
//   }

//   const key = `forgor-password-otp:${isUserExist.email}`;

//   const redisOtp = await redisClient.get(key);

//   if (!redisOtp) {
//     throw new Error("Invalid OTP");
//   }

//   if (redisOtp !== otp) {
//     throw new Error("OTP Does Not Match");
//   }

//   const hashedNewPassword = await bcrypt.hash(
//     newPassword,
//     Number(config.bcrypt_salt_rounds),
//   );

//   await prisma.user.update({
//     where: {
//       email: isUserExist.email,
//     },
//     data: {
//       password: hashedNewPassword,
//     },
//   });

//   await redisClient.del([key]);

//   const tempatePath = path.join(
//     process.cwd(),
//     "src/app/templates/reset-password-success.ejs",
//   );

//   const templateData = {
//     name: isUserExist.name,
//   };

//   const html = await ejs.renderFile(tempatePath, templateData);

//   await transporter.sendMail({
//     from: config.email_sender,
//     to: isUserExist.email,
//     subject: "Password Changed",
//     // text : `Your OTP is ${otp}`
//     // html: `<h1>Your Password Is Changed</h1>`
//     html,
//   });
// };

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
};
