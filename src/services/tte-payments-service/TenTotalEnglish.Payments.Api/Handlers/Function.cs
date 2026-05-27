using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Text.Json;
using TenTotalEnglish.Payments.Domain.Entities;
using TenTotalEnglish.Payments.Api.Dtos;
using TenTotalEnglish.Payments.Infrastructure.Repositories;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TenTotalEnglish.Payments.Api.Handlers;

public class Function
{
    private readonly PaymentRepository repo = new();

    public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(
        APIGatewayHttpApiV2ProxyRequest request,
        ILambdaContext context)
    {
        var method = request.RequestContext.Http.Method;
        var path = request.RawPath;

        if (method == "POST" && path == "/payments")
            return await CreatePayment(request);

        if (method == "GET" && path.StartsWith("/students/") && path.EndsWith("/payments"))
            return await GetStudentPayments(path);

        if (method == "GET" && path == "/payments/pending")
            return await GetPendingPayments(request);

        return JsonResponse(404, new { message = "Route not found" });
    }

    private async Task<APIGatewayHttpApiV2ProxyResponse> CreatePayment(APIGatewayHttpApiV2ProxyRequest request)
    {
        var dto = JsonSerializer.Deserialize<CreatePaymentRequest>(
            request.Body ?? "{}",
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (dto is null ||
            string.IsNullOrWhiteSpace(dto.StudentId) ||
            string.IsNullOrWhiteSpace(dto.EnrollmentId) ||
            string.IsNullOrWhiteSpace(dto.Month) ||
            dto.Amount <= 0)
        {
            return JsonResponse(400, new { message = "Invalid request" });
        }

        var activeEnrollment = await repo.GetActiveEnrollmentByStudentIdAsync(dto.StudentId);

        if (activeEnrollment is null)
            return JsonResponse(404, new { message = "Active enrollment not found for student" });

        if (activeEnrollment.EnrollmentId != dto.EnrollmentId)
            return JsonResponse(409, new { message = "EnrollmentId does not match student's active enrollment" });

        var exists = await repo.ExistsPaymentForEnrollmentMonthAsync(dto.StudentId, dto.EnrollmentId, dto.Month);

        if (exists)
            return JsonResponse(409, new { message = "Payment already exists for this enrollment and month" });

        var paymentDate = dto.PaymentDate == default ? DateTime.UtcNow : dto.PaymentDate;

        var payment = new Payment(dto.StudentId, dto.EnrollmentId, dto.Amount, paymentDate, dto.Month);
        await repo.CreateAsync(payment);

        return JsonResponse(201, new
        {
            id = payment.Id,
            message = "Payment created successfully"
        });
    }

    private async Task<APIGatewayHttpApiV2ProxyResponse> GetStudentPayments(string path)
    {
        var parts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length < 3)
            return JsonResponse(400, new { message = "Invalid path" });

        var studentId = parts[1];
        var payments = await repo.GetByStudentIdAsync(studentId);

        var response = payments.Select(x => new
        {
            id = x.Id,
            studentId = x.StudentId,
            enrollmentId = x.EnrollmentId,
            amount = x.Amount,
            paymentDate = x.PaymentDate,
            month = x.Month,
            status = x.Status,
            createdAtUtc = x.CreatedAtUtc
        });

        return JsonResponse(200, response);
    }

    private async Task<APIGatewayHttpApiV2ProxyResponse> GetPendingPayments(APIGatewayHttpApiV2ProxyRequest request)
    {
        var month = request.QueryStringParameters != null &&
                    request.QueryStringParameters.TryGetValue("month", out var monthValue) &&
                    !string.IsNullOrWhiteSpace(monthValue)
            ? monthValue
            : DateTime.UtcNow.ToString("yyyy-MM");

        if (!IsValidMonth(month))
            return JsonResponse(400, new { message = "Month must have format yyyy-MM" });

        var activeEnrollments = await repo.GetAllActiveEnrollmentsAsync();
        var pending = new List<object>();

        foreach (var enrollment in activeEnrollments)
        {
            var exists = await repo.ExistsPaymentForEnrollmentMonthAsync(
                enrollment.StudentId,
                enrollment.EnrollmentId,
                month);

            if (!exists)
            {
                pending.Add(new
                {
                    studentId = enrollment.StudentId,
                    enrollmentId = enrollment.EnrollmentId,
                    groupId = enrollment.GroupId,
                    expectedAmount = enrollment.PriceAtEnrollment,
                    chargeDay = enrollment.ChargeDayAtEnrollment,
                    month = month,
                    status = "Pending"
                });
            }
        }

        var ordered = pending
            .OrderBy(x => ((dynamic)x).chargeDay)
            .ThenBy(x => ((dynamic)x).studentId)
            .ToList();

        return JsonResponse(200, ordered);
    }

    private static bool IsValidMonth(string value)
    {
        if (value.Length != 7 || value[4] != '-')
            return false;

        var yearOk = int.TryParse(value[..4], out _);
        var monthOk = int.TryParse(value[5..7], out var month);

        return yearOk && monthOk && month >= 1 && month <= 12;
    }

    private static APIGatewayHttpApiV2ProxyResponse JsonResponse(int statusCode, object body)
    {
        return new APIGatewayHttpApiV2ProxyResponse
        {
            StatusCode = statusCode,
            Body = JsonSerializer.Serialize(body),
            Headers = new Dictionary<string, string>
            {
                ["Content-Type"] = "application/json"
            }
        };
    }
}