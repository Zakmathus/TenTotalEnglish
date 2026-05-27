const API_BASE_URL = "https://aciv3ec96k.execute-api.us-west-2.amazonaws.com";

export type CreateStudentRequest = {
  fullName: string;
  birthDate?: string;
  phone?: string;
  email: string;
  occupation?: string;
  neighborhood?: string;
  companyName?: string;
  companySupport?: boolean;
  companySupportAmount?: number;
};

export type CreateStudentResponse = {
  id: string;
  message: string;
};

export type Student = {
  id: string;
  fullName: string;
  birthDate?: string;
  phone?: string;
  email: string;
  occupation?: string;
  neighborhood?: string;
  companyName?: string;
  companySupport?: boolean;
  companySupportAmount?: number;
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

function pickOptionalString(obj: any, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }
  return undefined;
}

function pickBoolean(obj: any, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "boolean") {
      return value;
    }
  }
  return undefined;
}

function pickNumber(obj: any, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "number") {
      return value;
    }
  }
  return undefined;
}

function normalizeStudent(raw: any): Student {
  return {
    id: pickString(raw, "id", "Id"),
    fullName: pickString(raw, "fullName", "FullName", "name", "Name"),
    birthDate: pickOptionalString(raw, "birthDate", "BirthDate"),
    phone: pickOptionalString(raw, "phone", "Phone"),
    email: pickString(raw, "email", "Email"),
    occupation: pickOptionalString(raw, "occupation", "Occupation"),
    neighborhood: pickOptionalString(raw, "neighborhood", "Neighborhood"),
    companyName: pickOptionalString(raw, "companyName", "CompanyName"),
    companySupport: pickBoolean(raw, "companySupport", "CompanySupport"),
    companySupportAmount: pickNumber(
      raw,
      "companySupportAmount",
      "CompanySupportAmount"
    ),
    createdAtUtc: pickString(
      raw,
      "createdAtUtc",
      "CreatedAtUtc",
      "createdAt",
      "CreatedAt"
    ),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();

  let data: any = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.Message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function createStudent(
  payload: CreateStudentRequest
): Promise<CreateStudentResponse> {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<any>(response);

  return {
    id: data?.id ?? data?.Id ?? "",
    message: data?.message ?? data?.Message ?? "Student created",
  };
}

export async function getStudentById(studentId: string): Promise<Student> {
  const response = await fetch(
    `${API_BASE_URL}/students/${encodeURIComponent(studentId)}`,
    {
      method: "GET",
    }
  );

  const data = await handleResponse<any>(response);
  return normalizeStudent(data);
}

export async function getStudents(): Promise<Student[]> {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: "GET",
  });

  const data = await handleResponse<any[]>(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeStudent);
}