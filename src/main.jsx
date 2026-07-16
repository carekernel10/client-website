import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const container = document.getElementById("carekernel-inquiry-widget");

const {
  organisationid,
  formid,
  apiurl,
  prefix,
  primarycolor,
  accentcolor,
  fontfamily,
} = container.dataset;

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App
      organisationId={organisationid}
      initialFormId={formid}
      apiUrl={apiurl}
      prefix={prefix}
      primaryColor={primarycolor}
      accentColor={accentcolor}
      fontFamily={fontfamily}
    />
  </React.StrictMode>,
);
