import { useState } from "react";
import { profile } from "../../data/content";
import SectionFrame from "../layout/SectionFrame";
import NovaAvatar from "../mascot/NovaAvatar";

// MOD 07 · Open Channel. Direct links on the left (fastest for recruiters),
// a message form on the right. The form sends through Formspree if you set
// profile.formspreeId in content.js; otherwise it opens the visitor's email app.
export default function Contact() {
  return (
    <SectionFrame id="contact" title="Open channel" kicker="Hiring, collaborating, or just want to argue about the best Star Wars film? The channel is open.">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
        <div className="flex flex-col gap-6">
          <div data-perch className="px-panel flex items-center gap-4 p-4">
            <NovaAvatar />
            <div>
              <p className="hud-label flex items-center gap-2 text-[0.62rem] text-accent">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent-fill" /> Operator on standby
              </p>
              <p className="mt-1 text-sm text-muted">Usually replies within a day. {profile.status}.</p>
            </div>
          </div>

          <ChannelLink label="Email" value={profile.email} href={`mailto:${profile.email}`} copy={profile.email} />
          <ChannelLink label="LinkedIn" value="in/harshit-abhinav" href={profile.links.linkedin} external />
          <ChannelLink label="GitHub" value="github.com/abhi68402" href={profile.links.github} external />
          <ChannelLink label="Resume" value="Download PDF" href={profile.resume} download />
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
      window.dispatchEvent(new CustomEvent("nova-react", { detail: { type: "happy", text: "Copied! Now send him something nice." } }));
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked: the link still works */ }
  };
  return (
    <div className="px-panel group flex items-center gap-3 transition-transform hover:-translate-x-1">
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...(download ? { download: true } : {})}
        className="flex min-w-0 flex-1 items-baseline gap-4 px-4 py-4"
      >
        <span className="hud-label w-16 shrink-0 text-[0.62rem] sm:w-20">{label}</span>
        <span className="truncate text-base font-medium sm:text-lg transition group-hover:text-accent">{value}</span>
        <span aria-hidden="true" className="ml-auto text-muted transition group-hover:translate-x-1 group-hover:text-accent">{download ? "↓" : "↗"}</span>
      </a>
      {copy && (
        <button type="button" onClick={doCopy} className="mr-3 border-2 border-line-strong px-2 py-1 font-pixel text-xs uppercase text-muted hover:text-accent">
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      )}
    </div>
  );
}

function ContactForm() {
  const [state, setState] = useState("idle"); // idle | sending | sent | error

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    if (!profile.formspreeId) {
      // No Formspree set up: hand off to the visitor's email app instead.
      const body = `${data.message}\n\n— ${data.name} (${data.email})`;
      window.dispatchEvent(new CustomEvent("nova-react", { detail: { type: "happy", text: "Opening your email app. Woof!" } }));
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio: message from ${data.name}`)}&body=${encodeURIComponent(body)}`;
      setState("sent");
      return;
    }

    setState("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${profile.formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setState("sent");
      window.dispatchEvent(new CustomEvent("nova-react", { detail: { type: "happy", text: "Message delivered! *happy tail*" } }));
    } catch {
      setState("error");
    }
  }

  const field = "mt-1.5 w-full border-2 border-line-strong bg-bg px-3 py-2.5 text-text placeholder:text-muted/70 focus:border-accent focus:outline-none";

  return (
    <form data-perch id="contact-form" onSubmit={onSubmit} className="px-panel p-5 sm:p-6">
      <p className="hud-label mb-5 text-[0.62rem]">Transmit message</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          Name
          <input name="name" required autoComplete="name" className={field} placeholder="Ada Lovelace" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} placeholder="ada@company.com" />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        Message
        <textarea name="message" required rows={5} className={`${field} resize-y`} placeholder="We'd love to talk about a role on our team…" />
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="px-btn px-btn-primary disabled:opacity-60"
        >
          {state === "sending" ? "Transmitting…" : "Send message ↗"}
        </button>
        <p role="status" className="text-sm text-muted">
          {state === "sent" && (profile.formspreeId ? "Message received. Talk soon!" : "Opening your email app…")}
          {state === "error" && <span className="text-accent">Signal lost. Please email me directly instead.</span>}
        </p>
      </div>
    </form>
  );
}
