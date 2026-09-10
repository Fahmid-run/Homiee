import { SleepSchedule } from "../../../../prisma/generated/prisma/enums";

export interface CreateRoomMatePreferencePayload {
  minAge: number;
  maxAge: number;
  smokingAllowed: boolean;
  sleepSchedule: SleepSchedule;
  preferredMoveInDate: Date;
}
