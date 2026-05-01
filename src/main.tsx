import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BadgeCheck,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import "./styles.css";

type Audience = "builders" | "educators" | "operators" | "artists";
type Artifact = "live demo" | "agent workflow" | "image story" | "toolchain";

const heroImage = "/devday-workbench.png";
const contestPostUrl = "https://x.com/OpenAI/status/2049535650626785334";
const devdayUrl = "https://openai.com/index/devday-2026/";
const hashtag = "#OpenAIDevDay2026";

const audienceOptions: Audience[] = ["builders", "educators", "operators", "artists"];
const artifactOptions: Artifact[] = ["live demo", "agent workflow", "image story", "toolchain"];

const verbs = ["trace", "compose", "pressure-test", "ship", "translate", "prototype"];
const nouns = ["signal", "brief", "workflow", "scene", "loop", "launch"];
const riskLabels = ["grounded", "sharp", "weird", "moonshot"];
const stopWords = new Set(["a", "an", "ai", "and", "by", "for", "from", "in", "of", "on", "the", "to", "with"]);

function normalizeIdea(value: string) {
  return value.trim().replace(/\s+/g, " ") || "a pocket copilot for first-time founders";
}

function seedFrom(value: string) {
  return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function projectNameFrom(idea: string) {
  const words = idea
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(" ")
    .filter((word) => word && !stopWords.has(word));
  const useful = words.length >= 2 ? words.slice(-3) : words;

  return useful.length ? titleCase(useful.join(" ")) : "New Prototype";
}

function buildPassport(ideaInput: string, audience: Audience, artifact: Artifact, risk: number) {
  const idea = normalizeIdea(ideaInput);
  const seed = seedFrom(`${idea}-${audience}-${artifact}-${risk}`);
  const verb = pick(verbs, seed);
  const noun = pick(nouns, seed, risk);
  const riskName = riskLabels[Math.min(riskLabels.length - 1, Math.floor(risk / 26))];
  const title = `${projectNameFrom(idea)} ${titleCase(noun)}`;
  const hook = `Turn ${idea} into a ${riskName} ${artifact} that lets ${audience} ${verb} the hard part in under two minutes.`;
  const stages = [
    `Open with a real constraint: what breaks today when ${audience} try to use ${idea}?`,
    `Let GPT-5.5 ${verb} the next move, then expose the reasoning checkpoint before the action runs.`,
    `Use Image Gen to make the result visible: one before-state, one transformed-state, one shareable proof.`,
  ];
  const imagePrompt = `Editorial product image for ${idea}: ${audience} using a ${artifact}, ${riskName} but practical, clean desk lighting, no logos, no readable text.`;
  const reply = `Built Signal Atlas with GPT-5.5 + Image Gen: a live DevDay passport maker that turns rough AI ideas into demo arcs, image prompts, and a share-ready poster. ${hashtag}`;

  return { artifact, audience, hook, imagePrompt, noun, reply, riskName, stages, title, verb };
}

function App() {
  const [idea, setIdea] = useState("an AI planning desk for indie climate teams");
  const [audience, setAudience] = useState<Audience>("builders");
  const [artifact, setArtifact] = useState<Artifact>("agent workflow");
  const [risk, setRisk] = useState(58);
  const [copied, setCopied] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement | null>(null);

  const passport = useMemo(() => buildPassport(idea, audience, artifact, risk), [idea, audience, artifact, risk]);
  const liveUrl = typeof window === "undefined" ? "https://signal-atlas.vercel.app" : window.location.href;
  const replyText = `${passport.reply}\n\n${liveUrl}`;

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied("copy failed");
      window.setTimeout(() => setCopied(null), 1400);
    }
  }

  function randomize() {
    const samples = [
      "a field notebook for emergency room nurses",
      "a visual pitch coach for student founders",
      "a compliance debugger for tiny fintech teams",
      "a recipe translator for families with food allergies",
      "a repair guide for community bike workshops",
    ];
    const next = pick(samples, seedFrom(idea) + risk + 7);
    setIdea(next);
    setAudience(pick(audienceOptions, seedFrom(next), 2));
    setArtifact(pick(artifactOptions, seedFrom(next), 4));
    setRisk((seedFrom(next) * 3) % 101);
  }

  async function downloadPoster() {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = heroImage;
    await img.decode();

    ctx.fillStyle = "#10100e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, -260, 0, 1920, 1080);
    const gradient = ctx.createLinearGradient(0, 0, 0, 1050);
    gradient.addColorStop(0, "rgba(16, 16, 14, 0.1)");
    gradient.addColorStop(0.55, "rgba(16, 16, 14, 0.55)");
    gradient.addColorStop(1, "#10100e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 1100);

    ctx.fillStyle = "#f8f1df";
    ctx.font = "700 112px Inter, Arial, sans-serif";
    wrapText(ctx, passport.title, 96, 1030, 1120, 122);

    ctx.fillStyle = "#d3c7ad";
    ctx.font = "500 42px Inter, Arial, sans-serif";
    wrapText(ctx, passport.hook, 96, 1295, 1140, 58);

    ctx.strokeStyle = "rgba(248, 241, 223, 0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 1450);
    ctx.lineTo(1304, 1450);
    ctx.stroke();

    ctx.fillStyle = "#f06a3b";
    ctx.font = "700 36px Inter, Arial, sans-serif";
    ctx.fillText("GPT-5.5 + Image Gen", 96, 1535);
    ctx.fillStyle = "#f8f1df";
    ctx.font = "600 34px Inter, Arial, sans-serif";
    ctx.fillText(`${passport.audience} / ${passport.artifact} / ${passport.riskName}`, 96, 1600);
    ctx.fillStyle = "#d3c7ad";
    ctx.font = "500 28px Inter, Arial, sans-serif";
    ctx.fillText(`${hashtag}  |  ${new URL(liveUrl).host}`, 96, 1690);

    const link = document.createElement("a");
    link.download = "signal-atlas-devday-poster.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main>
      <section className="hero" aria-label="Signal Atlas workspace">
        <img className="heroImage" src={heroImage} alt="Generated developer workbench for Signal Atlas" />
        <div className="heroShade" />
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#studio" aria-label="Signal Atlas studio">
            <Sparkles size={18} aria-hidden="true" />
            <span>Signal Atlas</span>
          </a>
          <div className="navLinks">
            <a href={devdayUrl} target="_blank" rel="noreferrer">
              DevDay <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={contestPostUrl} target="_blank" rel="noreferrer">
              Contest post <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </nav>

        <div className="heroGrid" id="studio">
          <div className="intro">
            <p className="eyebrow">Built with GPT-5.5 + Image Gen</p>
            <h1>Signal Atlas</h1>
            <p className="lede">
              Shape a rough AI idea into a DevDay-ready demo arc, image prompt, poster, and contest reply.
            </p>
            <div className="heroActions">
              <a href="#composer" className="primaryAction">
                Open composer <ArrowRight size={18} aria-hidden="true" />
              </a>
              <button type="button" className="ghostAction" onClick={() => copyText("reply copied", replyText)}>
                <Share2 size={17} aria-hidden="true" />
                Copy reply
              </button>
            </div>
          </div>

          <section className="studioPanel" id="composer" aria-label="Idea composer">
            <div className="panelTop">
              <span>Launch passport</span>
              <button type="button" className="iconButton" onClick={randomize} aria-label="Randomize idea">
                <RefreshCw size={17} aria-hidden="true" />
              </button>
            </div>

            <label className="fieldLabel" htmlFor="idea">
              Raw idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              rows={3}
              spellCheck="true"
            />

            <div className="controlGroup" role="group" aria-label="Audience">
              {audienceOptions.map((option) => (
                <button
                  type="button"
                  className={option === audience ? "segButton active" : "segButton"}
                  onClick={() => setAudience(option)}
                  key={option}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="selectRow">
              <label>
                Artifact
                <select value={artifact} onChange={(event) => setArtifact(event.target.value as Artifact)}>
                  {artifactOptions.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Signal
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={risk}
                  onChange={(event) => setRisk(Number(event.target.value))}
                />
              </label>
            </div>

            <div className="outputCard" ref={posterRef}>
              <div className="outputMeta">
                <span>{passport.riskName}</span>
                <span>{passport.artifact}</span>
              </div>
              <h2>{passport.title}</h2>
              <p>{passport.hook}</p>
            </div>
          </section>
        </div>
      </section>

      <section className="briefSection" aria-label="Generated demo brief">
        <div className="sectionHeading">
          <p className="eyebrow">Generated brief</p>
          <h2>One idea, one demo, one proof.</h2>
        </div>

        <div className="briefLayout">
          <div className="demoArc">
            <div className="moduleHeader">
              <BadgeCheck size={18} aria-hidden="true" />
              <span>Demo arc</span>
            </div>
            <ol>
              {passport.stages.map((stage) => (
                <li key={stage}>{stage}</li>
              ))}
            </ol>
          </div>

          <div className="promptBlock">
            <div className="moduleHeader">
              <ImageIcon size={18} aria-hidden="true" />
              <span>Image Gen prompt</span>
            </div>
            <p>{passport.imagePrompt}</p>
            <button type="button" className="inlineButton" onClick={() => copyText("prompt copied", passport.imagePrompt)}>
              <Copy size={16} aria-hidden="true" />
              Copy prompt
            </button>
          </div>
        </div>
      </section>

      <section className="shareSection" aria-label="Share and export">
        <div className="posterPreview">
          <img src={heroImage} alt="" aria-hidden="true" />
          <div>
            <p>{passport.riskName} / {passport.audience}</p>
            <h2>{passport.title}</h2>
            <span>{hashtag}</span>
          </div>
        </div>

        <div className="shareCopy">
          <p className="eyebrow">Share block</p>
          <h2>Submission-ready output.</h2>
          <p className="replyText">{replyText}</p>
          <div className="shareActions">
            <button type="button" className="primaryAction dark" onClick={() => copyText("reply copied", replyText)}>
              <Share2 size={18} aria-hidden="true" />
              Copy reply
            </button>
            <button type="button" className="ghostAction dark" onClick={downloadPoster}>
              <Download size={18} aria-hidden="true" />
              Download poster
            </button>
          </div>
          <p className="statusLine" role="status" aria-live="polite">
            {copied ? copied : "Ready for the DevDay thread."}
          </p>
        </div>
      </section>

      <footer>
        <span>Signal Atlas is a fan-built DevDay 2026 ticket submission.</span>
        <span>Image asset generated with Image Gen; interface and copy built with GPT-5.5.</span>
      </footer>
    </main>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  });

  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
