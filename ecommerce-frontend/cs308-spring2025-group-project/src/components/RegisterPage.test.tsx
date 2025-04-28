import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate ve useAuth
const mockNavigate = jest.fn();
const mockLogin = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe("RegisterPage", () => {
  it("renders register form", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username *")).toBeInTheDocument();
    expect(screen.getByLabelText("Password *")).toBeInTheDocument();
    expect(screen.getByLabelText("Email *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  it("allows user to type into username, password and email fields", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("Username *"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Password *"), { target: { value: "mypassword" } });
    fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "test@mail.com" } });
    expect(screen.getByLabelText("Username *")).toHaveValue("testuser");
    expect(screen.getByLabelText("Password *")).toHaveValue("mypassword");
    expect(screen.getByLabelText("Email *")).toHaveValue("test@mail.com");
  });

  it("navigates to login page when Login button is clicked", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
