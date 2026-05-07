import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EncryptedValue from "@/components/EncryptedValue";
import HealthMeter from "@/components/HealthMeter";
import FHEStatus from "@/components/FHEStatus";

// Mock fheSimulator so FHEStatus doesn't need real delays
vi.mock("@/lib/fheSimulator", () => ({
  getClusterStatus: vi.fn().mockResolvedValue({
    executors: 3,
    decryptors: 7,
    latency: "43ms",
    cluster: "encrypt-devnet-1",
  }),
}));

describe("EncryptedValue", () => {
  it("renders the block characters", () => {
    render(<EncryptedValue />);
    expect(screen.getByText("████████")).toBeInTheDocument();
  });

  it("shows tooltip on hover", async () => {
    render(<EncryptedValue />);
    await userEvent.hover(screen.getByText("████████").closest("span")!);
    expect(screen.getByText("Protected by Encrypt FHE")).toBeInTheDocument();
  });
});

describe("HealthMeter", () => {
  it("renders health factor value", () => {
    render(<HealthMeter value={1.82} />);
    expect(screen.getByText(/1\.82/)).toBeInTheDocument();
  });

  it("shows Healthy for high value", () => {
    render(<HealthMeter value={2.5} />);
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
  });

  it("shows At Risk for mid value", () => {
    // pct = ((value - 1) / 2) * 100; At Risk = pct in (30, 60] → value ~1.6–2.2
    render(<HealthMeter value={1.8} />);
    expect(screen.getByText(/At Risk/)).toBeInTheDocument();
  });

  it("shows Danger for low value", () => {
    render(<HealthMeter value={1.05} />);
    expect(screen.getByText(/Danger/)).toBeInTheDocument();
  });
});

describe("FHEStatus", () => {
  it("shows loading state initially", () => {
    render(<FHEStatus />);
    expect(screen.getByText(/Connecting to cluster/)).toBeInTheDocument();
  });

  it("renders cluster data after load", async () => {
    render(<FHEStatus />);
    await waitFor(() => {
      expect(screen.getByText("encrypt-devnet-1")).toBeInTheDocument();
      expect(screen.getByText("43ms")).toBeInTheDocument();
      expect(screen.getByText("3/3 online")).toBeInTheDocument();
      expect(screen.getByText("7/7 online")).toBeInTheDocument();
    });
  });
});
