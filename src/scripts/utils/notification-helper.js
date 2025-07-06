// src/scripts/utils/notification-helper.js

import { VAPID_PUBLIC_KEY, BASE_URL } from "../config";
import { getToken } from "./auth";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const sendSubscriptionToServer = async (subscription) => {
  const token = getToken();
  if (!token) {
    console.error("Token tidak tersedia untuk mengirim langganan.");
    return;
  }
  const subscriptionJson = subscription.toJSON();
  delete subscriptionJson.expirationTime;

  try {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionJson),
    });

    if (!response.ok) {
      const responseData = await response.json();
      console.error("Gagal mengirim langganan ke server:", responseData);
    } else {
      console.log("Langganan berhasil dikirim ke server.");
    }
  } catch (error) {
    console.error("Error saat mengirim langganan ke server:", error);
  }
};

const subscribePushNotification = async () => {
  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const pushSubscription =
      await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

    await sendSubscriptionToServer(pushSubscription);
    alert("Langganan push notification berhasil diaktifkan.");
  } catch (error) {
    console.error("Gagal berlangganan push notification:", error);
    alert(
      "Gagal mengaktifkan notifikasi. Pastikan Anda mengizinkan notifikasi untuk situs ini."
    );
    throw error; // Lempar error agar bisa ditangani di app.js
  }
};

const requestPermission = async () => {
  const result = await Notification.requestPermission();
  if (result === "denied") {
    alert("Anda telah memblokir izin notifikasi.");
    return false;
  }
  if (result === "default") {
    return false;
  }
  return true;
};

export const initPushNotification = async () => {
  const hasPermission = await requestPermission();
  if (hasPermission) {
    await subscribePushNotification();
  }
};

export const unsubscribePushNotification = async () => {
  try {
    const swRegistration = await navigator.serviceWorker.ready;
    const subscription = await swRegistration.pushManager.getSubscription();

    if (!subscription) {
      alert("Notifikasi belum diaktifkan.");
      return;
    }

    const token = getToken();
    await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
    alert("Langganan notifikasi push berhasil dibatalkan.");
  } catch (error) {
    console.error("Gagal berhenti berlangganan notifikasi push:", error);
    alert("Gagal berhenti berlangganan notifikasi.");
    throw error; // Lempar error agar bisa ditangani di app.js
  }
};
