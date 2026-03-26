import prisma from "../../config/database";
import { CreateCampusDto, UpdateCampusDto } from "./campus.types";

const mapToResponse = (campus: any): any => {
  const { code, phone, isActive, ...rest } = campus;
  return {
    ...rest,
    campus_code: code,
    contact_number: phone,
    is_active: isActive,
  };
};

export const getAllCampuses = async () => {
  const campuses = await prisma.campus.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return campuses.map(mapToResponse);
};

export const getCampusById = async (id: string) => {
  const campus = await prisma.campus.findUnique({
    where: { id },
  });

  if (!campus) {
    throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
  }

  return mapToResponse(campus);
};

export const createCampus = async (data: CreateCampusDto) => {
  const existing = await prisma.campus.findUnique({
    where: { code: data.campus_code },
  });

  if (existing) {
    throw Object.assign(new Error("Campus code already exists"), { statusCode: 409 });
  }

  const campus = await prisma.campus.create({
    data: {
      name: data.name,
      code: data.campus_code,
      address: data.address,
      phone: data.contact_number,
    },
  });
  
  return mapToResponse(campus);
};

export const updateCampus = async (id: string, data: UpdateCampusDto) => {
  const existing = await prisma.campus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.campus_code !== undefined) updateData.code = data.campus_code;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.contact_number !== undefined) updateData.phone = data.contact_number;

  const campus = await prisma.campus.update({
    where: { id },
    data: updateData,
  });
  
  return mapToResponse(campus);
};

export const toggleCampusStatus = async (id: string) => {
  const existing = await prisma.campus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw Object.assign(new Error("Campus not found"), { statusCode: 404 });
  }

  const campus = await prisma.campus.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
  });
  
  return mapToResponse(campus);
};
