import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeviceApps from "./DeviceApps";

describe("DeviceApps", () => {
  test("renders DeviceApps page", () => {
    render(<DeviceApps />);

    expect(screen.getByLabelText("Device-Apps-Page")).toBeVisible();

    screen.debug();
  });
});
