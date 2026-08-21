// components/HelloWorld.test.js
import { render, screen } from "@testing-library/react";
import HelloWorld from "./HelloWorld";

test("renders hello world", () => {
  render(<HelloWorld />);
  const heading = screen.getByText(/hello, world!/i);
  expect(heading).toBeInTheDocument();
});
