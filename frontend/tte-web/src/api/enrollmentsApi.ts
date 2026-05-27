const API_BASE_URL = "https://aciv3ec96k.execute-api.us-west-2.amazonaws.com";

export type CreateEnrollmentRequest = {
  studentId: string;
  groupId: string;
  startDate: string;
  priceAtEnrollment: number;
  chargeDayAtEnrollment: number;
};

export type CreateEnrollmentResponse = {
  id: string;
  message: string;
};

export type ActiveEnrollment = {
  id: string;
  studentId: string;
  groupId: string;
  startDate: string;
  status: string;
  priceAtEnrollment: number;
  chargeDayAtEnrollment: number;
  createdAtUtc: string;
};

function pickString(obj: any, ...keys: string[]): string {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return "";
}

function pickNumber(obj: any, ...keys: string[]): number {
  for (const key of keys) {
    const value = obj?.[key];

    if (typeof value === "number") {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

function normalizeActiveEnrollment(raw: any): ActiveEnrollment {
  return {
    id: pickString(raw, "id", "Id"),
    studentId: pickString(raw, "studentId", "StudentId"),
    groupId: pickString(raw, "groupId", "GroupId"),
    startDate: pickString(raw, "startDate", "StartDate"),
    status: pickString(raw, "status", "Status"),
    priceAtEnrollment: pickNumber(
      raw,
      "priceAtEnrollment",
      "PriceAtEnrollment"
    ),
    chargeDayAtEnrollment: pickNumber(
      raw,
      "chargeDayAtEnrollment",
      "ChargeDayAtEnrollment"
    ),
    createdAtUtc: pickString(raw, "createdAtUtc", "CreatedAtUtc"),
  };
}

function handleError(status: number, data: any): never {
  const message =
    data?.message || data?.Message || `Request failed with status ${status}`;

  throw new Error(message);
}

export async function createEnrollment(
  payload: CreateEnrollmentRequest
): Promise<CreateEnrollmentResponse> {
  const response = await fetch(`${API_BASE_URL}/enrollments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    handleError(response.status, data);
  }

  return {
    id: data?.id ?? data?.Id ?? "",
    message: data?.message ?? data?.Message ?? "Enrollment created",
  };
}

export async function getActiveEnrollment(
  studentId: string
): Promise<ActiveEnrollment> {
  const response = await fetch(
    `${API_BASE_URL}/students/${encodeURIComponent(studentId)}/active-enrollment`,
    {
      method: "GET",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    handleError(response.status, data);
  }

  return normalizeActiveEnrollment(data);
}