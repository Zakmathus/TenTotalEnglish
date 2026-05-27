using Amazon.DynamoDBv2;
using Microsoft.Extensions.DependencyInjection;
using TenTotalEnglish.Students.Application.Interfaces;
using TenTotalEnglish.Students.Infrastructure.Repositories;
using TenTotalEnglish.Students.Api.Routes;

namespace TenTotalEnglish.Students.Api;

public static class DependencyInjection
{
    public static ServiceProvider Build()
    {
        var services = new ServiceCollection();

        services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
        services.AddSingleton<IStudentRepository, StudentRepository>();
        services.AddSingleton<StudentRoutes>();

        return services.BuildServiceProvider();
    }
}