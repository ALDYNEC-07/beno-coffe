"use client";

import dynamic from "next/dynamic";

const VoiceBarista = dynamic(() => import("./VoiceBarista"), { ssr: false });

export default function VoiceBaristaLoader() {
  return <VoiceBarista />;
}
