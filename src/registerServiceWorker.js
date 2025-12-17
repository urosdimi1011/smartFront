import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
  let updateAvailable = false;
  let refreshing = false;
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      );
    },
    registered(registration) {
      setTimeout(() => {
        registration.update();
      }, 1000 * 60 * 5);

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          registration.update();
        }
      });
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound() {
      console.log("New content is downloading.");
    },
    updated(registration) {
      // Sprečava višestruke notifikacije
      if (refreshing) return;

      // Čeka malo pre nego što prikaže notifikaciju (debounce)
      setTimeout(() => {
        if (updateAvailable && !refreshing) {
          refreshing = true;

          // Bolje UX - prikaži custom notifikaciju umesto confirm()
          showUpdateNotification(registration);
        }
      }, 1000);
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    },
  });
}

function showUpdateNotification(registration) {
  // Kreiranje custom toast notifikacije
  const notification = document.createElement("div");
  notification.className = "update-notification";
  notification.innerHTML = `
    <div class="update-content">
      <p>🎉 Nova verzija aplikacije je dostupna!</p>
      <div class="update-buttons">
        <button class="btn-update" id="btnUpdate">Ažuriraj</button>
        <button class="btn-dismiss" id="btnDismiss">Kasnije</button>
      </div>
    </div>
  `;

  // Stilizovanje
  const style = document.createElement("style");
  style.textContent = `
    .update-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 99999;
      animation: slideUp 0.3s ease-out;
      max-width: 400px;
      width: 90%;
    }
    
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
    
    .update-content p {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }
    
    .update-buttons {
      display: flex;
      gap: 10px;
    }
    
    .update-buttons button {
      flex: 1;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-update {
      background: #4CAF50;
      color: white;
    }
    
    .btn-update:hover {
      background: #45a049;
      transform: translateY(-2px);
    }
    
    .btn-dismiss {
      background: #f5f5f5;
      color: #666;
    }
    
    .btn-dismiss:hover {
      background: #e0e0e0;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(notification);

  // Event listeneri
  document.getElementById("btnUpdate").addEventListener("click", () => {
    // Aktiviraj novi service worker i reload
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  });

  document.getElementById("btnDismiss").addEventListener("click", () => {
    notification.remove();
    style.remove();

    // Ponovi notifikaciju za 30 minuta
    setTimeout(() => {
      showUpdateNotification(registration);
    }, 1000 * 60 * 30);
  });
}
