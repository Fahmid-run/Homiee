import {
  PropertyStatus,
  RoomType,
} from "../../../../prisma/generated/prisma/enums";

export interface SearchPropertiesQuery {
  searchTerm?: string;
  city?: string;
  minRent?: number;
  maxRent?: number;
  roomType?: RoomType;
  availableRoomsOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "totalrooms";
  sortOrder?: "asc" | "desc";
}

export interface PropertyPayload {
  name: string;
  address: string;
  description?: string;
  city: string;
  totalrooms: number;
}
