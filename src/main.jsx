import { createRoot } from "react-dom/client";
import App from "./App";
import "./components/InquiryForm.css";

const rootEl = document.getElementById("carekernel-inquiry-widget");

if (rootEl) {
  const ds = rootEl.dataset;

  // Apply theme values as CSS custom properties on the widget root
  rootEl.style.setProperty("--ck-primary-color", ds.primarycolor || "#000000");
  rootEl.style.setProperty("--ck-button-background-color", ds.buttonbackgroundcolor || "#f97316");
  rootEl.style.setProperty(
    "--ck-font-family",
    ds.fontfamily || "'Inter', -apple-system, sans-serif",
  );
  rootEl.style.setProperty("--ck-input-radius", `${ds.inputradius || 8}px`);
  rootEl.style.setProperty("--ck-button-radius", `${ds.buttonradius || 999}px`);
  rootEl.style.setProperty(
    "--ck-button-text-color",
    ds.buttontextcolor || "#ffffff",
  );
  rootEl.style.setProperty(
    "--ck-checkbox-radius",
    `${ds.checkboxradius || 5}px`,
  );

  const root = createRoot(rootEl);
  root.render(
    <App
      organisationId={ds.organisationid}
      initialFormId={ds.formid}
      clientKey={ds.clientkey}
      apiUrl={ds.apiurl}
      prefix={ds.prefix}
      buttonText={ds.buttontext || "Submit"}
      notificationText={
        ds.notification || "Our team will get back to you within 24 hours."
      }
    />,
  );
}
