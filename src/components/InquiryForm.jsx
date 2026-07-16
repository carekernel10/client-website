import { Button, Form } from "antd";
import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { renderFormItem } from "../service/RenderForm";
import { fetcher, headers, openNotification } from "../service/constant";
import axios from "axios";
import "./InquiryForm.css";

const InquiryForm = (props) => {
  const [form] = Form.useForm();
  const [dynamicData, setDynamicData] = useState({});
  const [formId, setFormId] = useState();
  const sigCanvasRefs = useRef({});
  const [formFields, setFormFields] = useState();
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const {
    organisationId,
    initialFormId,
    apiUrl,
    prefix,
    primaryColor,
    accentColor,
    fontFamily,
  } = props;
  const url = organisationId
    ? `${apiUrl}/${prefix}/forms/${initialFormId}`
    : null;
  const formSubmissionsUrl = `${apiUrl}/${prefix}/form-submissions/client-website`;
  const { data: responseData } = useSWR(url, fetcher);

  useEffect(() => {
    if (responseData) {
      setFormFields(responseData?.definition?.fields);
      setFormId(responseData?.id);
      setFormTitle(responseData?.name || "");
      setFormDescription(responseData?.description || "");
    }
  }, [responseData]);

  const onFinish = async (values) => {
    const formData = new FormData();
    let entityId;
    Object.keys(values).forEach((key) => {
      if (key !== "signature" && values[key] !== undefined) {
        const val = values[key];

        if (Array.isArray(val)) {
          val.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, val);
        }
      }
    });
    if (values.signature) {
      formData.append("signatureImage", values.signature);
    }
    const formDataObj = {};
    formData.forEach((value, key) => {
      if (formDataObj[key]) {
        if (Array.isArray(formDataObj[key])) {
          formDataObj[key].push(value);
        } else {
          formDataObj[key] = [formDataObj[key], value];
        }
      } else {
        formDataObj[key] = value;
      }
    });
    try {
      const inquiriesurl = `${apiUrl}/${prefix}/inquiries`;
      const inquiryValues = {
        ...values,
      };
      const inquiryResponse = await axios.post(inquiriesurl, inquiryValues, {
        headers,
      });
      entityId = inquiryResponse.data?.id;
    } catch (clientError) {
      console.error("Client or Inquiry creation failed:", clientError);
    }
    try {
      const allValues = {
        ...formDataObj,
        formId,
        ...(entityId && { entityId }),
        orgId: organisationId ? Number(organisationId) : null,
      };
      await axios.post(formSubmissionsUrl, allValues, { headers });
      openNotification(`Successfully Added.`);
      form.resetFields();
    } catch (error) {
      openNotification("Error submitting form!", true);
    }
  };

  const themeStyle = {
    "--ck-primary-color": primaryColor || "#3730a3",
    "--ck-accent-color": accentColor || "#f97316",
    "--ck-font-family": fontFamily || "'Inter', -apple-system, sans-serif",
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="ck-inquiry-form" style={themeStyle}>
        {formTitle && <h2 className="ck-title">{formTitle}</h2>}
        {formDescription && <p className="ck-description">{formDescription}</p>}
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {formFields?.map((field) =>
            renderFormItem(field, dynamicData, sigCanvasRefs, form),
          )}
          <div className="ck-submit-row">
            <Form.Item>
              <Button
                className="ck-submit-btn"
                type="primary"
                htmlType="submit"
              >
                Submit
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default InquiryForm;
