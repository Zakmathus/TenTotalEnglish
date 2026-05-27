using System.Net;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using TenTotalEnglish.Enrollments.Api.Dtos;
using TenTotalEnglish.Enrollments.Application.Interfaces;
using TenTotalEnglish.Enrollments.Domain.Entities;

namespace TenTotalEnglish.Enrollments.Api.Routes;

public class EnrollmentRoutes
{
    private readonly IEnrollmentRepository _enrollmentRepository;

    public EnrollmentRoutes(IEnrollmentRepository enrollmentRepository)
    {
        _enrollmentRepository = enrollmentRepository;
    }

    public async Task<APIGatewayHttpApiV2ProxyResponse> HandleAsync(APIGatewayHttpApiV2ProxyRequest request)
    {
        var method = request.RequestContext.Http.Method;
        var path = request.RawPath;

        if (method == "POST" && path == "/enrollments")
        {
            var dto = JsonSerializer.Deserialize<CreateEnrollmentRequest>(
                request.Body ?? "{}",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (dto is null || string.IsNullOrWhiteSpace(dto.StudentId) || string.IsNullOrWhiteSpace(dto.GroupId))
            {
                return Json(HttpStatusCode.BadRequest, new { message = "StudentId and GroupId are required." });
            }

            var enrollment = new Enrollment(
                dto.StudentId,
                dto.GroupId,
                dto.StartDate,
                dto.PriceAtEnrollment,
                dto.ChargeDayAtEnrollment
            );

            await _enrollmentRepository.CreateOrReplaceActiveAsync(enrollment);

            return Json(HttpStatusCode.Created, new
            {
                id = enrollment.Id,
                message = "Enrollment created successfully"
            });
        }

        if (method == "GET" && path.StartsWith("/students/") && path.EndsWith("/active-enrollment"))
        {
            var parts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length >= 3)
            {
                var studentId = parts[1];
                var enrollment = await _enrollmentRepository.GetActiveByStudentIdAsync(studentId);

                if (enrollment is null)
                {
                    return Json(HttpStatusCode.NotFound, new { message = "Active enrollment not found." });
                }

                return Json(HttpStatusCode.OK, new EnrollmentResponse
                {
                    Id = enrollment.Id,
                    StudentId = enrollment.StudentId,
                    GroupId = enrollment.GroupId,
                    StartDate = enrollment.StartDate,
                    Status = enrollment.Status,
                    PriceAtEnrollment = enrollment.PriceAtEnrollment,
                    ChargeDayAtEnrollment = enrollment.ChargeDayAtEnrollment,
                    CreatedAtUtc = enrollment.CreatedAtUtc
                });
            }
        }

        return Json(HttpStatusCode.NotFound, new { message = "Route not found." });
    }

    private static APIGatewayHttpApiV2ProxyResponse Json(HttpStatusCode statusCode, object body)
    {
        return new APIGatewayHttpApiV2ProxyResponse
        {
            StatusCode = (int)statusCode,
            Headers = new Dictionary<string, string>
            {
                ["Content-Type"] = "application/json"
            },
            Body = JsonSerializer.Serialize(body)
        };
    }
}