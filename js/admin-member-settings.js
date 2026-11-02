import { supabase } from "./supabase-client.js";
import { setMessageText } from "./admin-table.js";

const form = document.getElementById("memberSettingsForm");
const fields = document.getElementById("memberSettingsFields");
const errorMessage = document.getElementById("memberSettingsError");
const saveButton = document.getElementById("memberSettingsSave");

const FIELD_GROUPS = [
  {
    title: "Members welcome",
    fields: [
      ["hero_eyebrow", "Eyebrow", "text"],
      ["hero_title", "Welcome title", "text"],
      ["hero_image_path", "Hero image path", "text"],
      ["membership_eyebrow", "Membership eyebrow", "text"],
      ["membership_intro", "Membership introduction", "textarea"]
    ]
  },
  {
    title: "Member areas",
    fields: [
      ["community_image_path", "Community image path", "text"],
      ["community_eyebrow", "Community eyebrow", "text"],
      ["community_title", "Community title", "text"],
      ["community_description", "Community description", "textarea"],
      ["process_image_path", "In Process image path", "text"],
      ["process_eyebrow", "In Process eyebrow", "text"],
      ["process_title", "In Process title", "text"],
      ["process_description", "In Process description", "textarea"],
      ["gather_image_path", "Gather image path", "text"],
      ["gather_eyebrow", "Gather eyebrow", "text"],
      ["gather_title", "Gather title", "text"],
      ["gather_description", "Gather description", "textarea"],
      ["research_image_path", "Research image path", "text"],
      ["research_eyebrow", "Research eyebrow", "text"],
      ["research_title", "Research title", "text"],
      ["research_description", "Research description", "textarea"],
      ["bonus_image_path", "Bonus content image path", "text"],
      ["bonus_eyebrow", "Bonus content eyebrow", "text"],
      ["bonus_title", "Bonus content title", "text"],
      ["bonus_description", "Bonus content description", "textarea"],
      ["appointments_image_path", "Appointments image path", "text"],
      ["appointments_eyebrow", "Appointments eyebrow", "text"],
      ["appointments_title", "Appointments title", "text"],
      ["appointments_description", "Appointments description", "textarea"]
    ]
  },
  {
    title: "Benefits",
    fields: [["benefits", "One benefit per line; the last two lines are annual-member benefits", "textarea"]]
  }
];

function createField(name, label, type, value) {
  const wrapper = document.createElement("label");
  wrapper.className = "admin__label";
  wrapper.textContent = label;
  const input = document.createElement(type === "textarea" ? "textarea" : "input");
  input.className = "admin__file";
  input.name = name;
  if (type === "textarea") input.rows = 3;
  input.value = value;
  if (name.endsWith("_image_path")) input.placeholder = "/images/example.jpg";
  wrapper.append(input);
  return wrapper;
}

function renderFields(settings) {
  fields.replaceChildren();
  FIELD_GROUPS.forEach(group => {
    const heading = document.createElement("h3");
    heading.className = "admin__settings-heading";
    heading.textContent = group.title;
    fields.append(heading);
    group.fields.forEach(([name, label, type]) => {
      const rawValue = settings[name];
      const value = name === "benefits"
        ? (Array.isArray(rawValue) ? rawValue.join("\n") : "")
        : String(rawValue ?? "");
      fields.append(createField(name, label, type, value));
    });
  });
}

function readPayload() {
  const payload = {};
  FIELD_GROUPS.flatMap(group => group.fields).forEach(([name]) => {
    const input = fields.querySelector(`[name="${name}"]`);
    const value = input?.value.trim() ?? "";
    payload[name] = name === "benefits"
      ? value.split("\n").map(item => item.trim()).filter(Boolean)
      : value;
  });
  return payload;
}

export async function loadMemberPageSettings() {
  if (!form) return;
  setMessageText(errorMessage, "");
  const { data, error } = await supabase
    .from("member_page_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    setMessageText(errorMessage, error?.message ?? "Members page settings could not be loaded.");
    return;
  }

  renderFields(data);
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  saveButton.disabled = true;
  setMessageText(errorMessage, "");

  const { error } = await supabase
    .from("member_page_settings")
    .update({ ...readPayload(), updated_at: new Date().toISOString() })
    .eq("id", "default");

  saveButton.disabled = false;
  if (error) {
    setMessageText(errorMessage, `Members page settings could not be saved: ${error.message}`);
    return;
  }

  setMessageText(errorMessage, "Members page settings saved.");
});
