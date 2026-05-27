using TenTotalEnglish.Enrollments.Domain.Entities;

namespace TenTotalEnglish.Enrollments.Application.Interfaces;

public interface IEnrollmentRepository
{
    Task<bool> HasActiveEnrollmentAsync(string studentId, CancellationToken cancellationToken = default);
    Task CreateAsync(Enrollment enrollment, CancellationToken cancellationToken = default);
    Task<Enrollment?> GetActiveByStudentIdAsync(string studentId, CancellationToken cancellationToken = default);
    Task CreateOrReplaceActiveAsync(Enrollment enrollment, CancellationToken cancellationToken = default);
}