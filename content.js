// content.js
// Logic để tự động ẩn thanh cuộn trên trang web và phản hồi popup

(function() {
    'use strict';

    const STYLE_ID = 'extension-hide-scrollbar-style-simple';

    // Hàm để chèn hoặc xóa các quy tắc CSS cơ bản để ẩn/hiện thanh cuộn
    function toggleScrollbarCssRule(enable) {
        let styleTag = document.getElementById(STYLE_ID);

        if (enable) {
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = STYLE_ID;
                styleTag.textContent = `
                    /* Ẩn thanh cuộn cho trình duyệt WebKit (Chrome, Safari, Edge, Opera) */
                    ::-webkit-scrollbar {
                      width: 0 !important;
                      height: 0 !important;
                      background: transparent !important;
                    }

                    /* Ẩn thanh cuộn cho Firefox */
                    html, body {
                      scrollbar-width: none !important;
                    }

                    /* Ẩn thanh cuộn cho Internet Explorer và Edge cũ */
                    html, body {
                      -ms-overflow-style: none !important;
                    }
                `;
                document.head.appendChild(styleTag);
            }
        } else {
            // Xóa thẻ style để hiển thị lại thanh cuộn
            if (styleTag) {
                styleTag.remove();
            }
        }
    }

    // Hàm để lấy trạng thái hiện tại của thanh cuộn (ẩn hay hiển thị)
    function getScrollbarStatus() {
      // Kiểm tra xem thẻ style của chúng ta có tồn tại không
      return document.getElementById(STYLE_ID) !== null;
    }

    // Áp dụng CSS khi trang tải (mặc định ẩn)
    toggleScrollbarCssRule(true);

    // Lắng nghe các message từ popup hoặc background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleScrollbar") {
        const isCurrentlyHidden = getScrollbarStatus();
        toggleScrollbarCssRule(!isCurrentlyHidden); // Chuyển đổi trạng thái
        sendResponse({isHidden: getScrollbarStatus()});
      } else if (request.action === "getScrollbarStatus") {
        sendResponse({isHidden: getScrollbarStatus()});
      }
    });

})();