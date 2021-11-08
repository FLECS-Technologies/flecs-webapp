import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { appData } from "../data/MarketplaceData";
import MPList from "./MarketplaceList";

describe("Marketplace List", () => {
  test("renders marketplace list component", () => {
    render(<MPList appData={appData} />);

    screen.debug();
  });
});
