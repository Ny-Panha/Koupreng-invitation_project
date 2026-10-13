import React from "react";
import {
  CountdownTimer,
  GalleryGrid,
  RsvpContainer,
  ScheduleList,
} from "../shared";

export function HeroCoverBlock({ title, subtitle, coverImage, content }) {
  const heading =
    title || content?.invitationTitle || content?.title || "សិរីសួស្តី អាពាហ៍ពិពាហ៍";
  const sub = subtitle || content?.invitationSubtitle || content?.subtitle;
  const img = coverImage || content?.coverImage;

  return (
    <header className="relative w-full text-center py-16 px-4 text-white">
      {sub && (
        <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
          {sub}
        </p>
      )}
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 drop-shadow-md">
        {heading}
      </h1>
      {img && (
        <div className="mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
          <img src={img} alt="Hero Cover" className="w-full h-auto object-cover" />
        </div>
      )}
    </header>
  );
}

export function ScheduleBlock({ schedule, content }) {
  const list = schedule || content?.schedule || [];
  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 text-white">
        <h3 className="text-xl font-bold text-center mb-6">កម្មវិធីមង្គលការ</h3>
        <ScheduleList schedule={list} />
      </div>
    </section>
  );
}

export function GalleryBlock({ images, content }) {
  const imgList = images || content?.gallery || content?.galleryImages || [];
  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h3 className="text-xl font-bold text-center text-white mb-6">វិចិត្រសាលរូបថត</h3>
      <GalleryGrid images={imgList} />
    </section>
  );
}

export function CountdownBlock({ targetDate, content }) {
  const date = targetDate || content?.targetDate || content?.weddingDate;
  return (
    <section className="max-w-2xl mx-auto px-4 py-6">
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-amber-500/20 text-center">
        <CountdownTimer targetDate={date} />
      </div>
    </section>
  );
}

export function MapBlock({ venueName, venueAddress, mapUrl, content }) {
  const name = venueName || content?.venueName;
  const address = venueAddress || content?.venueAddress;
  const url = mapUrl || content?.googleMapUrl;

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 text-center text-white">
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10">
        {name && <h3 className="text-xl font-bold mb-2">{name}</h3>}
        {address && <p className="text-sm text-zinc-400 mb-6">{address}</p>}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg"
          >
            បើកមើលលើ Google Maps
          </a>
        )}
      </div>
    </section>
  );
}

export function BankQrBlock({ qrUrl, bankName, accountNumber, accountName, content }) {
  const qr = qrUrl || content?.qrGiftUrl;
  const bank = bankName || content?.bankName;
  const accNum = accountNumber || content?.bankAccountNumber;
  const accName = accountName || content?.bankAccountName;

  return (
    <section className="max-w-md mx-auto px-4 py-8 text-center text-white">
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-amber-500/30">
        <h3 className="text-lg font-bold mb-4">ចំណងដៃឌីជីថល (QR Code)</h3>
        {qr ? (
          <div className="mx-auto w-44 h-44 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center mb-4">
            <img src={qr} alt="Bank QR" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="mx-auto w-44 h-44 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-xs text-zinc-500 mb-4">
            QR Code
          </div>
        )}
        {accNum && (
          <p className="font-mono text-sm text-amber-300">
            {bank ? `${bank}: ` : ""}
            <span className="font-bold">{accNum}</span>
            {accName ? ` (${accName})` : ""}
          </p>
        )}
      </div>
    </section>
  );
}

export function RsvpBlock(props) {
  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10">
        <RsvpContainer {...props} />
      </div>
    </section>
  );
}
