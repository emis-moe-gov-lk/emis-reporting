import { NextResponse } from "next/server";
import { employeeController } from "@/server/controllers/employee.controller";
import { AppError } from "@/server/errors/app-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "25");

  try {
    const result = await employeeController.list(type, page, limit);
    const employeeLabel = type === "principal" ? "Principals" : "Teachers";
    return NextResponse.json({
      success: true,
      message: `${employeeLabel} retrieved successfully.`,
      data: {
        records: result.rows,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalRecords: result.total,
          totalPages: result.totalPages,
        },
        dataQuality: {
          identity: "decrypted_when_app_key_is_valid",
          schoolAndZonalMayBeNull: true,
        },
      },
      errors: [],
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: {},
          errors: [{ code: String(error.statusCode), field: error.field }],
        },
        { status: error.statusCode },
      );
    }
    console.error("Teacher employee report failed", error);
    return NextResponse.json(
      {
        success: false,
        message: "The teacher report could not be generated.",
        data: {},
        errors: [{ code: "500", field: "" }],
      },
      { status: 500 },
    );
  }
}
