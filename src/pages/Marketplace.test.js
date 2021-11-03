import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Marketplace from "./Marketplace";

describe("Marketplace", () => {
  test("renders Marketplace page", () => {
    render(<Marketplace />);

    expect(screen.getByLabelText("Marketplace-Page")).toBeVisible();

    screen.debug();
  });
});
