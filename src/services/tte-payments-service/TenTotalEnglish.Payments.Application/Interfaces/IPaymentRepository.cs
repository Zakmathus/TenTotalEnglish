using TenTotalEnglish.Payments.Domain.Entities;

namespace TenTotalEnglish.Payments.Application.Interfaces;

public interface IPaymentRepository
{
    Task CreateAsync(Payment payment);
    Task<List<Payment>> GetByStudentIdAsync(string studentId);
    Task<ActiveEnrollment?> GetActiveEnrollmentByStudentIdAsync(string studentId);
    Task<bool> ExistsPaymentForEnrollmentMonthAsync(string studentId, string enrollmentId, string month);
    Task<List<ActiveEnrollment>> GetAllActiveEnrollmentsAsync();
}