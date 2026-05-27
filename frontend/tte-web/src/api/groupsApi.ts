const API_BASE_URL = "https://aciv3ec96k.execute-api.us-west-2.amazonaws.com";

export type Group = {
  id: string;
  level: string;
  schedule: string;
  monthlyPrice: number;
  chargeDay: number;
};

export type CreateGroupRequest = {
  level: string;
  schedule: string;
  monthlyPrice: number;
  chargeDay: number;
};

export type CreateGroupResponse = {
  id: string;
  message: string;
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
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function normalizeGroup(raw: any): Group {
  return {
    id: pickString(raw, "id", "Id"),
    level: pickString(raw, "level", "Level", "name", "Name"),
    schedule: pickString(raw, "schedule", "Schedule"),
    monthlyPrice: pickNumber(raw, "monthlyPrice", "MonthlyPrice"),
    chargeDay: pickNumber(raw, "chargeDay", "ChargeDay"),
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

export async function getGroups(): Promise<Group[]> {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: "GET",
  });

  const data = await handleResponse<any[]>(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeGroup);
}

export async function createGroup(
  payload: CreateGroupRequest
): Promise<CreateGroupResponse> {
  const requestBody = {
    name: payload.level,
    level: payload.level,
    schedule: payload.schedule,
    monthlyPrice: payload.monthlyPrice,
    chargeDay: payload.chargeDay,
  };

  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await handleResponse<any>(response);

  return {
    id: data?.id ?? data?.Id ?? "",
    message: data?.message ?? data?.Message ?? "Group created",
  };
}