# OneDrive Search Web - Fixed

Bản sửa lỗi `msal is not defined`.

## Cần làm trước khi upload GitHub

Mở `script.js` và thay:

```js
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
```

bằng `Application (client) ID` của App Registration trong Microsoft Entra ID.

## Azure / Entra cần có

- Platform: Single-page application (SPA)
- Redirect URI: URL Azure Static Web Apps của bạn
- Microsoft Graph delegated permission: `Files.Read`

## File

- `index.html`
- `style.css`
- `script.js`
- `README.md`
