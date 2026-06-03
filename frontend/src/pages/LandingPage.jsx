import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getProfilePhotoUrl, handleProfileImageError } from '../utils/image';
import { 
  MapPin, Search, BookOpen, ClipboardCheck, Sparkles, HeartHandshake, 
  ShieldCheck, Navigation, Loader2, Compass, Phone, Mail, Instagram, 
  Linkedin, GraduationCap, Book, FileText, Pencil, PenTool, Lightbulb, 
  Briefcase, Globe, Calculator, TrendingUp, ArrowRightLeft, CheckCircle2
} from 'lucide-react';

// Rural Indian Banyan Tree Classroom Visual (Warm, emotional, startup-quality premium vector illustration representing hyperlocal MERN education)
const RuralClassroomVisual = () => {
  return (
    <div className="relative w-full aspect-[4/3] max-w-[560px] min-h-[440px] flex flex-col justify-center items-center overflow-visible select-none z-10">
      
      {styleBlock}

      {/* Atmospheric ambient lighting & soft sunbeams */}
      <div className="absolute top-[-10%] left-[-10%] w-80 h-80 rounded-full bg-amber-100/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-100/10 blur-[90px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="sunbeam-fade absolute top-0 left-[20%] w-[130px] h-[500px] bg-gradient-to-b from-amber-400/8 via-amber-300/2 to-transparent -rotate-[25deg] origin-top" />
        <div className="sunbeam-fade absolute top-0 left-[48%] w-[90px] h-[500px] bg-gradient-to-b from-amber-400/6 via-amber-300/1 to-transparent -rotate-[25deg] origin-top" style={{ animationDelay: '-3.5s' }} />
      </div>

      {/* Floating Amber Sparks / Dust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${12 + Math.random() * 76}%`,
              bottom: `${8 + Math.random() * 25}%`,
              width: `${2.2 + Math.random() * 2.8}px`,
              height: `${2.2 + Math.random() * 2.8}px`,
              animationDuration: `${7 + Math.random() * 7}s`,
              animationDelay: `${i * 1.3}s`
            }}
          />
        ))}
      </div>

      {/* Centerpiece Vector Illustration Canvas */}
      <div className="relative w-full flex items-center justify-center py-2 z-20">
        <svg 
          viewBox="0 0 500 370" 
          className="w-full h-full max-h-[380px] overflow-visible drop-shadow-[0_15px_35px_rgba(139,92,26,0.08)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS, FILTERS & GRADIENTS */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#ffedd5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5c3f2b" />
              <stop offset="40%" stopColor="#7a5439" />
              <stop offset="80%" stopColor="#664630" />
              <stop offset="100%" stopColor="#452f20" />
            </linearGradient>
            <radialGradient id="soilGrad" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
              <stop offset="0%" stopColor="#f4eae1" />
              <stop offset="50%" stopColor="#e2d4c5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="leafGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="leafGradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
            <linearGradient id="sunRay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="25%" cy="20%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#fef08a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="skyMaskGrad" cx="50%" cy="100%" r="90%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            
            {/* High-end vector shadow filters for realistic depth */}
            <filter id="element-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#7c2d12" floodOpacity="0.08" />
            </filter>
            <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <mask id="edgeFadeMask">
              <rect x="0" y="0" width="500" height="370" fill="url(#skyMaskGrad)" />
            </mask>
          </defs>

          {/* SEAMLESS FADED BACKGROUND GROUP (Layer 5, Layer 4, Layer 3 - Smoothly fades at top, left, right) */}
          <g mask="url(#edgeFadeMask)">
            {/* Sky */}
            <rect x="0" y="0" width="500" height="370" fill="url(#skyGrad)" />
            
            {/* Distant soft mountain profiles */}
            <path d="M 0,260 Q 60,242 120,250 T 260,253 T 380,246 T 500,260 L 500,320 L 0,320 Z" fill="#ebded2" opacity="0.35" />
            <path d="M 0,270 Q 80,255 160,262 T 320,260 T 500,272 L 500,320 L 0,320 Z" fill="#e5d5c6" opacity="0.45" />

            {/* Green fields (subtle and organic rolling hills) */}
            <path d="M 0,262 Q 50,254 100,260 T 200,258 L 200,300 L 0,300 Z" fill="#d1e7dd" opacity="0.45" />
            <path d="M 280,256 Q 350,252 410,258 T 500,255 L 500,300 L 280,300 Z" fill="#d8ecd0" opacity="0.6" />

            {/* Winding dirt pathway connecting homes */}
            <path d="M 45,252 Q 68,258 85,268 T 110,282 T 130,296" stroke="#e5d4c0" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
            
            {/* Children walking silhouette with books */}
            <g opacity="0.6">
              {/* Child 1 */}
              <circle cx="82" cy="261" r="1.5" fill="#475569" />
              <path d="M 82,262.5 L 82,266 M 82,264 L 80.5,265 M 82,264 L 83.5,265 M 81.2,268.5 L 82,266 L 82.8,268.5" stroke="#475569" strokeWidth="0.6" strokeLinecap="round" />
              {/* Tiny orange book */}
              <rect x="83" y="262.5" width="1.6" height="2" fill="#f97316" rx="0.2" />

              {/* Child 2 */}
              <circle cx="92" cy="268" r="1.3" fill="#475569" />
              <path d="M 92,269.3 L 92,272.5 M 92,270.5 L 90.7,271.5 M 92,270.5 L 93.3,271.5 M 91.3,275 L 92,272.5 L 92.7,275" stroke="#475569" strokeWidth="0.6" strokeLinecap="round" />
              {/* Tiny blue book */}
              <rect x="93" y="269.5" width="1.4" height="1.8" fill="#3b82f6" rx="0.2" />
            </g>

            {/* School building silhouette in the distance */}
            <g opacity="0.35">
              <rect x="420" y="234" width="28" height="15" fill="#94a3b8" rx="0.8" />
              <rect x="430" y="228" width="8" height="21" fill="#64748b" rx="0.8" />
              <rect x="432" y="241" width="4" height="8" fill="#475569" />
              <line x1="434" y1="228" x2="434" y2="218" stroke="#475569" strokeWidth="0.5" />
              {/* Tricolor fluttering flag */}
              <rect x="434" y="218" width="5" height="1.1" fill="#ff9933" />
              <rect x="434" y="219.1" width="5" height="1.1" fill="#ffffff" />
              <rect x="434" y="220.2" width="5" height="1.1" fill="#138808" />
            </g>

            {/* Small village houses in the background */}
            <g opacity="0.4">
              {/* Hut 1 */}
              <rect x="30" y="240" width="15" height="11" fill="#d4a373" rx="0.8" />
              <polygon points="27,240 37.5,232 48,240" fill="#c08552" />
              <rect x="36" y="245" width="3.5" height="6" fill="#78350f" />
              
              {/* Hut 2 */}
              <rect x="52" y="243" width="13" height="8" fill="#e3d5ca" rx="0.8" />
              <polygon points="50,243 58.5,236 67,243" fill="#b07d62" />
              <rect x="57" y="247" width="3" height="4" fill="#5c3a21" />
            </g>
          </g>

          {/* GENTLE SUNLIGHT RAYS THROUGH LEAVES (Smoothly masked at borders) */}
          <g mask="url(#edgeFadeMask)" style={{ mixBlendMode: 'screen' }}>
            <polygon points="110,0 200,0 270,360 160,360" fill="url(#sunRay)" className="sunray-pulse" />
            <polygon points="210,0 280,0 360,360 270,360" fill="url(#sunRay)" className="sunray-pulse" style={{ animationDelay: '-3s' }} />
          </g>

          {/* FLOATING SOIL BASE & SOFT BLURRED GROUND SHADOWS */}
          {/* Main soil base */}
          <ellipse cx="250" cy="312" rx="230" ry="40" fill="url(#soilGrad)" />
          <ellipse cx="250" cy="318" rx="180" ry="24" fill="#d9c4af" opacity="0.3" />

          {/* Soft Ground Shadows for elements to sit naturally (anti-sticker effect) */}
          {/* Rug shadow */}
          <polygon points="93,308 407,308 427,334 73,334" fill="#1e1b18" opacity="0.1" filter="url(#softBlur)" />
          {/* Tree trunk shadow */}
          <ellipse cx="248" cy="314" rx="65" ry="8" fill="#3a2517" opacity="0.45" filter="url(#softBlur)" />
          {/* Teacher shadow */}
          <ellipse cx="215" cy="301" rx="20" ry="4" fill="#3a2517" opacity="0.3" filter="url(#softBlur)" />
          {/* Clay water pot shadow */}
          <ellipse cx="350" cy="315" rx="10" ry="2.5" fill="#3a2517" opacity="0.2" filter="url(#softBlur)" />

          {/* BANYAN TREE ROOT SYSTEM & AERIAL ROOTS IN BACKGROUND (Layer 2: Tree) */}
          <g stroke="#8c6446" strokeWidth="1" strokeLinecap="round" opacity="0.45">
            <line x1="160" y1="130" x2="160" y2="280" />
            <line x1="340" y1="130" x2="340" y2="280" />
            <path d="M 185,140 Q 180,210 178,285" strokeWidth="0.8" />
            <path d="M 320,140 Q 325,210 327,285" strokeWidth="0.8" />
          </g>

          {/* Hanging swing from a left branch */}
          <g className="gentle-swing">
            {/* Ropes */}
            <line x1="164" y1="134" x2="164" y2="225" stroke="#6b4423" strokeWidth="0.8" opacity="0.75" />
            <line x1="182" y1="134" x2="182" y2="225" stroke="#6b4423" strokeWidth="0.8" opacity="0.75" />
            {/* Vines wrapped around ropes */}
            <path d="M 164,134 Q 166,155 164,175 T 164,225" fill="none" stroke="#22c55e" strokeWidth="0.6" opacity="0.4" />
            <path d="M 182,134 Q 180,155 182,185 T 182,225" fill="none" stroke="#22c55e" strokeWidth="0.6" opacity="0.4" />
            {/* Wooden seat */}
            <rect x="156" y="225" width="34" height="2.5" rx="0.5" fill="#a76a42" opacity="0.85" filter="url(#element-shadow)" />
          </g>

          {/* Banyan Tree Main Trunk and strong branches */}
          <path d="M 215,315 C 215,272 195,225 185,185 C 175,145 200,115 220,115 C 235,115 240,130 245,145 C 250,130 255,115 270,115 C 290,115 315,145 305,185 C 295,225 275,272 275,315 Z" fill="url(#trunkGrad)" filter="url(#element-shadow)" />
          
          {/* Main aerial roots foreground */}
          <path d="M 218,315 Q 232,305 236,260 T 237,185" stroke="#4a3322" strokeWidth="2.5" fill="none" opacity="0.75" />
          <path d="M 272,315 Q 258,305 254,260 T 253,185" stroke="#4a3322" strokeWidth="2.5" fill="none" opacity="0.75" />
          <path d="M 185,185 Q 165,240 162,295" stroke="#7a5439" strokeWidth="1.8" fill="none" opacity="0.7" />
          <path d="M 305,185 Q 325,240 328,295" stroke="#7a5439" strokeWidth="1.8" fill="none" opacity="0.7" />

          {/* BANYAN LUSH LEAF CANOPY - 3 DEPTH LAYERS WITH DYNAMIC ROTATION SWAYS */}
          {/* Foliage Layer 1: Dark Back */}
          <g className="foliage-back">
            <ellipse cx="140" cy="100" rx="55" ry="34" fill="#166534" opacity="0.85" />
            <ellipse cx="360" cy="100" rx="55" ry="34" fill="#166534" opacity="0.85" />
            <ellipse cx="250" cy="75" rx="80" ry="46" fill="#14532d" opacity="0.9" />
            <circle cx="180" cy="85" r="42" fill="#166534" opacity="0.85" />
            <circle cx="320" cy="85" r="42" fill="#166534" opacity="0.85" />
          </g>

          {/* Foliage Layer 2: Medium/Dark Mid */}
          <g className="foliage-mid" filter="url(#element-shadow)">
            <path d="M 90,115 C 90,90 120,70 145,85 C 160,75 190,80 200,105 C 215,95 240,100 245,120 C 220,135 190,130 175,125 C 160,135 130,135 110,125 Z" fill="url(#leafGradDark)" />
            <path d="M 410,115 C 410,90 380,70 355,85 C 340,75 310,80 300,105 C 285,95 260,100 255,120 C 280,135 310,130 325,125 C 340,135 370,135 390,125 Z" fill="url(#leafGradDark)" />
            <ellipse cx="250" cy="95" rx="70" ry="38" fill="url(#leafGradDark)" />
            <circle cx="155" cy="105" r="32" fill="url(#leafGradDark)" />
            <circle cx="345" cy="105" r="32" fill="url(#leafGradDark)" />
          </g>

          {/* Foliage Layer 3: Light Front (Sunlight highlights) */}
          <g className="foliage-front">
            <path d="M 110,125 C 120,110 140,105 155,115 C 170,105 185,110 190,125 C 180,135 160,135 145,130 C 135,138 120,135 110,125 Z" fill="url(#leafGradLight)" filter="url(#element-shadow)" />
            <path d="M 390,125 C 380,110 360,105 345,115 C 330,105 315,110 310,125 C 320,135 340,135 355,130 C 365,138 380,135 390,125 Z" fill="url(#leafGradLight)" filter="url(#element-shadow)" />
            <circle cx="215" cy="110" r="28" fill="url(#leafGradLight)" filter="url(#element-shadow)" />
            <circle cx="285" cy="110" r="28" fill="url(#leafGradLight)" filter="url(#element-shadow)" />
            <ellipse cx="250" cy="105" rx="55" ry="32" fill="url(#leafGradLight)" filter="url(#element-shadow)" />
            
            {/* Realistic bright sunlight leaf clusters */}
            <path d="M 230,85 C 240,75 260,75 270,85 C 265,95 235,95 230,85 Z" fill="#bef264" opacity="0.85" />
            <path d="M 160,95 C 170,88 185,88 190,95 C 185,102 165,102 160,95 Z" fill="#bef264" opacity="0.85" />
            <path d="M 340,95 C 330,88 315,88 310,95 C 315,102 335,102 340,95 Z" fill="#bef264" opacity="0.85" />
          </g>

          {/* VOLUMETRIC SUN GLOW OVERLAY (Blends tree organically into sky landscape) */}
          <ellipse cx="220" cy="115" rx="190" ry="110" fill="url(#sunGlow)" style={{ mixBlendMode: 'screen', pointerEvents: 'none' }} />

          {/* FALLING LEAVES (Dynamic organic flutter paths) */}
          <path className="falling-leaf leaf-1" d="M 0,0 C 2,-2 6,-2 8,0 C 6,2 2,2 0,0 Z" />
          <path className="falling-leaf leaf-2" d="M 0,0 C 2,-2 6,-2 8,0 C 6,2 2,2 0,0 Z" />
          <path className="falling-leaf leaf-3" d="M 0,0 C 2,-2 6,-2 8,0 C 6,2 2,2 0,0 Z" />
          <path className="falling-leaf leaf-4" d="M 0,0 C 2,-2 6,-2 8,0 C 6,2 2,2 0,0 Z" />

          {/* TRADITIONAL DURRIE CLASSROOM RUG (Layer 1: Classroom & Students) */}
          <polygon points="105,305 395,305 418,332 82,332" fill="#ea580c" opacity="0.95" filter="url(#element-shadow)" />
          <polygon points="120,305 380,305 400,332 100,332" fill="#f59e0b" opacity="0.5" />
          {/* Delicate Rug tassels */}
          <path d="M 80,332 L 84,332 M 87,332 L 91,332 M 95,332 L 99,332 M 399,332 L 403,332 M 407,332 L 411,332 M 415,332 L 419,332" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />

          {/* THE TEACHER - INSPIRING LOCAL GURU */}
          <g className="student-breath" style={{ transformOrigin: '215px 290px' }}>
            {/* Kurta & Saffron seat silhouette */}
            <path d="M 195,296 C 195,270 205,255 218,255 C 230,255 235,270 235,296 Z" fill="#f97316" />
            
            {/* Elegant cream Shawl draped */}
            <path d="M 200,265 C 205,258 215,258 220,268 C 220,275 210,285 205,292" stroke="#fef3c7" strokeWidth="2.8" fill="none" />
            
            {/* Head and profile */}
            <circle cx="216" cy="242" r="9" fill="#fdba74" />
            
            {/* Hair and white premium beard outline */}
            <path d="M 209,237 C 212,233 220,233 223,237 C 225,241 223,245 221,247 C 219,249 214,249 211,247" fill="#f8fafc" />
            
            {/* Arm (Gesturing naturally while pointing towards slate/teaching) */}
            <g className="teacher-arm">
              <path d="M 226,263 Q 242,258 248,250" stroke="#fdba74" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <circle cx="248" cy="250" r="2" fill="#fdba74" />
            </g>
            {/* Leg boundaries */}
            <ellipse cx="215" cy="298" rx="21" ry="6.5" fill="#ea580c" />
          </g>

          {/* CLASSROOM ENVIRONMENT - NO TINY TEXT CHALKBOARD */}
          <g opacity="0.95" filter="url(#element-shadow)">
            {/* Easel Stand */}
            <line x1="135" y1="230" x2="130" y2="310" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="165" y1="230" x2="170" y2="310" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="150" y1="225" x2="150" y2="310" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            
            {/* Chalkboard Frame & Surface */}
            <rect x="122" y="232" width="56" height="42" rx="4" fill="#5c3a21" />
            <rect x="126" y="236" width="48" height="34" rx="2" fill="#14532d" />
            
            {/* Beautiful visual sketches representing natural growth and wisdom (no text) */}
            <circle cx="140" cy="248" r="4.5" stroke="#fff" strokeWidth="0.8" fill="none" strokeDasharray="1.2,1.2" opacity="0.8" />
            <path d="M 140,242 L 140,240 M 140,254 L 140,256 M 134,248 L 132,248 M 146,248 L 148,248" stroke="#fff" strokeWidth="0.8" opacity="0.8" />
            <path d="M 152,260 C 152,251 160,251 160,251 C 160,251 160,260 152,260 Z" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.8" />
            <path d="M 152,260 L 157,255" stroke="#fff" strokeWidth="0.8" opacity="0.8" />
          </g>

          {/* Clay Water Pot (Matka) on Stand */}
          <g filter="url(#element-shadow)">
            <path d="M 345,302 Q 350,305 355,302 L 355,314 Q 350,317 345,314 Z" fill="#475569" />
            <circle cx="350" cy="294" r="9.2" fill="#c2410c" />
            <ellipse cx="350" cy="286" rx="5.2" ry="1.8" fill="#9a3412" />
            <circle cx="347" cy="291" r="2.2" fill="#ea580c" opacity="0.75" />
          </g>

          {/* ENGAGED STUDENTS GROUP */}
          {/* Student 1 (Girl, Left - Head Bobbing to signify understanding) */}
          <g className="student-breath" style={{ transformOrigin: '272px 290px', animationDelay: '-0.8s' }}>
            <path d="M 260,302 C 260,285 268,272 278,272 C 284,272 286,285 286,302 Z" fill="#0284c7" />
            
            {/* Listening Head Tilt */}
            <g className="student-head-tilt">
              <circle cx="273" cy="261" r="8.2" fill="#fdba74" />
              <path d="M 268,260 Q 262,274 264,284" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="264" cy="285" r="1.5" fill="#ef4444" />
            </g>
            
            {/* Open notebook on lap */}
            <polygon points="266,288 282,288 284,296 268,296" fill="#f8fafc" stroke="#334155" strokeWidth="0.5" />
          </g>

          {/* Student 2 (Boy, Middle - Active Writing Hand Motion) */}
          <g className="student-breath" style={{ transformOrigin: '315px 300px', animationDelay: '-1.8s' }}>
            <path d="M 300,312 C 300,295 308,282 320,282 C 328,282 330,295 330,312 Z" fill="#16a34a" />
            <circle cx="315" cy="270" r="8.5" fill="#fed7aa" />
            <path d="M 307,267 C 310,262 320,262 323,267" fill="#0f172a" />
            
            {/* Slate details */}
            <polygon points="305,296 324,296 322,306 303,306" fill="#1e293b" stroke="#78350f" strokeWidth="1" />
            <line x1="309" y1="301" x2="318" y2="301" stroke="#fff" strokeWidth="0.8" opacity="0.9" />
            
            {/* Writing Hand */}
            <g className="student-writing">
              <line x1="324" y1="302" x2="317" y2="302" stroke="#fed7aa" strokeWidth="3.2" strokeLinecap="round" />
            </g>
          </g>

          {/* Student 3 (Girl, Right - Eager Listener) */}
          <g className="student-breath" style={{ transformOrigin: '350px 305px', animationDelay: '-1.2s' }}>
            <path d="M 340,316 C 340,300 348,288 358,288 C 366,288 368,300 368,316 Z" fill="#eab308" />
            <circle cx="353" cy="277" r="8" fill="#fdba74" />
            <path d="M 358,277 Q 363,284 361,293" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
            <polygon points="345,302 360,302 358,311 343,311" fill="#fff5eb" stroke="#cbd5e1" strokeWidth="0.5" />
          </g>

          {/* Student 4 (Boy, Right-Front - Curious Learner) */}
          <g className="student-breath" style={{ transformOrigin: '382px 315px', animationDelay: '-0.5s' }}>
            <path d="M 370,324 C 370,310 376,298 385,298 C 392,298 394,310 394,324 Z" fill="#6366f1" />
            <circle cx="382" cy="286" r="7.8" fill="#fed7aa" />
            <path d="M 376,283 C 378,279 386,279 388,283" fill="#1e293b" />
          </g>

          {/* PREMIUM INTERACTIVE OPEN BOOKS, SCHOOL BAGS & REAL LEARNING ENVIRONMENT PROPS */}
          {/* Detailed School Bags */}
          <g filter="url(#element-shadow)">
            {/* Traditional Tan Bag */}
            <path d="M 288,308 Q 294,302 300,308 L 298,318 Q 294,321 288,318 Z" fill="#b45309" />
            <rect x="290" y="310" width="8" height="6" fill="#78350f" rx="1" />
            <path d="M 288,308 C 285,302 291,299 294,305" fill="none" stroke="#78350f" strokeWidth="0.8" />
            <path d="M 300,308 C 303,302 297,299 294,305" fill="none" stroke="#78350f" strokeWidth="0.8" />
            
            {/* Modern startup blue school bag */}
            <path d="M 334,312 Q 339,307 344,312 L 343,322 Q 339,325 334,322 Z" fill="#1d4ed8" />
            <rect x="336" y="314" width="7" height="6" fill="#1e3a8a" rx="1" />
            <path d="M 334,312 C 331,306 337,303 339,309" fill="none" stroke="#1e3a8a" strokeWidth="0.8" />
            <path d="M 344,312 C 347,306 341,303 339,309" fill="none" stroke="#1e3a8a" strokeWidth="0.8" />

            {/* Emerald Startup Bag on the right */}
            <path d="M 376,315 Q 381,310 386,315 L 385,324 Q 381,327 376,324 Z" fill="#10b981" />
            <rect x="378" y="317" width="6" height="5" fill="#065f46" rx="0.8" />
            <path d="M 376,315 C 373,309 379,306 381,312" fill="none" stroke="#065f46" strokeWidth="0.8" />
            <path d="M 386,315 C 389,309 383,306 381,312" fill="none" stroke="#065f46" strokeWidth="0.8" />
          </g>

          {/* Stainless Steel & Copper Water Bottles */}
          <g filter="url(#element-shadow)">
            {/* Steel bottle */}
            <rect x="294" y="320" width="3.5" height="10" rx="1.2" fill="#94a3b8" />
            <rect x="295" y="318.5" width="1.5" height="1.5" fill="#cbd5e1" rx="0.5" />
            <line x1="295" y1="321" x2="295" y2="329" stroke="#ffffff" strokeWidth="0.5" opacity="0.65" />
            
            {/* Copper water bottle */}
            <rect x="348" y="318" width="3" height="9" rx="1" fill="#ea580c" />
            <rect x="348.8" y="316.5" width="1.4" height="1.5" fill="#9a3412" rx="0.4" />
          </g>

          {/* Stacked colorful books nearby */}
          <g filter="url(#element-shadow)">
            <rect x="238" y="306" width="16" height="4.5" fill="#ef4444" rx="0.5" />
            <rect x="239" y="302" width="14" height="4" fill="#3b82f6" rx="0.5" />
            <rect x="238" y="299" width="15" height="3.5" fill="#10b981" rx="0.5" />
            
            {/* Extra stack on the right */}
            <rect x="362" y="318" width="14" height="4" fill="#f59e0b" rx="0.5" />
            <rect x="363" y="315" width="12" height="3" fill="#8b5cf6" rx="0.5" />
          </g>

          {/* Premium open notebook flat on the durrie rug */}
          <g transform="translate(246, 320) scale(0.65)" filter="url(#element-shadow)">
            {/* Left page */}
            <path d="M 0,0 C 8,-3 16,-3 22,0 L 22,12 C 16,9 8,9 0,12 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
            {/* Right page */}
            <path d="M 22,0 C 28,-3 36,-3 44,0 L 44,12 C 36,9 28,9 22,12 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
            {/* Spine */}
            <line x1="22" y1="-1" x2="22" y2="12" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Writing lines */}
            <line x1="4" y1="3" x2="18" y2="3" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="4" y1="6" x2="18" y2="6" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="4" y1="9" x2="18" y2="9" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="26" y1="3" x2="40" y2="3" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="26" y1="6" x2="40" y2="6" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="26" y1="9" x2="40" y2="9" stroke="#e2e8f0" strokeWidth="0.5" />
          </g>

          {/* Blue Pencil Box & scattered pencils */}
          <g filter="url(#element-shadow)">
            <rect x="323" y="324" width="11" height="4.5" rx="0.8" fill="#3b82f6" />
            <rect x="324" y="324" width="9" height="1.2" fill="#60a5fa" rx="0.4" />
            {/* Small yellow pencil lying next to it */}
            <line x1="334.5" y1="325" x2="338" y2="322.5" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" />
            {/* Small red pencil */}
            <line x1="335" y1="326.5" x2="339" y2="324" stroke="#ef4444" strokeWidth="0.8" strokeLinecap="round" />
          </g>

          {/* Open book centerpiece with page flutter animation */}
          <g transform="translate(242, 308)" filter="url(#element-shadow)">
            {/* Left side book base */}
            <path d="M 0,0 C 8,-3 16,-3 22,0 L 22,6 C 16,3 8,3 0,6 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
            {/* Right side book base */}
            <path d="M 22,0 C 28,-3 36,-3 44,0 L 44,6 C 36,3 28,3 22,6 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
            
            {/* Fluttering page layer on the left/right crease */}
            <path className="page-flutter" d="M 22,0 C 27,-4 33,-6 38,-3 L 38,3 C 33,0 27,2 22,6 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
            
            {/* Center spine */}
            <line x1="22" y1="-1" x2="22" y2="6" stroke="#94a3b8" strokeWidth="1" />
          </g>

        </svg>
      </div>

    </div>
  );
};


