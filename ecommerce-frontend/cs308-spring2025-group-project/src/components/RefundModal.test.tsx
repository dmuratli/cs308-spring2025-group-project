// src/components/RefundModal.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RefundModal from "./RefundModal";
import '@testing-library/jest-dom';

beforeAll(() => {
  window.alert = jest.fn();
});

describe("RefundModal Basic Tests", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve([
          {
            id: 1,
            product_title: "Test Product",
            refundable_quantity: 2,
            quantity: 0,
          },
        ]),
    }) as jest.Mock;
  });

  it("renders product title", async () => {
    render(
      <RefundModal
        open={true}
        onClose={mockOnClose}
        orderId={1}
        accessToken="dummy"
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("shows alert if no quantity selected", async () => {
    render(
      <RefundModal
        open={true}
        onClose={mockOnClose}
        orderId={1}
        accessToken="dummy"
        onSuccess={mockOnSuccess}
      />
    );

    const button = await screen.findByRole("button", { name: /confirm refund/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Please select at least one quantity to refund.");
    });
  });
});
