using Amazon.DynamoDBv2;
using Microsoft.Extensions.DependencyInjection;
using TenTotalEnglish.Enrollments.Api.Routes;
using TenTotalEnglish.Enrollments.Application.Interfaces;
using TenTotalEnglish.Enrollments.Infrastructure.Repositories;

namespace TenTotalEnglish.Enrollments.Api;

public static class DependencyInjection
{
    public static ServiceProvider Build()
    {
        var services = new ServiceCollection();

        services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
        services.AddSingleton<IEnrollmentRepository, EnrollmentRepository>();
        services.AddSingleton<EnrollmentRoutes>();

        return services.BuildServiceProvider();
    }
}