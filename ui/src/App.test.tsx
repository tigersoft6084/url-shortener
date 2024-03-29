import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { act } from "react-dom/test-utils";

beforeEach(() => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ shortUrl: "http://localhost:5678/abcdef" }),
  } as Response);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders homepage", () => {
  render(<App />);
  const linkElement = screen.getByText(/Shorten your long URL/i);
  expect(linkElement).toBeInTheDocument();
});

test("shows error message when URL is invalid", async () => {
  render(<App />);

  const unexpectedErrorMessage = screen.queryByText(/Invalid URL!/i);
  expect(unexpectedErrorMessage).not.toBeInTheDocument();

  const input = screen.getByPlaceholderText(/Enter your long URL/i);
  const button = screen.getByRole("button", { name: /Shorten/i });

  fireEvent.change(input, { target: { value: "invalid" } });
  button.click();

  const errorMessage = await screen.findByText(/Invalid URL!/i);
  expect(errorMessage).toBeInTheDocument();
});

test("disables the Shorten button when URL is empty or invalid", async () => {
  render(<App />);

  const input = screen.getByPlaceholderText(/Enter your long URL/i);
  const button = screen.getByRole("button", { name: /Shorten/i });

  expect(button).toBeDisabled();

  fireEvent.change(input, { target: { value: "invalid" } });
  expect(button).toBeDisabled();

  fireEvent.change(input, { target: { value: "http://example.com" } });
  expect(button).toBeEnabled();
});

test("shows the shortened URL after shortening", async () => {
  render(<App />);

  const input = screen.getByPlaceholderText(/Enter your long URL/i);
  const button = screen.getByRole("button", { name: /Shorten/i });

  fireEvent.change(input, { target: { value: "http://example.com" } });
  act(() => {
    button.click();
  });

  const shortenedUrl = await screen.findByText(/Here is your short URL:/i);
  expect(shortenedUrl).toBeInTheDocument();
});

test("allows to copy the shortened URL to clipboard", async () => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(),
    },
  });

  render(<App />);

  const input = screen.getByPlaceholderText(/Enter your long URL/i);
  const button = screen.getByRole("button", { name: /Shorten/i });

  fireEvent.change(input, { target: { value: "http://example.com" } });
  act(() => {
    button.click();
  });

  const copyButton = await screen.findByRole("button", { name: /Copy/i });
  expect(copyButton).toBeInTheDocument();
  fireEvent.click(copyButton);

  const copiedMessage = await screen.findByText(/Copied!/i);
  expect(copiedMessage).toBeInTheDocument();

  const copiedUrl = (await screen.findByText(
    /http:\/\/localhost:5678\/\w{6}/i
  )) as HTMLAnchorElement;
  expect(copiedUrl).toBeInTheDocument();

  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(copiedUrl.href);
});
