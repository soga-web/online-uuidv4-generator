const uuidOutput = document.querySelector("#uuid-output");
const statusMessage = document.querySelector("#status-message");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");

let currentUuid = "";
let copyResetTimerId;

function generateUuidV4() {
  if (!window.crypto?.getRandomValues) {
    throw new Error("Web Crypto API is not available.");
  }

  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join("")
  ].join("-");
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function resetCopyButtonState() {
  copyButton.textContent = "コピー";
  copyButton.classList.remove("is-copied");
}

function showCopiedState() {
  window.clearTimeout(copyResetTimerId);
  copyButton.textContent = "Copied";
  copyButton.classList.add("is-copied");
  copyResetTimerId = window.setTimeout(() => {
    resetCopyButtonState();
  }, 1800);
}

function updateCurrentUuid(uuid) {
  currentUuid = uuid;
  uuidOutput.textContent = uuid;
  copyButton.disabled = false;
  resetCopyButtonState();
}

function legacyCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.append(textArea);
  textArea.select();
  textArea.setSelectionRange(0, text.length);

  const copied = document.execCommand("copy");
  textArea.remove();
  return copied;
}

async function copyUuid(uuid) {
  if (!uuid) {
    setStatus("先に UUID を生成してください。");
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(uuid);
    } else if (!legacyCopyText(uuid)) {
      throw new Error("Legacy copy failed.");
    }

    setStatus("");
    showCopiedState();
  } catch (error) {
    if (legacyCopyText(uuid)) {
      setStatus("");
      showCopiedState();
      return;
    }

    setStatus("コピーに失敗しました。HTTPS または localhost で開いてください。");
  }
}

function createAndDisplayUuid() {
  try {
    const uuid = generateUuidV4();
    updateCurrentUuid(uuid);
    setStatus("");
  } catch (error) {
    uuidOutput.textContent = "このブラウザは UUID 生成に必要な API をサポートしていません";
    copyButton.disabled = true;
    setStatus("このブラウザ環境では利用できません。");
  }
}

generateButton.addEventListener("click", () => {
  createAndDisplayUuid();
});

copyButton.addEventListener("click", async () => {
  await copyUuid(currentUuid);
});

copyButton.disabled = true;
createAndDisplayUuid();
