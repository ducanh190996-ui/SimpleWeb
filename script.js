// ==========================================================
// BƯỚC DUY NHẤT BẠN PHẢI SỬA TRONG CODE:
// Thay YOUR_CLIENT_ID_HERE bằng Application (client) ID
// lấy từ Microsoft Entra ID > App registrations.
// ==========================================================
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";

const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin + "/"
  },
  cache: {
    cacheLocation: "sessionStorage"
  }
};

const loginRequest = {
  scopes: ["Files.Read"]
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginBtn = document.getElementById("loginBtn");
const searchBtn = document.getElementById("searchBtn");
const keywordInput = document.getElementById("keyword");
const accountText = document.getElementById("account");
const statusText = document.getElementById("status");
const resultsDiv = document.getElementById("results");

function getAccount() {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

function updateAccountText() {
  const account = getAccount();

  if (account) {
    accountText.textContent = "Đã đăng nhập: " + account.username;
  } else {
    accountText.textContent = "Chưa đăng nhập";
  }
}

async function login() {
  if (CLIENT_ID === "YOUR_CLIENT_ID_HERE") {
    alert("Bạn chưa thay CLIENT_ID trong file script.js.");
    return;
  }

  try {
    const response = await msalInstance.loginPopup(loginRequest);
    msalInstance.setActiveAccount(response.account);
    updateAccountText();
    statusText.textContent = "Đăng nhập thành công.";
  } catch (error) {
    console.error(error);
    statusText.textContent = "Đăng nhập thất bại: " + error.message;
  }
}

async function getAccessToken() {
  let account = msalInstance.getActiveAccount() || getAccount();

  if (!account) {
    await login();
    account = msalInstance.getActiveAccount() || getAccount();
  }

  if (!account) {
    throw new Error("Chưa đăng nhập.");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: ["Files.Read"],
      account: account
    });

    return response.accessToken;
  } catch (error) {
    const response = await msalInstance.acquireTokenPopup({
      scopes: ["Files.Read"],
      account: account
    });

    return response.accessToken;
  }
}

async function searchOneDrive() {
  const keyword = keywordInput.value.trim();

  if (!keyword) {
    statusText.textContent = "Hãy nhập tên file cần tìm.";
    return;
  }

  resultsDiv.innerHTML = "";
  statusText.textContent = "Đang tìm...";

  try {
    const token = await getAccessToken();

    // Escape dấu nháy đơn cho cú pháp OData.
    const safeKeyword = keyword.replace(/'/g, "''");

    const url =
      "https://graph.microsoft.com/v1.0/me/drive/root/search(q='" +
      encodeURIComponent(safeKeyword) +
      "')?$select=name,webUrl,size,lastModifiedDateTime,file,folder";

    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Microsoft Graph trả về lỗi.");
    }

    const items = data.value || [];

    statusText.textContent = "Tìm thấy " + items.length + " kết quả.";

    if (items.length === 0) {
      resultsDiv.innerHTML = "<p>Không tìm thấy file hoặc thư mục phù hợp.</p>";
      return;
    }

    for (const item of items) {
      const div = document.createElement("div");
      div.className = "file";

      const type = item.folder ? "Folder" : "File";
      const modified = item.lastModifiedDateTime
        ? new Date(item.lastModifiedDateTime).toLocaleString()
        : "";

      div.innerHTML = `
        <a href="${item.webUrl}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(item.name)}
        </a>
        <div class="meta">${type}${modified ? " • " + modified : ""}</div>
      `;

      resultsDiv.appendChild(div);
    }
  } catch (error) {
    console.error(error);
    statusText.textContent = "Lỗi: " + error.message;
  }
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loginBtn.addEventListener("click", login);
searchBtn.addEventListener("click", searchOneDrive);

keywordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchOneDrive();
  }
});

updateAccountText();
