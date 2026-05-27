using Amazon.DynamoDBv2;
using Microsoft.Extensions.DependencyInjection;
using TenTotalEnglish.Groups.Api.Routes;
using TenTotalEnglish.Groups.Application.Interfaces;
using TenTotalEnglish.Groups.Infrastructure.Repositories;

namespace TenTotalEnglish.Groups.Api;

public static class DependencyInjection
{
    public static ServiceProvider Build()
    {
        var services = new ServiceCollection();

        services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
        services.AddSingleton<IGroupRepository, GroupRepository>();
        services.AddSingleton<GroupRoutes>();

        return services.BuildServiceProvider();
    }
}