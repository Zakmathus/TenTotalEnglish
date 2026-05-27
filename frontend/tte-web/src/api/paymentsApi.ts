const API_BASE_URL = "https://aciv3ec96k.execute-api.us-west-2.amazonaws.com";

export type CreatePaymentRequest = {
  studentId: string;
  enrollmentId: string;
  amount: number;
  paymentDate: string;
  month: string;
};

export type CreatePaymentResponse = {
  id: string;
  message: string;
};

export type StudentPayment = {
  id: string;
  studentId: string;
  enrollmentId: string;
  amount: number;
  paymentDate: string;
  month: string;
  status: string;
  createdAtUtc: string;
};

export type PendingPayment = {
  studentId: string;
  enrollmentId: string;
  groupId: string;
  expectedAmount: number;
  chargeDay: number;
  month: string;
  status: string;
};

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
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function createPayment(
  payload: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<CreatePaymentResponse>(response);
}

export async function getStudentPayments(
  studentId: string
): Promise<StudentPayment[]> {
  const response = await fetch(
    `${API_BASE_URL}/students/${encodeURIComponent(studentId)}/payments`,
    {
      method: "GET",
    }
  );

  return handleResponse<StudentPayment[]>(response);
}

export async function getPendingPayments(
  month: string
): Promise<PendingPayment[]> {
  const response = await fetch(
    `${API_BASE_URL}/payments/pending?month=${encodeURIComponent(month)}`,
    {
      method: "GET",
    }
  );

  return handleResponse<PendingPayment[]>(response);
}