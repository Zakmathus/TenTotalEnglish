using System.Net;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using TenTotalEnglish.Groups.Api.Dtos;
using TenTotalEnglish.Groups.Application.Interfaces;
using TenTotalEnglish.Groups.Domain.Entities;

namespace TenTotalEnglish.Groups.Api.Routes;

public class GroupRoutes
{
    private readonly IGroupRepository _groupRepository;

    public GroupRoutes(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<APIGatewayHttpApiV2ProxyResponse> HandleAsync(APIGatewayHttpApiV2ProxyRequest request)
    {
        var method = request.RequestContext.Http.Method;
        var path = request.RawPath;

        if (method == "POST" && path == "/groups")
        {
            var dto = JsonSerializer.Deserialize<CreateGroupRequest>(request.Body ?? "{}",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (dto is null || string.IsNullOrWhiteSpace(dto.Name))
                return Json(HttpStatusCode.BadRequest, new { message = "Name is required." });

            var group = new Group(
                dto.Name,
                dto.Level,
                dto.Schedule,
                dto.ChargeDay,
                dto.MonthlyPrice);

            await _groupRepository.CreateAsync(group);

            return Json(HttpStatusCode.Created, new
            {
                id = group.Id,
                message = "Group created successfully"
            });
        }

        if (method == "GET" && path == "/groups")
        {
            var groups = await _groupRepository.GetAllAsync();

            var response = groups.Select(group => new GroupResponse
            {
                Id = group.Id,
                Name = group.Name,
                Level = group.Level,
                Schedule = group.Schedule,
                ChargeDay = group.ChargeDay,
                MonthlyPrice = group.MonthlyPrice,
                CreatedAtUtc = group.CreatedAtUtc
            }).ToList();

            return Json(HttpStatusCode.OK, response);
        }

        if (method == "GET" && path.StartsWith("/groups/"))
        {
            var id = path.Split('/').Last();
            var group = await _groupRepository.GetByIdAsync(id);

            if (group is null)
                return Json(HttpStatusCode.NotFound, new { message = "Group not found." });

            return Json(HttpStatusCode.OK, new GroupResponse
            {
                Id = group.Id,
                Name = group.Name,
                Level = group.Level,
                Schedule = group.Schedule,
                ChargeDay = group.ChargeDay,
                MonthlyPrice = group.MonthlyPrice,
                CreatedAtUtc = group.CreatedAtUtc
            });
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