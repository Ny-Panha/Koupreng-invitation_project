export function eventLocaleModel(form, schedule) { return { ...form, messageText: form.storyText ?? form.messageText ?? '', schedule }; }
