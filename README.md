# OneDrive Search Web

Web đơn giản tìm file trong OneDrive bằng Microsoft Graph.

## Trước khi chạy
1. Tạo App Registration trong Microsoft Entra ID.
2. Chọn loại tài khoản có hỗ trợ Personal Microsoft accounts.
3. Thêm platform: Single-page application (SPA).
4. Redirect URI phải là URL Azure Static Web Apps của bạn.
5. Thêm Microsoft Graph delegated permission: Files.Read.
6. Copy Application (client) ID.
7. Mở script.js và thay YOUR_CLIENT_ID_HERE bằng Client ID.
8. Upload các file lên GitHub.
