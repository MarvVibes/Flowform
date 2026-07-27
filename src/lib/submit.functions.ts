import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SubmitInput = z.object({
  slug: z.string().trim().min(1).max(120),
  answers: z.record(z.string(), z.unknown()),
  respondentEmail: z.string().trim().email().max(255).optional().nullable(),
});

export const submitResponse = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitInput.parse(input))
  .handler(async ({ data }) => {
    const { submitToForm } = await import("./submit.server");
    return submitToForm(data);
  });
