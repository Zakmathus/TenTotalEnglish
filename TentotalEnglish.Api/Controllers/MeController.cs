using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TentotalEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MeController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(new
        {
            Name = User.Identity?.Name,
            Roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList()
        });
    }
}
