using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using TenTotalEnglish.Enrollments.Api.Routes;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TenTotalEnglish.Enrollments.Api.Handlers;

public class Function
{
    private readonly EnrollmentRoutes _routes;

    public Function()
    {
        var provider = DependencyInjection.Build();
        _routes = provider.GetRequiredService<EnrollmentRoutes>();
    }

    public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(
        APIGatewayHttpApiV2ProxyRequest request,
        ILambdaContext context)
    {
        return await _routes.HandleAsync(request);
    }
}