import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ExpensesFeature from "./ExpensesFeature";
import { expensesApi } from "./api/expensesApi";
import { toExpensePayload } from "./hooks/useExpenses";

describe("Expenses Feature", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders expenses overview with summary totals and expense records", async () => {
        vi.spyOn(expensesApi, "listMineInvitations").mockResolvedValue([
            { id: "inv-1", name: "Wedding", status: "PUBLISHED" },
        ]);

        vi.spyOn(expensesApi, "listExpenses").mockResolvedValue([
            {
                id: 1,
                itemName: "Venue Rental",
                category: "Venue & Transport",
                estimatedCost: 2000,
                actualCost: 2000,
                status: "PAID",
                expenseDate: "2026-11-20",
                vendorName: "Grand Ballroom",
            },
            {
                id: 2,
                itemName: "Wedding Cake",
                category: "Food & Catering",
                estimatedCost: 300,
                actualCost: 350,
                status: "PENDING",
                expenseDate: "2026-11-20",
                vendorName: "Sweet Bakery",
            },
        ]);

        render(
            <BrowserRouter>
                <ExpensesFeature />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Venue Rental")).toBeInTheDocument();
            expect(screen.getByText("Wedding Cake")).toBeInTheDocument();
            expect(screen.getByText("Grand Ballroom")).toBeInTheDocument();
            expect(screen.getByText("$2,300")).toBeInTheDocument();
        });
    });

    it("opens add expense modal on add button click", async () => {
        vi.spyOn(expensesApi, "listMineInvitations").mockResolvedValue([
            { id: "inv-1", name: "Wedding", status: "PUBLISHED" },
        ]);

        vi.spyOn(expensesApi, "listExpenses").mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ExpensesFeature />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /\+ បន្ថែមចំណាយ|\+ Add Expense/i })).toBeInTheDocument();
        });

        const addBtn = screen.getByRole("button", { name: /\+ បន្ថែមចំណាយ|\+ Add Expense/i });
        fireEvent.click(addBtn);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /បោះបង់|Cancel/i })).toBeInTheDocument();
        });
    });

    it("derives totals and payment progress from installment rows", async () => {
        vi.spyOn(expensesApi, "listMineInvitations").mockResolvedValue([
            { id: "inv-1", name: "Wedding", status: "PUBLISHED" },
        ]);
        vi.spyOn(expensesApi, "listExpenses").mockResolvedValue([]);

        const { container } = render(
            <BrowserRouter>
                <ExpensesFeature />
            </BrowserRouter>
        );

        const addExpenseButton = await screen.findByRole("button", { name: /\+ បន្ថែមចំណាយ|\+ Add Expense/i });
        fireEvent.click(addExpenseButton);

        fireEvent.change(screen.getByLabelText(/ថវិកាគ្រោង|Estimated Budget/i), { target: { value: "100" } });

        const actualInput = screen.getByLabelText(/ចំណាយពិត|Actual Amount/i);
        const remainingInput = screen.getByLabelText(/នៅខ្វះ|Remaining Balance/i);
        expect(actualInput).toHaveAttribute("readonly");
        expect(actualInput).toHaveValue(0);
        expect(remainingInput).toHaveValue(100);

        fireEvent.click(screen.getByRole("button", { name: /បន្ថែមការបង់ប្រាក់|Add Payment/i }));
        fireEvent.change(container.querySelector(".exp-payment-amount"), { target: { value: "40" } });
        fireEvent.change(container.querySelector(".exp-payment-date"), { target: { value: "2026-11-20" } });

        expect(actualInput).toHaveValue(40);
        expect(remainingInput).toHaveValue(60);
        expect(container.querySelector(".exp-payment-progress-track")).toHaveAttribute("aria-valuenow", "40");
        expect(container.querySelector(".exp-payment-status").textContent).toMatch(/Partial|បង់បានខ្លះ/);
        expect(container.querySelector(".exp-payment-date")).toHaveValue("2026-11-20");

        fireEvent.change(container.querySelector(".exp-payment-amount"), { target: { value: "125" } });
        expect(actualInput).toHaveValue(125);
        expect(remainingInput).toHaveValue(-25);
        expect(screen.getByRole("alert").textContent).toMatch(/exceed|លើសពីថវិកា/);
    });

    it("persists dates and totals only valid nonnegative installment amounts", () => {
        const payload = toExpensePayload({
            name: "Catering",
            budget: "100",
            date: "2026-11-20",
            payments: [
                { desc: "Deposit", amount: "30", date: "2026-10-01" },
                { desc: "Invalid", amount: "not a number", date: "" },
                { desc: "Negative", amount: "-5", date: "" },
            ],
        });

        expect(payload.amount).toBe(30);
        expect(payload.status).toBe("PENDING");
        expect(JSON.parse(payload.notes).payments[0]).toEqual({
            desc: "Deposit",
            amount: "30",
            date: "2026-10-01",
        });
        expect(toExpensePayload({ name: "No payments", budget: "0", payments: [] }).status).toBe("PENDING");
    });
});
