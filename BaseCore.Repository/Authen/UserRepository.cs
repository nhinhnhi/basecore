using MongoDB.Driver;
using BaseCore.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Repository.Authen
{
    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByIdAsync(string id);
        Task<List<User>> GetAllAsync();
        Task CreateAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(string id);
        Task<(List<User> Users, int TotalCount)> SearchAsync(string keyword, int page, int pageSize);
    }

    public class UserRepository : IUserRepository
    {
        private readonly MongoDbContext _context;

        public UserRepository(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Find(u => u.UserName == username && u.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<User> GetByIdAsync(string id)
        {
            return await _context.Users
                .Find(u => u.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users
                .Find(u => u.IsActive)
                .ToListAsync();
        }

        public async Task CreateAsync(User user)
        {
            await _context.Users.InsertOneAsync(user);
        }

        public async Task UpdateAsync(User user)
        {
            await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
        }

        public async Task DeleteAsync(string id)
        {
            await _context.Users.DeleteOneAsync(u => u.Id == id);
        }

        public async Task<(List<User> Users, int TotalCount)> SearchAsync(string keyword, int page, int pageSize)
        {
            var filterBuilder = Builders<User>.Filter;
            var filter = filterBuilder.Eq(u => u.IsActive, true);

            if (!string.IsNullOrEmpty(keyword))
            {
                var keywordLower = keyword.ToLower();
                var keywordFilter = filterBuilder.Or(
                    filterBuilder.Regex(u => u.UserName, new MongoDB.Bson.BsonRegularExpression(keyword, "i")),
                    filterBuilder.Regex(u => u.Name, new MongoDB.Bson.BsonRegularExpression(keyword, "i")),
                    filterBuilder.Regex(u => u.Email, new MongoDB.Bson.BsonRegularExpression(keyword, "i")),
                    filterBuilder.Regex(u => u.Phone, new MongoDB.Bson.BsonRegularExpression(keyword, "i"))
                );
                filter = filterBuilder.And(filter, keywordFilter);
            }

            var totalCount = (int)await _context.Users.CountDocumentsAsync(filter);

            var users = await _context.Users
                .Find(filter)
                .SortByDescending(u => u.Created)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (users, totalCount);
        }
    }
}
