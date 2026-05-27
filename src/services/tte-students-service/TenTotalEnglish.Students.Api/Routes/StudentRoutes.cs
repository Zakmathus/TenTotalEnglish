using System.Net;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using TenTotalEnglish.Students.Api.Dtos;
using TenTotalEnglish.Students.Application.Interfaces;
using TenTotalEnglish.Students.Domain.Entities;

namespace TenTotalEnglish.Students.Api.Routes;

public class StudentRoutes
{
    private readonly IStudentRepository _studentRepository;

    public StudentRoutes(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    public async Task<APIGatewayHttpApiV2ProxyResponse> HandleAsync(APIGatewayHttpApiV2ProxyRequest request)
    {
        var method = request.RequestContext.Http.Method;
        var path = request.RawPath;

        if (method == "POST" && path == "/students")
        {
            var dto = JsonSerializer.Deserialize<CreateStudentRequest>(request.Body ?? "{}",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (dto is null || string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            {
                return Json(HttpStatusCode.BadRequest, new { message = "FullName and Email are required." });
            }

            var student = new Student(
                dto.FullName,
                dto.BirthDate,
                dto.Phone,
                dto.Email,
                dto.Occupation,
                dto.Neighborhood,
                dto.CompanyName,
                dto.CompanySupport,
                dto.CompanySupportAmount);

            await _studentRepository.CreateAsync(student);

            return Json(HttpStatusCode.Created, new
            {
                id = student.Id,
                message = "Student created successfully"
            });
        }

        if (method == "GET" && path == "/students")
        {
            var students = await _studentRepository.GetAllAsync();

            var response = students.Select(student => new StudentResponse
            {
                Id = student.Id,
                FullName = student.FullName,
                BirthDate = student.BirthDate,
                Phone = student.Phone,
                Email = student.Email,
                Occupation = student.Occupation,
                Neighborhood = student.Neighborhood,
                CompanyName = student.CompanyName,
                CompanySupport = student.CompanySupport,
                CompanySupportAmount = student.CompanySupportAmount,
                CreatedAtUtc = student.CreatedAtUtc
            }).ToList();

            return Json(HttpStatusCode.OK, response);
        }

        if (method == "GET" && path.StartsWith("/students/"))
        {
            var id = path.Split('/').Last();

            var student = await _studentRepository.GetByIdAsync(id);

            if (student is null)
                return Json(HttpStatusCode.NotFound, new { message = "Student not found." });

            var response = new StudentResponse
            {
                Id = student.Id,
                FullName = student.FullName,
                BirthDate = student.BirthDate,
                Phone = student.Phone,
                Email = student.Email,
                Occupation = student.Occupation,
                Neighborhood = student.Neighborhood,
                CompanyName = student.CompanyName,
                CompanySupport = student.CompanySupport,
                CompanySupportAmount = student.CompanySupportAmount,
                CreatedAtUtc = student.CreatedAtUtc
            };

            return Json(HttpStatusCode.OK, response);
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