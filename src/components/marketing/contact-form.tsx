"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Mesaj gönderilemedi.");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Bir hata oluştu.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
        <p className="font-semibold">Mesajınız alındı.</p>
        <p className="mt-2 leading-6">
          En kısa sürede size dönüş yapacağız. Acil bir konu varsa doğrudan e-posta da
          gönderebilirsiniz.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-10"
          onClick={() => setStatus("idle")}
        >
          Yeni mesaj gönder
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Ad Soyad
        </label>
        <Input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınız Soyadınız"
          required
          minLength={2}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-700">
          E-posta
        </label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          required
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-700">
          Mesajınız
        </label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Size nasıl yardımcı olabiliriz?"
          required
          minLength={10}
          rows={5}
        />
      </div>

      {status === "error" ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <Button type="submit" className="h-11 w-full sm:w-auto" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gönderiliyor…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Mesaj gönder
          </>
        )}
      </Button>
    </form>
  );
}
