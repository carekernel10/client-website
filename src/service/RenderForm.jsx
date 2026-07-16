import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Select,
  Switch,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

function generateCaptchaText(length = 5) {
  // excludes visually ambiguous chars like O/0, I/1, l
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function LetterCaptchaFormItem({ name, form }) {
  const [captchaText, setCaptchaText] = useState(() => generateCaptchaText());

  useEffect(() => {
    if (!form || typeof form.setFieldsValue !== "function") return;
    const token = btoa(captchaText);
    form.setFieldsValue({ [`${name}_token`]: token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, captchaText]);

  const handleRefresh = () => {
    const next = generateCaptchaText();
    setCaptchaText(next);
    form?.setFieldsValue?.({ [name]: "" });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        backgroundColor: "#fafafa",
        maxWidth: 360,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          userSelect: "none",
          backgroundColor: "#eef0f3",
          padding: "8px 14px",
          borderRadius: 4,
          letterSpacing: 4,
        }}
      >
        {captchaText.split("").map((char, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "monospace",
              color: `hsl(${(i * 47) % 360}, 55%, 35%)`,
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (8 + i * 3)}deg)`,
            }}
          >
            {char}
          </span>
        ))}
      </div>

      <Button size="small" onClick={handleRefresh} type="text">
        ⟳ Refresh
      </Button>

      <Form.Item
        name={name}
        noStyle
        rules={[{ required: true, message: "Please enter the code shown" }]}
      >
        <Input
          style={{ width: 140 }}
          placeholder="Enter code"
          autoComplete="off"
        />
      </Form.Item>
      <Form.Item name={`${name}_token`} noStyle>
        <Input type="hidden" />
      </Form.Item>
    </div>
  );
}

export const renderFormItem = (
  field,
  dynamicData = [],
  sigCanvasRefs,
  form,
) => {
  const {
    label,
    name,
    type,
    rules,
    placeholder,
    options,
    addonBefore,
    valueField,
    labelField,
    mappingField,
  } = field;
  const commonProps = {
    key: name,
    label,
    name: mappingField ? mappingField : name,
    rules: rules || [],
    placeholder,
  };

  switch (type) {
    case "input": {
      return (
        <Form.Item {...commonProps}>
          <Input placeholder={placeholder} addonBefore={addonBefore} />
        </Form.Item>
      );
    }
    case "select": {
      const selectOptions =
        Array.isArray(dynamicData) && dynamicData.length > 0
          ? dynamicData.map(({ id = "", fullName = "" }) => ({
              key: id || "default-key",
              value: id || "default-value",
              label: fullName || "Unnamed",
            }))
          : Array.isArray(options)
            ? options.map((opt) => ({
                key: opt || "default-key",
                value: opt || "default-value",
                label: opt || "Unnamed",
              }))
            : [];

      return (
        <Form.Item {...commonProps}>
          <Select
            placeholder={placeholder || "Please select an option"}
            options={selectOptions}
          />
        </Form.Item>
      );
    }
    case "switch":
      return (
        <Form.Item key={name} label={label} name={name} valuePropName="checked">
          <Switch />
        </Form.Item>
      );
    case "datePicker":
      const currentDateTime = dayjs().format("DD/MM/YYYY hh:mm A");
      return (
        <Form.Item
          key={name}
          label={label}
          name={name}
          rules={rules}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : null,
          })}
          getValueFromEvent={(value) => value || null}
        >
          <DatePicker
            format="DD/MM/YYYY hh:mm A"
            showTime
            use12Hours
            defaultValue={currentDateTime}
          />
        </Form.Item>
      );
    case "multiple":
      return (
        <Form.Item {...commonProps} mode="multiple">
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder={placeholder}
          >
            {options.map((opt) => (
              <Select.Option key={opt} value={opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      );
    case "checkboxGroup": {
      const checkboxOptions = Array.isArray(options)
        ? options.map((opt) => ({ label: opt, value: opt }))
        : [];

      return (
        <Form.Item {...commonProps}>
          <Checkbox.Group
            options={checkboxOptions}
            className="ck-checkbox-grid"
          />
        </Form.Item>
      );
    }
    case "captcha": {
      return (
        <Form.Item key={name} label={false} shouldUpdate>
          <LetterCaptchaFormItem name={name} form={form} />
        </Form.Item>
      );
    }
    case "textarea":
      return (
        <Form.Item {...commonProps}>
          <Input.TextArea rows={4.5} placeholder={placeholder} />
        </Form.Item>
      );
    case "hidden":
      return (
        <Form.Item
          key={name}
          name={name}
          initialValue={field.initialValue}
          hidden
        >
          <Input type="hidden" />
        </Form.Item>
      );
    case "signature": {
      if (!sigCanvasRefs.current[name]) {
        sigCanvasRefs.current[name] = { ref: null };
      }

      const handleSignatureEnd = () => {
        const canvas = sigCanvasRefs.current[name]?.ref;
        if (canvas && !canvas.isEmpty()) {
          const base64Str = canvas.toDataURL();
          form.setFieldsValue({ [name]: base64Str });
        }
      };

      const clearSignature = () => {
        const canvas = sigCanvasRefs.current[name]?.ref;
        if (canvas) {
          canvas.clear();
          form.setFieldsValue({ [name]: null });
        }
      };
      return (
        <Form.Item {...commonProps}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <SignatureCanvas
              ref={(el) => (sigCanvasRefs.current[name].ref = el)}
              canvasProps={{
                style: {
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                  width: "100%",
                  height: "250px",
                },
              }}
              onEnd={handleSignatureEnd}
            />
            <Button
              size="small"
              onClick={clearSignature}
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
              }}
            >
              Clear
            </Button>
          </div>
        </Form.Item>
      );
    }
    case "description":
      return (
        <Form.Item>
          <div className="whitespace-pre-wrap">{label}</div>
        </Form.Item>
      );

    case "line":
      return (
        <Form.Item key={name}>
          <hr className="my-2 border-gray-300" />
        </Form.Item>
      );
    case "header":
      return (
        <Form.Item key={name}>
          <div className="text-xl font-semibold ">{label}</div>
        </Form.Item>
      );

    default:
      return null;
  }
};
