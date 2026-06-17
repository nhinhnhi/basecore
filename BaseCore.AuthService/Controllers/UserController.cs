using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Services.Authen;
using BaseCore.DTO.UserPlatform;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.AuthService.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] string keyword = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (users, totalCount) = await _userService.SearchAsync(keyword, page, pageSize);

            var result = users.Select(u => new UserResponse
            {
                Id = u.Id,
                Username = u.UserName,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role ?? "customer",
                IsActive = u.IsActive,
                CreatedAt = u.Created,
                AvatarUrl = u.AvatarUrl,
                Position = u.Position,
                Contact = u.Contact,
                BrandId = u.BrandId
            });

            return Ok(new
            {
                items = result,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new UserResponse
            {
                Id = user.Id,
                Username = user.UserName,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role ?? "customer",
                IsActive = user.IsActive,
                CreatedAt = user.Created,
                AvatarUrl = user.AvatarUrl,
                Position = user.Position,
                Contact = user.Contact,
                BrandId = user.BrandId
            });
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            if (string.IsNullOrEmpty(dto.UserName) || string.IsNullOrEmpty(dto.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            try
            {
                var createdUser = await _userService.CreateAsync(dto);

                return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, new UserResponse
                {
                    Id = createdUser.Id,
                    Username = createdUser.UserName,
                    FullName = createdUser.FullName,
                    Email = createdUser.Email,
                    Phone = createdUser.Phone,
                    Role = createdUser.Role ?? "customer",
                    IsActive = createdUser.IsActive,
                    CreatedAt = createdUser.Created,
                    AvatarUrl = createdUser.AvatarUrl,
                    Position = createdUser.Position,
                    Contact = createdUser.Contact,
                    BrandId = createdUser.BrandId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid request" });
            }

            try
            {
                await _userService.UpdateByAdminAsync(id, dto);
                
                var updatedUser = await _userService.GetByIdAsync(id);
                
                return Ok(new UserResponse
                {
                    Id = updatedUser!.Id,
                    Username = updatedUser.UserName,
                    FullName = updatedUser.FullName,
                    Email = updatedUser.Email,
                    Phone = updatedUser.Phone,
                    Role = updatedUser.Role ?? "customer",
                    IsActive = updatedUser.IsActive,
                    CreatedAt = updatedUser.Created,
                    AvatarUrl = updatedUser.AvatarUrl,
                    Position = updatedUser.Position,
                    Contact = updatedUser.Contact,
                    BrandId = updatedUser.BrandId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existingUser = await _userService.GetByIdAsync(id);
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            await _userService.DeleteAsync(id);
            return Ok(new { message = "User deleted successfully" });
        }
    }

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = "";
        public string FullName { get; set; } = "";
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "customer";
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Position { get; set; }
        public string? Contact { get; set; }
        public Guid? BrandId { get; set; }
    }
}