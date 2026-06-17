using BaseCore.Common;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.DTO.UserPlatform; // Import DTO

namespace BaseCore.Services.Authen
{
    public interface IUserService
    {
        Task<User?> AuthenticateAsync(string username, string password);
        Task<User?> GetByIdAsync(Guid id);
        Task<User> CreateAsync(CreateUserDto dto); // Dùng DTO
        Task UpdateByAdminAsync(Guid id, UpdateUserDto dto); // Dùng DTO
        Task DeleteAsync(Guid id);
        Task<(List<User> Users, int TotalCount)> SearchAsync(string keyword, int page, int pageSize);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User?> AuthenticateAsync(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return null;

            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return null;

            // Xóa bỏ so sánh password thuần, bắt buộc phải dùng Hash & Salt
            if (user.Salt == null || user.Salt.Length == 0) return null;

            bool isValidPassword = TokenHelper.IsValidPassword(password, user.Salt, user.PasswordHash);
            
            return isValidPassword ? user : null;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<User> CreateAsync(CreateUserDto dto)
        {
            // 1. Kiểm tra trùng lặp Username & Email
            if (await _userRepository.IsUserNameExistsAsync(dto.UserName))
                throw new Exception("Tên đăng nhập đã tồn tại."); // Bạn có thể dùng Custom Exception

            if (!string.IsNullOrEmpty(dto.Email) && await _userRepository.IsEmailExistsAsync(dto.Email))
                throw new Exception("Email đã được sử dụng.");

            // 2. Map từ DTO sang Entity (Bạn có thể dùng AutoMapper để code ngắn hơn)
            var user = new User
            {
                UserName = dto.UserName,
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Role = dto.Role ?? "customer", // Mặc định là customer
                AvatarUrl = dto.AvatarUrl,
                Contact = dto.Contact,
                Position = dto.Position,
                BrandId = dto.BrandId,
                Created = DateTime.UtcNow,
                IsActive = true
            };

            // 3. Hash mật khẩu
            user.PasswordHash = TokenHelper.HashPassword(dto.Password, out byte[] salt);
            user.Salt = salt;

            // 4. Lưu xuống DB
            await _userRepository.AddAsync(user); // Dùng hàm có sẵn của Repository<T>
            return user;
        }

        public async Task UpdateByAdminAsync(Guid id, UpdateUserDto dto)
        {
            // 1. Tìm user trong DB trước
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) throw new Exception("Không tìm thấy người dùng.");

            // 2. Kiểm tra email nếu có thay đổi
            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
            {
                if (await _userRepository.IsEmailExistsAsync(dto.Email, id))
                    throw new Exception("Email đã được sử dụng bởi người khác.");
            }

            // 3. Cập nhật thông tin (Map data)
            if (dto.FullName != null) user.FullName = dto.FullName;
            if (dto.Email != null) user.Email = dto.Email;
            if (dto.Phone != null) user.Phone = dto.Phone;
            if (dto.Role != null) user.Role = dto.Role;
            if (dto.BrandId != null) user.BrandId = dto.BrandId;
            if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;
            
            user.Modified = DateTime.UtcNow;

            // 4. Lưu thay đổi
            await _userRepository.UpdateAsync(user);
        }

        public async Task<(List<User> Users, int TotalCount)> SearchAsync(string keyword, int page, int pageSize)
        {
            return await _userRepository.SearchAsync(keyword, page, pageSize);
        }

        public async Task DeleteAsync(Guid id)
        {
            // Có thể dùng DeleteAsync của Generic Repository thay vì viết logic riêng
            var user = await _userRepository.GetByIdAsync(id);
            if(user != null)
            {
                user.IsActive = false;
                user.Modified = DateTime.UtcNow;
                await _userRepository.DeleteAsync(user);
            } 
        }
    }
}