// Custom Inline CSS Stylesheets packaged perfectly inside component (healthy MERN performance)
const styleBlock = (
  <style>{`
    .sunbeam-fade {
      opacity: 0.65;
      animation: sunbeamPulse 8s infinite ease-in-out;
    }
    @keyframes sunbeamPulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 0.7; }
    }

    .sunray-pulse {
      animation: sunrayPulse 6s infinite ease-in-out;
    }
    @keyframes sunrayPulse {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 0.85; }
    }

    .floating-particle {
      position: absolute;
      background-color: #f59e0b;
      border-radius: 50%;
      filter: drop-shadow(0 0 3px #fbbf24);
      opacity: 0.55;
      animation: floatUp 8s infinite linear;
    }
    @keyframes floatUp {
      0% {
        transform: translateY(0) scale(0.6);
        opacity: 0.05;
      }
      20% {
        opacity: 0.7;
      }
      90% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(-240px) scale(1.1);
        opacity: 0;
      }
    }

    /* Foliage Multi-Layered Natural Sway */
    .foliage-back {
      transform-origin: 250px 140px;
      animation: swayFoliageBack 14s infinite ease-in-out;
    }
    .foliage-mid {
      transform-origin: 250px 140px;
      animation: swayFoliageMid 11s infinite ease-in-out;
    }
    .foliage-front {
      transform-origin: 250px 140px;
      animation: swayFoliageFront 8s infinite ease-in-out;
    }
    @keyframes swayFoliageBack {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(-0.8deg) scale(1.01); }
    }
    @keyframes swayFoliageMid {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(1.2deg) skewX(0.4deg); }
    }
    @keyframes swayFoliageFront {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-1.5deg) skewX(-0.6deg) scale(0.99); }
    }

    .teacher-arm {
      transform-origin: 228px 265px;
      animation: gestureTeach 6s infinite ease-in-out;
    }
    @keyframes gestureTeach {
      0%, 100% { transform: rotate(0deg); }
      40% { transform: rotate(8deg) translateY(-1px); }
      75% { transform: rotate(-4deg) translateY(1px); }
    }

    .student-breath {
      animation: breatheChild 6s infinite ease-in-out;
    }
    @keyframes breatheChild {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.018); }
    }

    .student-head-tilt {
      transform-origin: 273px 265px;
      animation: headBob 6s infinite ease-in-out;
    }
    @keyframes headBob {
      0%, 100% { transform: rotate(0deg); }
      33% { transform: rotate(3deg); }
      66% { transform: rotate(-2deg); }
    }

    .student-writing {
      transform-origin: 324px 302px;
      animation: writeNotebook 3.5s infinite ease-in-out;
    }
    @keyframes writeNotebook {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(-1.5px, 0.5px); }
      50% { transform: translate(1px, -1px); }
      75% { transform: translate(-0.5px, 0px); }
    }

    .page-flutter {
      transform-origin: 22px 6px;
      animation: flipPage 7s infinite ease-in-out;
    }
    @keyframes flipPage {
      0%, 90%, 100% { transform: rotate(0deg) skewY(0deg) scaleX(1); opacity: 1; }
      93% { transform: rotate(-16deg) skewY(-8deg) scaleX(0.72); opacity: 0.9; }
      96% { transform: rotate(-3deg) skewY(-1.5deg) scaleX(0.96); opacity: 1; }
    }

    /* Falling Leaves flutter effect */
    .falling-leaf {
      fill: #4ade80;
      opacity: 0;
      transform-origin: center;
    }
    .leaf-1 {
      animation: fallLeaf1 12s infinite linear;
      fill: #bef264;
    }
    .leaf-2 {
      animation: fallLeaf2 10s infinite linear;
      animation-delay: -3s;
      fill: #4ade80;
    }
    .leaf-3 {
      animation: fallLeaf3 15s infinite linear;
      animation-delay: -6s;
      fill: #22c55e;
    }
    .leaf-4 {
      animation: fallLeaf4 11s infinite linear;
      animation-delay: -9s;
      fill: #a3e635;
    }

    @keyframes fallLeaf1 {
      0% { transform: translate(120px, 100px) rotate(0deg) scale(0.8); opacity: 0; }
      10% { opacity: 0.75; }
      90% { opacity: 0.75; }
      100% { transform: translate(80px, 305px) rotate(360deg) scale(0.8); opacity: 0; }
    }
    @keyframes fallLeaf2 {
      0% { transform: translate(360px, 110px) rotate(0deg) scale(0.9); opacity: 0; }
      10% { opacity: 0.7; }
      90% { opacity: 0.7; }
      100% { transform: translate(380px, 300px) rotate(-270deg) scale(0.9); opacity: 0; }
    }
    @keyframes fallLeaf3 {
      0% { transform: translate(220px, 90px) rotate(0deg) scale(0.85); opacity: 0; }
      10% { opacity: 0.8; }
      90% { opacity: 0.8; }
      100% { transform: translate(190px, 305px) rotate(180deg) scale(0.85); opacity: 0; }
    }
    @keyframes fallLeaf4 {
      0% { transform: translate(280px, 105px) rotate(0deg) scale(0.75); opacity: 0; }
      10% { opacity: 0.75; }
      90% { opacity: 0.75; }
      100% { transform: translate(305px, 305px) rotate(-180deg) scale(0.75); opacity: 0; }
    }

    /* Branch Swing sway animation */
    .gentle-swing {
      transform-origin: 173px 134px;
      animation: swingSway 7.5s infinite ease-in-out;
    }
    @keyframes swingSway {
      0%, 100% { transform: rotate(-3.5deg); }
      50% { transform: rotate(3.5deg); }
    }
  `}</style>
);


