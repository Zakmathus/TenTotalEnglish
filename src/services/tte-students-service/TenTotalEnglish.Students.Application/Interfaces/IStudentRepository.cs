using TenTotalEnglish.Students.Domain.Entities;

namespace TenTotalEnglish.Students.Application.Interfaces;

public interface IStudentRepository
{
    Task CreateAsync(Student student, CancellationToken cancellationToken = default);
    Task<Student?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default);
}