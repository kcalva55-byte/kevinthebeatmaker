"use client";

import { Beat } from "../../data/beats";

interface BeatListProps {
  beats: Beat[];
  selectedBeatId: string;
  onSelect: (beat: Beat) => void;
}

export default function BeatList({
  beats,
  selectedBeatId,
  onSelect,
}: BeatListProps) {
  return (
    <div className="mt-10 rounded-3xl border border-blue-500/20 bg-[#0B1220] p-4">

      <h3 className="mb-4 text-xl font-bold text-blue-400">
        Beats Disponibles
      </h3>

      <div className="space-y-3">

        {beats.map((beat) => (

          <button
            key={beat.id}
            onClick={() => onSelect(beat)}
            className={`flex w-full items-center justify-between rounded-xl p-4 transition ${
              selectedBeatId === beat.id
                ? "bg-blue-600"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="text-left">
              <h4 className="font-semibold">{beat.title}</h4>

              <p className="text-sm text-gray-300">
                {beat.genre}
              </p>
            </div>

            <div className="text-right text-sm text-gray-300">
              {beat.bpm} BPM
            </div>

          </button>

        ))}

      </div>

    </div>
  );
}