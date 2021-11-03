import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import System from "./System";

describe("System", () => {
  test("renders System page", () => {
    render(<System />);

    expect(screen.getByLabelText("System-Page")).toBeVisible();

    screen.debug();
  });
});
