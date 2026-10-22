import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import FormField from "./FormField";
afterEach(cleanup);
it("associates a persistent label and field error without losing a caller description", () => {
  render(<><p id="format">Use a name guests recognize.</p><FormField label="Host name" required error="Enter a host name."><input aria-describedby="format" /></FormField></>);
  const input = screen.getByRole("textbox", { name: "Host name" });
  expect(input).toBeRequired();
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("Use a name guests recognize. Enter a host name.");
  expect(input.labels[0].control).toBe(input);
});
it("keeps explicit control IDs and generates unique IDs for independent fields", () => {
  render(<><FormField label="Venue"><input id="chosen-venue" /></FormField><FormField label="Language" helperText="Choose the invitation language."><select><option>Khmer</option></select></FormField></>);
  expect(screen.getByLabelText("Venue")).toHaveAttribute("id", "chosen-venue");
  expect(screen.getByLabelText("Language")).not.toHaveAttribute("id", "chosen-venue");
  expect(screen.getByLabelText("Language")).toHaveAccessibleDescription("Choose the invitation language.");
});
it("names a compound action group instead of inventing an unassociated form label", () => {
  render(<FormField label="Writing action"><div><button type="button">Write invitation</button></div></FormField>);
  expect(screen.getByRole("group", { name: "Writing action" })).toContainElement(screen.getByRole("button", { name: "Write invitation" }));
  expect(document.querySelector("label")).toBeNull();
});
