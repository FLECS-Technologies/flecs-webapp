import React from "react";
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor
} from "@testing-library/react";
import "@testing-library/jest-dom";
import AppBar from "./AppBar";

describe("AppBar", () => {
  test("renders AppBar component", () => {
    render(<AppBar />);

    expect();

    screen.debug();
  });

  test("Select user avatar", async () => {
    render(<AppBar />);

    fireEvent.click(screen.getByLabelText("account of current user"));

    await waitFor(() => screen.getByText("Profile"));

    expect(screen.getByText("Profile")).toBeVisible();
    expect(screen.getByText("My account")).toBeVisible();

    screen.debug();
  });
});
