using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.Common;
using Microsoft.EntityFrameworkCore;
using BaseCore.Repository;
using BaseCore.DTO.UserPlatform;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly AppDbContext _context;

        public UsersController(IUserRepository userRepository, AppDbContext context)
        {
            _userRepository = userRepository;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? keyword,
            [FromQuery] string? role,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Users
                .AsNoTracking()
                .IgnoreQueryFilters(); // hiện cả user đã xóa mềm

            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(u =>
                    u.UserName.Contains(keyword) ||
                    u.FullName.Contains(keyword) ||
                    (u.Email != null && u.Email.Contains(keyword)) ||
                    (u.Phone != null && u.Phone.Contains(keyword)));

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role == role);

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive.Value);

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new {
                    u.Id, u.UserName, u.FullName, u.Email, u.Phone,
                    u.Role, u.AvatarUrl, u.IsActive, u.IsEmailVerified,
                    u.EmailVerifiedAt, u.LastLoginAt, u.Created, u.Modified,
                    u.IsDeleted, u.Contact, u.Position, u.BrandId,
                })
                .ToListAsync();

            return Ok(new {
                items = users, totalCount, page, pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Select(u => new {
                    u.Id, u.UserName, u.FullName, u.Email, u.Phone,
                    u.Role, u.AvatarUrl, u.IsActive, u.IsEmailVerified,
                    u.EmailVerifiedAt, u.LastLoginAt, u.Created, u.Modified,
                    u.IsDeleted, u.Contact, u.Position, u.BrandId
                })
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound(new { message = "User not found" });
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            if (await _userRepository.IsUserNameExistsAsync(dto.UserName))
                return BadRequest(new { message = "Tên tài khoản đã tồn tại" });

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
                if (emailExists) return BadRequest(new { message = "Email đã được sử dụng" });
            }

            byte[] salt;
            var passwordHash = TokenHelper.HashPassword(dto.Password, out salt);

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = dto.UserName,
                FullName = dto.FullName ?? dto.UserName,
                Email = dto.Email ?? "",
                Phone = dto.Phone ?? "",
                PasswordHash = passwordHash,
                Salt = salt,
                Role = dto.Role ?? "customer",
                AvatarUrl = dto.AvatarUrl ?? "",
                Contact = dto.Contact ?? "",
                Position = dto.Position ?? "",
                BrandId = dto.BrandId,
                IsActive = true,
                IsEmailVerified = false,
                Created = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            return Ok(new {
                user.Id, user.UserName, user.FullName, user.Email,
                user.Phone, user.Role, user.IsActive, user.Created
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound(new { message = "User not found" });

            if (dto.FullName != null)  user.FullName  = dto.FullName;
            if (dto.Email != null)     user.Email     = dto.Email;
            if (dto.Phone != null)     user.Phone     = dto.Phone;
            if (dto.Role != null)      user.Role      = dto.Role;
            if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;
            if (dto.Contact != null)   user.Contact   = dto.Contact;
            if (dto.Position != null)  user.Position  = dto.Position;
            if (dto.BrandId.HasValue)  user.BrandId   = dto.BrandId == Guid.Empty ? null : dto.BrandId;
            if (dto.IsActive.HasValue) user.IsActive  = dto.IsActive.Value;
            if (dto.IsEmailVerified.HasValue) user.IsEmailVerified = dto.IsEmailVerified.Value;

            // Khôi phục nếu đang bị xóa mềm
            if (dto.IsActive == true && user.IsDeleted)
                user.IsDeleted = true;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                byte[] salt;
                user.PasswordHash = TokenHelper.HashPassword(dto.Password, out salt);
                user.Salt = salt;
            }

            user.Modified = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new {
                user.Id, user.UserName, user.FullName, user.Email,
                user.Phone, user.Role, user.IsActive, user.Modified
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound(new { message = "User not found" });

            // Không cho xóa admin cuối cùng
            if (user.Role == "admin")
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == "admin" && !u.IsDeleted);
                if (adminCount <= 1)
                    return BadRequest(new { message = "Không thể xóa admin duy nhất" });
            }

            user.IsDeleted = true;
            user.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully" });
        }

        // Khôi phục user đã xóa mềm
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> Restore(Guid id)
        {
            var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();
            user.IsDeleted = true;
            user.IsActive = true;
            user.Modified = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User restored successfully" });
        }
    }
}
