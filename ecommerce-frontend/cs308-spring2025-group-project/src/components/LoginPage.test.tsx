import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate ve useAuth
const mockNavigate = jest.fn();
const mockLogin = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    search: "",
  }),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

it("renders login form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    // Sadece başlığı test etmek için:
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  
    // Form elemanları:
    expect(screen.getByLabelText("Username *")).toBeInTheDocument();
    expect(screen.getByLabelText("Password *")).toBeInTheDocument();
  
    // Butonu test etmek için:
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });
  
  
  it("allows user to type username and password", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("Username *"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Password *"), { target: { value: "mypassword" } });
    expect(screen.getByLabelText("Username *")).toHaveValue("testuser");
    expect(screen.getByLabelText("Password *")).toHaveValue("mypassword");

   
  });
  
