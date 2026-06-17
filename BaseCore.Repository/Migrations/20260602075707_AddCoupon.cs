using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddCoupon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_COUPONS_CouponId",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_COUPONS",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "ApplicableCategories",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "ApplicableProducts",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "Created",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "IsForFirstOrder",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "MinOrderAmount",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "Modified",
                table: "COUPONS");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "COUPONS");

            migrationBuilder.RenameTable(
                name: "COUPONS",
                newName: "Coupons");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Coupons",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_COUPONS_Code",
                table: "Coupons",
                newName: "IX_Coupons_Code");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Coupons",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Coupons",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Coupons",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Coupons",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Coupons",
                table: "Coupons",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "UserCoupons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CouponId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCoupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCoupons_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCoupons_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCoupons_CouponId",
                table: "UserCoupons",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCoupons_UserId",
                table: "UserCoupons",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Coupons_CouponId",
                table: "Orders",
                column: "CouponId",
                principalTable: "Coupons",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Coupons_CouponId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "UserCoupons");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Coupons",
                table: "Coupons");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Coupons");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Coupons");

            migrationBuilder.RenameTable(
                name: "Coupons",
                newName: "COUPONS");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "COUPONS",
                newName: "StartDate");

            migrationBuilder.RenameIndex(
                name: "IX_Coupons_Code",
                table: "COUPONS",
                newName: "IX_COUPONS_Code");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "COUPONS",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "COUPONS",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "ApplicableCategories",
                table: "COUPONS",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ApplicableProducts",
                table: "COUPONS",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "COUPONS",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "COUPONS",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "COUPONS",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "COUPONS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsForFirstOrder",
                table: "COUPONS",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MinOrderAmount",
                table: "COUPONS",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "Modified",
                table: "COUPONS",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ModifiedBy",
                table: "COUPONS",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_COUPONS",
                table: "COUPONS",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_COUPONS_CouponId",
                table: "Orders",
                column: "CouponId",
                principalTable: "COUPONS",
                principalColumn: "Id");
        }
    }
}
