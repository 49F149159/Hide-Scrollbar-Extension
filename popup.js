document.addEventListener('DOMContentLoaded', function() {
  const toggleCheckbox = document.getElementById('toggleScroll');
  const statusDiv = document.getElementById('status');

  // Hàm để gửi message tới content script và cập nhật trạng thái
  function sendMessageToContentScript(action, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) {
        // Không tìm thấy tab hoạt động nào.
        updateStatus(false); // Giả định thanh cuộn hiển thị
        toggleCheckbox.checked = false;
        return;
      }

      const tabId = tabs[0].id;

      // Gửi message và xử lý phản hồi/lỗi
      chrome.tabs.sendMessage(tabId, {action: action}, function(response) {
        if (chrome.runtime.lastError) {
          // Lỗi này cho biết content script không thể tiếp cận trong tab này (ví dụ: trang Chrome nội bộ).
          // Chúng ta không hiển thị cảnh báo console.warn để giữ console sạch sẽ.
          updateStatus(false); // Giả định thanh cuộn hiển thị nếu không thể kết nối
          toggleCheckbox.checked = false;
          return; // Thoát khỏi hàm, không cần xử lý thêm cho lệnh gọi này.
        }

        // Nếu nhận được phản hồi hợp lệ, tiếp tục với callback
        if (response && typeof callback === 'function') {
          callback(response.isHidden);
        }
      });
    });
  }

  // Cập nhật giao diện popup dựa trên trạng thái hiện tại của thanh cuộn
  function updateStatus(isHidden) {
  if (isHidden) {
    statusDiv.textContent = 'Hidden';
    statusDiv.className = 'status hidden shake';
  } else {
    statusDiv.textContent = 'Visible';
    statusDiv.className = 'status visible shake';
  }

  // Xóa class shake sau 400ms để lần sau còn chạy lại
  setTimeout(() => {
    statusDiv.classList.remove('shake');
  }, 400);
}


  // Lấy trạng thái ban đầu của thanh cuộn khi popup mở
  sendMessageToContentScript("getScrollbarStatus", (isHidden) => {
    updateStatus(isHidden);
    toggleCheckbox.checked = isHidden;
  });

  // Xử lý sự kiện khi nút bật/tắt (toggle switch) thay đổi trạng thái
  toggleCheckbox.addEventListener('change', function() {
    sendMessageToContentScript("toggleScrollbar", (isHidden) => {
      updateStatus(isHidden);
    });
  });
});