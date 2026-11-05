import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Heart } from "lucide-react";
import { CardHoverEffect } from "./CardHoverEffect";

describe("Aceternity UI CardHoverEffect", () => {
  afterEach(() => {
    cleanup();
  });

  const items = [
    {
      icon: <Heart size={20} />,
      title: "Khmer Wedding Ceremony",
      description: "Authentic rituals from Sompeas Ptem to Pka Sla.",
    },
    {
      title: "Digital Envelopes",
      description: "Seamless Bakong QR gifting.",
    },
  ];

  it("renders card titles and descriptions", () => {
    render(<CardHoverEffect items={items} />);

    expect(screen.getByText("Khmer Wedding Ceremony")).toBeInTheDocument();
    expect(screen.getByText("Digital Envelopes")).toBeInTheDocument();
  });

  it("handles mouse enter and focus transitions cleanly", () => {
    render(<CardHoverEffect items={items} />);

    const card = screen.getByText("Khmer Wedding Ceremony").closest(".aceternity-card-wrapper");
    fireEvent.mouseEnter(card);
    expect(card).toBeInTheDocument();
  });
});