const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Location selector states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Detect GPS location & reverse geocode
  const detectLocation = () => {
    setLoadingLocation(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('GPS not supported by browser.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude: lng, latitude: lat } = position.coords;
        try {
          const { data } = await axios.get(`/api/teachers/geocode/reverse?lat=${lat}&lng=${lng}`);
          let formattedName = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          let area = 'Detected Area';
          if (data && data.address) {
            const addr = data.address;
            area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Area';
            const state = addr.state || '';
            const code = addr.postcode || '';
            formattedName = code ? `${area}, ${state} (${code})` : (state ? `${area}, ${state}` : area);
          }
          navigate('/nearby', {
            state: {
              coordinates: [lng, lat],
              addressName: formattedName,
              areaName: area
            }
          });
        } catch (err) {
          console.error('Reverse Geocode failed:', err);
          navigate('/nearby', {
            state: {
              coordinates: [lng, lat],
              addressName: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
              areaName: 'Detected Area'
            }
          });
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.warn('GPS detection failed:', err);
        setGeoError('GPS failed or timed out. Search manually!');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Real-time autocomplete Nominatim search
  const handleLocationSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length < 3) {
      setSearchSuggestions([]);
      return;
    }

    setSearchingPlaces(true);
    try {
      const { data } = await axios.get(`/api/teachers/geocode/search?q=${encodeURIComponent(val)}`);
      setSearchSuggestions(data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearchingPlaces(false);
    }
  };

  // Triggered when manual selection is chosen
  const handleSuggestionSelect = (item) => {
    const lng = parseFloat(item.lon);
    const lat = parseFloat(item.lat);
    const addr = item.address || {};
    const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Area';
    const state = addr.state || '';
    const code = addr.postcode || '';
    const formatted = code ? `${area}, ${state} (${code})` : (state ? `${area}, ${state}` : area);
    
    navigate('/nearby', {
      state: {
        coordinates: [lng, lat],
        addressName: formatted,
        areaName: area
      }
    });
  };
  
  // Helper to extract clean localized labels for counters
  const getLocalizedLabel = (key, defaultLabel) => {
    const val = t(key);
    return val.replace(/[0-9,+/]+/g, '').trim() || defaultLabel;
  };



  return (
    <div className="overflow-hidden bg-[#f8fafc] relative w-full">
      
      {/* Ambient mathematical meshes and glows */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none -z-10 select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-200/20 to-indigo-300/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-accent-200/15 to-purple-200/15 blur-[130px]" />
      </div>


      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:py-28 lg:py-32 select-none pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          
          {/* Main Hero Asymmetric Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Text, Local Search Hub & Counters */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 flex flex-col space-y-8 text-left max-w-3xl mx-auto lg:mx-0 relative z-20"
            >
              {/* Active Tag / Accent Badge */}
              <motion.div 
                variants={itemVariants} 
                className="inline-flex self-start items-center space-x-2 bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100/80 px-4 py-2 rounded-full text-xs font-black text-brand-600 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                <Sparkles size={14} className="text-orange-500 animate-pulse" />
                <span className="font-outfit uppercase tracking-wider">Hyperlocal Learning Ecosystem 🇮🇳</span>
              </motion.div>
  
              {/* Glowing Hero Title */}
              <motion.h1 
                variants={itemVariants} 
                className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 leading-[1.1] relative"
              >
                Find the Best <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-brand-500 via-indigo-600 to-orange-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(79,70,229,0.05)]">
                  Tuition Teachers
                </span> <br />
                in Your Neighborhood
              </motion.h1>
  
              {/* Subtitle description */}
              <motion.p 
                variants={itemVariants} 
                className="text-base sm:text-lg text-slate-500 font-semibold max-w-2xl leading-relaxed"
              >
                {t('hero.subtitle')}
              </motion.p>
  
              {/* Action Location Hub - Zomato/Blinkit style */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-md p-4 rounded-[28px] border border-slate-100/90 shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(79,70,229,0.08)] transition-all duration-500 max-w-2xl w-full relative z-20 group"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  
                  {/* Autocomplete Input */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Search size={18} className="group-hover:text-brand-500 transition-colors" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleLocationSearch}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim().length > 0) {
                          navigate('/nearby', {
                            state: {
                              locationQuery: searchQuery.trim(),
                              addressName: `Search: "${searchQuery.trim()}"`
                            }
                          });
                        }
                      }}
                      placeholder="Search village, locality, city manually..."
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-bold text-slate-700 placeholder-slate-400"
                    />
                    
                    {/* Autocomplete Suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 max-h-[220px] overflow-y-auto">
                        {searchSuggestions.map((item) => {
                          const addr = item.address || {};
                          const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Area';
                          const state = addr.state || '';
                          return (
                            <button
                               key={item.place_id}
                              onClick={() => handleSuggestionSelect(item)}
                              className="w-full text-left p-3.5 hover:bg-brand-50/50 border-b border-slate-100/60 last:border-0 flex items-start space-x-3 transition-all cursor-pointer group/item"
                            >
                              <span className="text-base mt-0.5 group-hover/item:scale-125 transition-transform">📍</span>
                              <div>
                                <p className="font-extrabold text-slate-800 text-sm group-hover/item:text-brand-600 transition-colors">{area}</p>
                                <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5 max-w-[320px] sm:max-w-xs">{item.display_name}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
  
                    {searchingPlaces && (
                      <div className="absolute right-3 top-3.5 flex items-center text-slate-400">
                        <Loader2 size={16} className="animate-spin text-brand-500" />
                      </div>
                    )}
                  </div>
  
                  {/* GPS Locator Button */}
                  <button
                    onClick={detectLocation}
                    disabled={loadingLocation}
                    className="relative group/btn overflow-hidden bg-brand-500 hover:bg-brand-600 text-white font-outfit font-black text-sm px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-all duration-300 active:scale-95 cursor-pointer flex-shrink-0 disabled:opacity-75"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10"></div>
                    {loadingLocation ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Navigation size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    )}
                    <span>{loadingLocation ? 'Locating...' : 'Use Current Location'}</span>
                  </button>
                </div>
  
                {/* Geolocation metadata status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2.5 text-[10px] font-extrabold text-slate-400 border-t border-slate-100/50 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Compass size={14} className="text-[#f97316]" />
                    <span>Type address above & press Enter to search directly</span>
                  </span>
                  {geoError && (
                    <span className="text-rose-500 font-bold">{geoError}</span>
                  )}
                </div>
              </motion.div>
  
            </motion.div>
  
            {/* Right Column: Premium Animated Indian Banyan Tree Classroom Visual */}
            <div className="lg:col-span-5 flex items-center justify-center relative z-10 w-full">
              <RuralClassroomVisual />
            </div>
            
          </div>
          
        </div>
      </section>

      {/* Dual Role Onboarding Portal cards */}
      <section className="relative pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {user ? (
          /* Premium Authenticated Welcome Section */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[32px] p-8 md:p-12 shadow-premium hover:shadow-[0_20px_50px_rgba(79,70,229,0.12)] hover:border-brand-300 transition-all duration-500 max-w-2xl mx-auto text-center relative overflow-hidden group z-20"
          >
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-tr from-brand-500/10 to-indigo-500/10 rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-500"></div>
            
            <div className="flex flex-col items-center space-y-6">
              
              {/* Profile Photo / Avatar Widget */}
              <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center shrink-0 bg-slate-50">
                {getProfilePhotoUrl(user.profilePhoto || user.profileImage) ? (
                  <img 
                    src={getProfilePhotoUrl(user.profilePhoto || user.profileImage)} 
                    alt={user.name} 
                    className="h-full w-full object-cover" 
                    onError={handleProfileImageError}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Greeting */}
              <div className="space-y-2">
                <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border ${
                  user.role === 'teacher' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}>
                  {user.role === 'teacher' ? '🎓 Certified Teacher' : '🎒 Enrolled Student'}
                </span>
                <h3 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 leading-none">
                  Welcome back, {user.name}!
                </h3>
                <p className="text-slate-500 text-sm font-semibold max-w-md mx-auto leading-relaxed">
                  You have an active session. Jump directly into your classroom registry, notes, billing receipts, and attendance logs.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
                <Link
                  to={user.role === 'teacher' ? '/teacher' : '/student'}
                  className="w-full sm:flex-1 inline-flex items-center justify-center bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-outfit font-black text-sm px-6 py-4 rounded-2xl shadow-md hover:shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all duration-300 active:scale-95 text-center cursor-pointer"
                >
                  {user.role === 'teacher' ? 'Go To Teacher Dashboard' : 'Go To Student Dashboard'}
                </Link>
                
                <Link
                  to="/profile"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-outfit font-black text-sm px-6 py-4 border border-slate-200 rounded-2xl transition-all duration-300 active:scale-95 text-center cursor-pointer"
                >
                  My Profile
                </Link>

                <button
                  onClick={logout}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 font-outfit font-black text-sm px-6 py-4 border border-rose-100 rounded-2xl transition-all duration-300 active:scale-95 text-center cursor-pointer"
                >
                  Logout
                </button>
              </div>

            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left relative z-20">
            
            {/* Card 1: Student/Parent Registration Portal */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[32px] p-8 shadow-premium hover:shadow-[0_20px_50px_rgba(79,70,229,0.12)] hover:border-brand-300 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-brand-500/10 to-indigo-500/10 rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
                <h3 className="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2 group-hover:text-brand-600 transition-colors">
                  Student / Parent
                </h3>
                <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                  Find neighborhood tuition centers, track monthly attendance records, view payment ledgers, and download homework resources instantly.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/signup/student"
                  className="w-full inline-flex items-center justify-center bg-gradient-to-r from-brand-500 via-indigo-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-outfit font-black text-sm px-6 py-4 rounded-2xl shadow-md hover:shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all duration-300 active:scale-95 text-center cursor-pointer"
                >
                  Sign Up as Student
                </Link>
              </div>
            </motion.div>

            {/* Card 2: Teacher Portal Onboarding */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[32px] p-8 shadow-premium hover:shadow-[0_20px_50px_rgba(249,115,22,0.12)] hover:border-orange-300 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-orange-500/10 to-amber-500/10 rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h3 className="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                  Become a Tutor
                </h3>
                <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                  Establish your neighborhood brand, onboard local students, mark daily attendance registers, track payments, and publish files online.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  to="/signup/teacher"
                  className="w-full inline-flex items-center justify-center bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-outfit font-black text-sm px-6 py-4 rounded-2xl shadow-md hover:shadow-[0_8px_20px_rgba(249,115,22,0.25)] transition-all duration-300 active:scale-95 text-center cursor-pointer"
                >
                  Sign Up as Teacher
                </Link>
              </div>
            </motion.div>

            {/* Center aligned Login links for guests */}
            <div className="col-span-1 md:col-span-2 text-center pt-8 text-sm font-semibold text-slate-500">
              <span className="text-slate-400">Already registered?</span>{' '}
              <Link 
                to="/login/student" 
                className="font-extrabold text-brand-600 hover:text-brand-700 hover:underline mx-1.5 transition-all inline-flex items-center gap-1 bg-white px-3.5 py-1.5 rounded-full border border-slate-100 shadow-sm"
              >
                🎒 Student Login
              </Link>
              <Link 
                to="/login/teacher" 
                className="font-extrabold text-orange-600 hover:text-orange-700 hover:underline mx-1.5 transition-all inline-flex items-center gap-1 bg-white px-3.5 py-1.5 rounded-full border border-slate-100 shadow-sm"
              >
                🎓 Teacher Login
              </Link>
            </div>

          </div>
        )}
      </section>
 
      {/* How it Works Section */}
      <section id="how" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              {t('hero.howItWorks')}
            </h2>
            <div className="h-1 w-20 bg-brand-500 mx-auto rounded-full"></div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 hover:border-brand-100 hover:shadow-premium transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={28} className="text-[#f97316]" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-3">{t('hero.step1')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('hero.step1Text')}</p>
            </div>
 
            {/* Step 2 */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 hover:border-brand-100 hover:shadow-premium transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={28} className="text-brand-500" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-3">{t('hero.step2')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('hero.step2Text')}</p>
            </div>
 
            {/* Step 3 */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 hover:border-brand-100 hover:shadow-premium transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                <ClipboardCheck size={28} className="text-emerald-500" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-3">{t('hero.step3')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('hero.step3Text')}</p>
            </div>
          </div>
        </div>
      </section>
 
      {/* Social Philosophy & Impact Section */}
      <section className="py-24 bg-gradient-to-r from-brand-500 to-indigo-700 text-white relative overflow-hidden">
        {/* Soft background visual ring */}
        <div className="absolute -bottom-10 -left-10 w-96 h-96 border-4 border-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 border-4 border-white/10 rounded-full pointer-events-none"></div>
 
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <HeartHandshake size={14} className="text-orange-400" />
            <span>{t('hero.philosophyTitle')}</span>
          </div>
 
          <h2 className="font-outfit font-extrabold text-3xl sm:text-5xl leading-tight">
            Fair Visibility For Neighborhood Talents
          </h2>
 
          <p className="text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('hero.philosophyDesc')}
          </p>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6 text-left">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xs flex items-start space-x-4">
              <ShieldCheck size={28} className="text-emerald-300 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">Verify Educators Locally</h4>
                <p className="text-xs text-indigo-200 leading-relaxed">Collaborating with local representatives and Panchayats to ensure background credibility in rural towns.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xs flex items-start space-x-4">
              <BookOpen size={28} className="text-orange-300 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">Empower Rural Women Teachers</h4>
                <p className="text-xs text-indigo-200 leading-relaxed">Providing high-grade discoverability to skilled educated women tutoring local children at home.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Founder CTA Section */}
      <section className="py-20 bg-slate-50 relative border-t border-slate-100/60 overflow-hidden">
        
        {/* Soft glowing colorful lights (Razorpay/CRED style) */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Floating dust/particle animation in background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full">
            <circle cx="15%" cy="30%" r="1.5" fill="#4f46e5" className="animate-ping" />
            <circle cx="85%" cy="70%" r="2" fill="#f97316" className="animate-ping" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-white/90 backdrop-blur-md border border-slate-100 p-8 sm:p-12 md:p-16 rounded-[40px] shadow-premium hover:shadow-premium-hover transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left group"
          >
            {/* Soft inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/10 via-transparent to-orange-50/10 pointer-events-none"></div>

            {/* Left side: Context Content */}
            <div className="space-y-4 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-orange-50 to-indigo-50 border border-brand-100 px-3.5 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                <span className="text-orange-500 animate-pulse">🚀</span>
                <span>Meet The Founder</span>
              </div>
              
              {/* Title & Description */}
              <h3 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                Curious who built GuruConnect?
              </h3>
              
              <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
                Learn about the IIT Patna student behind this hyperlocal education platform and the vision driving it.
              </p>
            </div>

            {/* Right side: Glowing Pulsing Button */}
            <div className="relative flex-shrink-0 group/btn">
              {/* Glowing backing element */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-600 rounded-2xl blur-md opacity-60 group-hover/btn:opacity-100 transition duration-300 animate-pulse"></div>
              
              <Link
                to="/creator"
                className="relative inline-flex items-center justify-center bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-outfit font-black text-sm px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>👨‍💻 Know The Creator</span>
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
