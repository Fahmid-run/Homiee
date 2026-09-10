import {
  BillStatus,
  UtilityType,
} from "../../../../prisma/generated/prisma/enums";

export interface CreateBillPayload {
  type: UtilityType;
  description: string;
  billPeriodStart: Date;
  billPeriodEnd: Date;
  totalAmount: number;
  dueDate: Date;
  status: BillStatus;
}
