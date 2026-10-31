import React from 'react';

export const ReadmeWindow: React.FC = () => {
  return (
    <div className="wbody" style={{ width: 480, maxWidth: '90vw' }}>
      <h4>▸ WHAT THIS IS</h4>
      <div style={{ marginBottom: 10 }}>
        GrindOS is a focused 140-day operating system designed to get engineers and students placement-ready
        for Tier-1 tech companies (Google, Amazon, Meta, Microsoft, Uber).
        <br />
        <br />
        3 curated problems a day. Spaced repetition blind recalls on Day 3, 7, and 21.
        Rest days protected to prevent burnout. No streak guilt. No tutorial hell.
      </div>

      <h4>▸ RULES OF THE MACHINE</h4>
      <div style={{ marginBottom: 10, lineHeight: 1.8 }}>
        <b>1. SOLVE BEFORE YOU SCROLL</b> — Never look at solutions under 25 minutes. Struggle is where neural connections form.
        <br />
        <b>2. BLIND REVIEWS BEAT RE-READING</b> — Code the solution again from scratch on interval days. If you can't code it blind, you haven't mastered it.
        <br />
        <b>3. REST IS SCHEDULED, NOT STOLEN</b> — Your brain consolidates algorithm patterns while resting. Take your weekly rest day guilt-free.
      </div>

      <h4>▸ KEYBOARD SHORTCUTS</h4>
      <div style={{ marginBottom: 10, lineHeight: 1.8, fontSize: 11 }}>
        <code>ESC</code> — Close topmost active window
        <br />
        <code>CTRL + K</code> — Open MISSIONS.EXE (Today's daily problems)
        <br />
        <code>CTRL + P</code> — Open POMODORO.EXE (Deep focus timer)
        <br />
        <code>CTRL + S</code> — Open SYLLABUS.EXE (Curriculum problem search)
      </div>

      <h4>▸ LOCAL-FIRST PRIVACY</h4>
      <div style={{ marginBottom: 10 }}>
        All progress, solve logs, placement applications, and streaks live exclusively in your browser's local
        persistence engine. Nothing ever leaves your machine without your consent.
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        VERSION 2.4 — 140-DAY PLACEMENT KERNEL (BUILD 2026.10)
      </div>
    </div>
  );
};
