// src/pages/RefundDetailsPage.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RefundDetailsPage from "./RefundDetailsPage";
import '@testing-library/jest-dom';

// 🔒 Navbar, AuthContext, CartContext gibi şeyleri mocklayalım
jest.mock("../components/Navbar", () => () => <div data-testid="mock-navbar" />);

// LocalStorage setup
beforeEach(() => {
  localStorage.setItem("access_token", "test-token");
  jest.clearAllMocks();
});

const mockRefunds = [
  {
    id: 1,
    product_title: "Test Product",
    quantity: 2,
    refund_amount: 20,
    created_at: new Date().toISOString(),
  },
];

describe("RefundDetailsPage Tests", () => {
  it("shows loading spinner", async () => {
    global.fetch = jest.fn(() =>
      new Promise(() => {}) // asla bitmeyen fetch -> loading durumu
    ) as jest.Mock;

    render(<RefundDetailsPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock;

    render(<RefundDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch refunds/i)).toBeInTheDocument();
    });
  });

  it("renders refund data", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRefunds),
    }) as jest.Mock;

    render(<RefundDetailsPage />);
    expect(await screen.findByText("Test Product")).toBeInTheDocument();
    expect(screen.getAllByText(/\$20.00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Quantity Refunded/i).length).toBeGreaterThanOrEqual(1);
  });

  it("filters refunds by search", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRefunds),
    }) as jest.Mock;

    render(<RefundDetailsPage />);
    await screen.findByText("Test Product");

    const input = screen.getByLabelText(/search by product title/i);
    fireEvent.change(input, { target: { value: "unmatch" } });

    await waitFor(() => {
      expect(screen.getByText(/no refunds match/i)).toBeInTheDocument();
    });
  });

  it("shows no results message when API returns empty list", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }) as jest.Mock;

    render(<RefundDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText(/no refunds match/i)).toBeInTheDocument();
    });
  });
});
