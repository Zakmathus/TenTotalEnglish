using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using TenTotalEnglish.Groups.Api.Routes;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TenTotalEnglish.Groups.Api.Handlers;

public class Function
{
    private readonly GroupRoutes _routes;

    public Function()
    {
        var provider = DependencyInjection.Build();
        _routes = provider.GetRequiredService<GroupRoutes>();
    }

    public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(
        APIGatewayHttpApiV2ProxyRequest request,
        ILambdaContext context)
    {
        return await _routes.HandleAsync(request);
    }
}