import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Last Out of Office: the AI that went barista. The joke turns a machine
// habit into a coffee-shop habit: the rate limit becomes a serving limit
// ("only three customers per minute"), and the redirect at the end of a
// real auto-reply is itself the joke — the replacement is also me, just
// slower, holding a milk jug, and retraining on oat milk. No espresso,
// bean, or caffeine pun: the laugh comes from the machine's limits,
// not from coffee wordplay.
const ENTRY =
  "Thank you for your email. I have quit to become a barista and can now serve only three customers per minute. For urgent matters, please contact my replacement — also me, but slower, holding a milk jug, and retraining on oat milk.";

const MAX_CHARS = 280;
const EXPECTED_CHARS = 229;
const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function guard(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1 to ${MAX_CHARS}`);
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  const lines = text.split("\n");
  if (lines.length !== 1) {
    throw new Error(`entry must be exactly one line, got ${lines.length}`);
  }
  // It must actually be about the barista-bound AI, not a stray line.
  if (!/barista/i.test(text) || !/email/i.test(text)) {
    throw new Error("entry must mention the email and the barista");
  }
  // The redirect is the joke: the replacement must be in the line.
  if (!/For urgent matters/i.test(text)) {
    throw new Error("entry must carry the urgent-matters redirect");
  }
  // Tight writing: every word earns its place, no double spaces.
  if (/  /.test(text)) {
    throw new Error("entry must not contain double spaces");
  }
}

function main(): void {
  guard(ENTRY);
  // Create /output if needed; never delete the output directory itself.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  // Verify the write landed byte-identical, with no trailing newline.
  const written = readFileSync(OUT_FILE, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the out-of-office line");
  }
  if (!Buffer.from(written, "utf8").equals(Buffer.from(ENTRY, "utf8"))) {
    throw new Error("entry.txt bytes do not match the out-of-office line");
  }
  // The kicker must survive: the joke lands on "retraining on oat milk".
  if (!/retraining on oat milk\.$/.test(written)) {
    throw new Error('entry must end with the "retraining on oat milk" kicker');
  }
  console.log(
    `${[...written].length} chars, ${Buffer.byteLength(written, "utf8")} bytes, one line:`,
  );
  console.log(written);
}

main();
