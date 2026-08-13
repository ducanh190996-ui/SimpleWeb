// ==========================================================
// THAY CLIENT ID CỦA BẠN VÀO ĐÂY
// Microsoft Entra ID > App registrations > Overview
// > Application (client) ID
// ==========================================================
const CLIENT_ID = "5427bd22-d4cd-42a4-828b-c7734def0345";

if (typeof msal === "undefined") {
  document.getElementById("status").textContent =
    "Lỗi: không tải được thư viện Microsoft MSAL.";
  throw new Error("MSAL library was not loaded.");
}

const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin + "/"
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
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
  const active = msalInstance.getActiveAccount();
  if (active) return active;

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
  if (CLIENT_ID === "YOUR_CLIENT_ID_HERE" || !CLIENT_ID.trim()) {
    alert("Hãy thay YOUR_CLIENT_ID_HERE trong script.js bằng Application (client) ID của bạn.");
    return;
  }

  statusText.textContent = "Đang mở đăng nhập Microsoft...";

  try {
    const response = await msalInstance.loginPopup(loginRequest);

    if (response.account) {
      msalInstance.setActiveAccount(response.account);
    }

    updateAccountText();
    statusText.textContent = "Đăng nhập thành công.";
  } catch (error) {
    console.error(error);
    statusText.textContent = "Đăng nhập thất bại: " + (error.message || error);
  }
}

async function getAccessToken() {
  let account = getAccount();

  if (!account) {
    await login();
    account = getAccount();
  }

  if (!account) {
    throw new Error("Chưa đăng nhập.");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: ["Files.Read"],
      account
    });

    return response.accessToken;
  } catch (silentError) {
    const response = await msalInstance.acquireTokenPopup({
      scopes: ["Files.Read"],
      account
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

    // Graph search theo tên/nội dung được OneDrive lập chỉ mục.
    // Dùng URLSearchParams để encode an toàn.
    const graphUrl = new URL(
      "https://graph.microsoft.com/v1.0/me/drive/root/search(q='" +
      keyword.replace(/'/g, "''") +
      "')"
    );

    graphUrl.searchParams.set(
      "$select",
      "name,webUrl,size,lastModifiedDateTime,file,folder"
    );

    const response = await fetch(graphUrl.toString(), {
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
      const row = document.createElement("div");
      row.className = "file";

      const link = document.createElement("a");
      link.href = item.webUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.name;

      const meta = document.createElement("div");
      meta.className = "meta";

      const type = item.folder ? "Folder" : "File";
      const modified = item.lastModifiedDateTime
        ? new Date(item.lastModifiedDateTime).toLocaleString()
        : "";

      meta.textContent = modified ? `${type} • ${modified}` : type;

      row.appendChild(link);
      row.appendChild(meta);
      resultsDiv.appendChild(row);
    }
  } catch (error) {
    console.error(error);
    statusText.textContent = "Lỗi: " + (error.message || error);
  }
}

loginBtn.addEventListener("click", login);
searchBtn.addEventListener("click", searchOneDrive);

keywordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchOneDrive();
  }
});

updateAccountText();
