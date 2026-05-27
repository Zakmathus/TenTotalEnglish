using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using TenTotalEnglish.Students.Application.Interfaces;
using TenTotalEnglish.Students.Domain.Entities;

namespace TenTotalEnglish.Students.Infrastructure.Repositories;

public class StudentRepository : IStudentRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public StudentRepository(IAmazonDynamoDB dynamoDb)
    {
        _dynamoDb = dynamoDb;
        _tableName = Environment.GetEnvironmentVariable("TABLE_NAME") ?? "tte-dev-main";
    }

    public async Task CreateAsync(Student student, CancellationToken cancellationToken = default)
    {
        var item = new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = $"STUDENT#{student.Id}" },
            ["SK"] = new AttributeValue { S = "PROFILE" },
            ["EntityType"] = new AttributeValue { S = "Student" },
            ["StudentId"] = new AttributeValue { S = student.Id },
            ["FullName"] = new AttributeValue { S = student.FullName },
            ["BirthDate"] = new AttributeValue { S = student.BirthDate.ToString("yyyy-MM-dd") },
            ["Phone"] = new AttributeValue { S = student.Phone },
            ["Email"] = new AttributeValue { S = student.Email },
            ["Occupation"] = new AttributeValue { S = student.Occupation },
            ["Neighborhood"] = new AttributeValue { S = student.Neighborhood },
            ["CompanySupport"] = new AttributeValue { BOOL = student.CompanySupport },
            ["CreatedAtUtc"] = new AttributeValue { S = student.CreatedAtUtc.ToString("O") }
        };

        if (!string.IsNullOrWhiteSpace(student.CompanyName))
        {
            item["CompanyName"] = new AttributeValue { S = student.CompanyName };
        }

        if (student.CompanySupportAmount.HasValue)
        {
            item["CompanySupportAmount"] = new AttributeValue
            {
                N = student.CompanySupportAmount.Value.ToString(System.Globalization.CultureInfo.InvariantCulture)
            };
        }

        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = item
        }, cancellationToken);
    }

    public async Task<Student?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["PK"] = new AttributeValue { S = $"STUDENT#{id}" },
                ["SK"] = new AttributeValue { S = "PROFILE" }
            }
        }, cancellationToken);

        if (response.Item == null || response.Item.Count == 0)
        {
            return null;
        }

        return MapStudent(response.Item);
    }

    public async Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var students = new List<Student>();
        Dictionary<string, AttributeValue>? exclusiveStartKey = null;

        do
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _tableName,
                FilterExpression = "begins_with(PK, :pk) AND SK = :sk",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":pk"] = new AttributeValue { S = "STUDENT#" },
                    [":sk"] = new AttributeValue { S = "PROFILE" }
                },
                ExclusiveStartKey = exclusiveStartKey
            }, cancellationToken);

            foreach (var item in response.Items)
            {
                students.Add(MapStudent(item));
            }

            exclusiveStartKey = response.LastEvaluatedKey != null && response.LastEvaluatedKey.Count > 0
                ? response.LastEvaluatedKey
                : null;
        }
        while (exclusiveStartKey != null);

        return students
            .OrderBy(x => x.FullName)
            .ToList();
    }

    private static Student MapStudent(Dictionary<string, AttributeValue> item)
    {
        var id = item.ContainsKey("StudentId")
            ? item["StudentId"].S
            : item["PK"].S.Replace("STUDENT#", "");

        var fullName = item.ContainsKey("FullName") ? item["FullName"].S : string.Empty;

        var birthDate = item.ContainsKey("BirthDate")
            ? DateTime.Parse(item["BirthDate"].S)
            : DateTime.UtcNow.Date;

        var phone = item.ContainsKey("Phone") ? item["Phone"].S : string.Empty;
        var email = item.ContainsKey("Email") ? item["Email"].S : string.Empty;
        var occupation = item.ContainsKey("Occupation") ? item["Occupation"].S : string.Empty;
        var neighborhood = item.ContainsKey("Neighborhood") ? item["Neighborhood"].S : string.Empty;

        var companyName = item.ContainsKey("CompanyName")
            ? item["CompanyName"].S
            : null;

        var companySupport = item.ContainsKey("CompanySupport") && item["CompanySupport"].BOOL == true;

        decimal? companySupportAmount = null;
        if (item.ContainsKey("CompanySupportAmount") &&
            decimal.TryParse(
                item["CompanySupportAmount"].N,
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture,
                out var parsedAmount))
        {
            companySupportAmount = parsedAmount;
        }

        var createdAtUtc = item.ContainsKey("CreatedAtUtc") &&
                           DateTime.TryParse(item["CreatedAtUtc"].S, out var parsedCreatedAtUtc)
            ? parsedCreatedAtUtc
            : DateTime.UtcNow;

        return Student.Rehydrate(
            id,
            fullName,
            birthDate,
            phone,
            email,
            occupation,
            neighborhood,
            companyName,
            companySupport,
            companySupportAmount,
            createdAtUtc);
    }
}