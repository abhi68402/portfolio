import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { profile } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import MarginNote from "../notebook/MarginNote";

// LOG ENTRY 07 · Radio. Direct links on the left (fastest for recruiters),
// a message form on the right. Sending folds the note into a paper plane.
// The form sends straight from the page (no email app): through Formspree if
// profile.formspreeId is set in content.js, otherwise through FormSubmit,
// which forwards it to profile.email. FormSubmit needs a one-time activation:
// the first message triggers an "Activate form" email to that inbox.
export default function Contact() {
  return (
    <SectionFrame id="contact" title="Let's talk" kicker="Hiring, collaborating, or just want to argue about the best Star Wars film? The radio is on." doodle="comet">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
        <div className="flex flex-col gap-5">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="pulse-dot h-2 w-2 rounded-full bg-blue" /> Usually replies within a day · {profile.status}
          </p>
          {/* the four links share the column's height, so its bottom meets the form's */}
          <div className="flex flex-col gap-5 lg:flex-1">
            <ChannelLink label="Email" value={profile.email} href={`mailto:${profile.email}`} copy={profile.email} />
            <ChannelLink label="LinkedIn" value="in/harshit-abhinav" href={profile.links.linkedin} external />
            <ChannelLink label="GitHub" value="github.com/abhi68402" href={profile.links.github} external />
            <ChannelLink label="Resume" value="Download PDF" href={profile.resume} download />
          </div>
        </div>

        <ContactForm />
      </div>
    </SectionFrame>
  );
}

function ChannelLink({ label, value, href, external, download, copy }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(copy);
      setCopied(true);
      window.dispatchEvent(new CustomEvent("toast", { detail: { text: "Email copied. Go make his day." } }));
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked: the link still works */ }
  };
  return (
    <div className="card lift group flex items-center gap-3 lg:flex-1">
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...(download ? { download: true } : {})}
        className="flex min-w-0 flex-1 items-baseline gap-4 px-4 py-4"
      >
        <span className="hud-label w-16 shrink-0 sm:w-20">{label}</span>
        <span className="truncate text-base font-medium transition group-hover:text-blue sm:text-lg">{value}</span>
        <span aria-hidden="true" className="ml-auto text-muted transition group-hover:translate-x-1 group-hover:text-blue">{download ? "↓" : "↗"}</span>
      </a>
      {copy && (
        <m.button
          type="button"
          onClick={doCopy}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`relative mr-3 overflow-hidden rounded-md border-2 px-2.5 py-1 text-xs font-semibold transition-colors ${copied ? "border-blue bg-blue/10 text-blue" : "border-line-strong text-muted hover:border-ink hover:text-ink"}`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={copied ? "done" : "copy"}
              aria-live="polite"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 32 }}
              className="block whitespace-nowrap"
            >
              {copied ? "Copied ✓" : "Copy"}
            </m.span>
          </AnimatePresence>
        </m.button>
      )}
    </div>
  );
}

function ContactForm() {
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [plane, setPlane] = useState(0);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const { website, ...data } = Object.fromEntries(new FormData(form));

    // Honeypot: real people never see or fill the "website" field; bots do.
    if (website) { form.reset(); setState("sent"); return; }

    const subject = `Portfolio: message from ${data.name}`;
    const endpoint = profile.formspreeId
      ? `https://formspree.io/f/${profile.formspreeId}`
      : `https://formsubmit.co/ajax/${profile.email}`;
    const payload = profile.formspreeId
      ? { ...data, _subject: subject }
      : { ...data, _subject: subject, _template: "table", _captcha: "false" };

    setState("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === "false" || json.success === false) throw new Error(json.message);
      form.reset();
      setState("sent");
      setPlane((p) => p + 1); // fold it into a paper plane and send it off
      window.dispatchEvent(new CustomEvent("toast", { detail: { icon: "✈️", text: "Message delivered! Talk soon." } }));
    } catch {
      setState("error");
    }
  }

  const field = "mt-1.5 w-full rounded-lg border-2 border-line-strong bg-paper px-3 py-2.5 text-ink placeholder:text-muted/70 focus:border-blue focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="card tape relative p-5 sm:p-6">
      <p className="font-hand text-2xl text-blue">Dear Harshit,</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Your name
          <input name="name" required autoComplete="name" className={field} placeholder="Ada Lovelace" />
        </label>
        <label className="block text-sm font-medium">
          Your email
          <input name="email" type="email" required autoComplete="email" className={field} placeholder="ada@company.com" />
        </label>
      </div>
      {/* honeypot for spam bots: hidden from people and screen readers */}
      <label aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Message
        <textarea name="message" required rows={5} className={`${field} resize-y`} placeholder="We'd love to talk about a role on our team…" />
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="btn btn-primary disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send it ✈"}
        </button>
        <p role="status" className="text-sm text-muted">
          {state === "sent" && <span className="text-blue">Sent! It's in my inbox. Talk soon.</span>}
          {state === "error" && (
            <span className="text-red">
              Couldn't send just now. Please email <a href={`mailto:${profile.email}`} className="underline">{profile.email}</a> instead.
            </span>
          )}
        </p>
      </div>
      {plane > 0 && (
        <span key={plane} aria-hidden="true" className="plane pointer-events-none absolute bottom-16 left-24 text-4xl">✈️</span>
      )}
      <MarginNote arrow="down" className="absolute -top-14 right-6 hidden sm:inline-flex">I read every one!</MarginNote>
    </form>
  );
}
