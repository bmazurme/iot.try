import { useState } from "react";
import { UsbFlasher } from "./components/UsbFlasher";
import { WifiFlasher } from "./components/WifiFlasher";
import "./App.css";

type Tab = "usb" | "wifi";

function App() {
  const [tab, setTab] = useState<Tab>("usb");

  return (
    <>
      <header className="app-header">
        <h1>ESP32 Flasher</h1>
        <p>Прошивка ESP32 прямо из браузера — по USB-кабелю или по Wi-Fi</p>
      </header>

      <nav className="tabs">
        <button type="button" className={`tab ${tab === "usb" ? "tab-active" : ""}`} onClick={() => setTab("usb")}>
          По USB-кабелю
        </button>
        <button type="button" className={`tab ${tab === "wifi" ? "tab-active" : ""}`} onClick={() => setTab("wifi")}>
          По Wi-Fi (OTA)
        </button>
      </nav>

      <main className="app-main">{tab === "usb" ? <UsbFlasher /> : <WifiFlasher />}</main>
    </>
  );
}

export default App;
