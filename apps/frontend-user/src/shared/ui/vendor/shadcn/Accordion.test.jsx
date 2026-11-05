import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion";

describe("shadcn/ui Accordion", () => {
  it("renders closed by default in single mode", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Koupreng?</AccordionTrigger>
          <AccordionContent>A digital wedding invitation platform.</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: /what is koupreng/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/a digital wedding invitation platform/i)).toBeNull();
  });

  it("toggles open on click and sets correct ARIA attributes", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Question 1</AccordionTrigger>
          <AccordionContent>Answer 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: /question 1/i });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const content = screen.getByRole("region");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Answer 1");

    // Click again to collapse
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("supports default open value", () => {
    render(
      <Accordion type="single" defaultValue="item-2">
        <AccordionItem value="item-1">
          <AccordionTrigger>Q1</AccordionTrigger>
          <AccordionContent>A1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Q2</AccordionTrigger>
          <AccordionContent>A2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByRole("button", { name: /q1/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /q2/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("A2")).toBeInTheDocument();
  });
});
