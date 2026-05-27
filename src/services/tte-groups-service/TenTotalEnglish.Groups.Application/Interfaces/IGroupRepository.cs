using TenTotalEnglish.Groups.Domain.Entities;

namespace TenTotalEnglish.Groups.Application.Interfaces;

public interface IGroupRepository
{
    Task CreateAsync(Group group, CancellationToken cancellationToken = default);
    Task<Group?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<List<Group>> GetAllAsync(CancellationToken cancellationToken = default);
}