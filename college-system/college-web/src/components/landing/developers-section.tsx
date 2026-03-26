"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";

const codeExamples = [
  {
    label: "Student Portal",
    code: `// Falcon College Student Login
import { FalconPortal } from '@falcon/sdk'

const portal = new FalconPortal({
  role: 'student',
  rollNo: 'FC-2025-0042'
})

// Access your dashboard
const dashboard = await portal.getDashboard()`,
  },
  {
    label: "Grades",
    code: `// Fetch academic results
const grades = await student.getGrades({
  session: '2025-2026',
  term: 'Annual'
})

// Output
// { subject: 'Physics', marks: 92, grade: 'A' }
// { subject: 'Chemistry', marks: 88, grade: 'B+' }
// { subject: 'Math', marks: 96, grade: 'A+' }`,
  },
  {
    label: "Attendance",
    code: `// Track attendance in real-time
const attendance = await student
  .getAttendance({ month: 'March' })

// Real-time notification sent
notify.parent({
  message: 'Your ward is present today',
  date: new Date(),
  status: 'present'
})`,
  },
];

const features = [
  {
    title: "Multi-role access",
    description: "Student, teacher, parent & admin portals."
  },
  {
    title: "Real-time updates",
    description: "Instant grade and attendance notifications."
  },
  {
    title: "Secure & private",
    description: "End-to-end encrypted data access."
  },
  {
    title: "Mobile friendly",
    description: "Access from any device, anywhere."
  },
];

const codeAnimationStyles = `
  .dev-code-line {
    opacity: 0;
    transform: translateX(-8px);
    animation: devLineReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  
  @keyframes devLineReveal {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .dev-code-char {
    opacity: 0;
    filter: blur(8px);
    animation: devCharReveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  
  @keyframes devCharReveal {
    to {
      opacity: 1;
      filter: blur(0);
    }
  }
`;

export function DevelopersSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="developers" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: codeAnimationStyles }} />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Smart Portal
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Built for students.
              <br />
              <span className="text-muted-foreground">Trusted by families.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              An intuitive, powerful portal that keeps students, parents, and teachers
              connected. Access everything — grades, timetables, attendance — in one place.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code block */}
          <div
            className={`lg:sticky lg:top-32 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10">
              {/* Tabs */}
              <div className="flex items-center border-b border-foreground/10">
                {codeExamples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-4 text-sm font-mono transition-colors relative ${
                      activeTab === idx
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {example.label}
                    {activeTab === idx && (
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                    )}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Code content */}
              <div className="p-8 font-mono text-sm bg-foreground/[0.01] min-h-[220px]">
                <pre className="text-foreground/80">
                  {codeExamples[activeTab].code.split('\n').map((line, lineIndex) => (
                    <div
                      key={`${activeTab}-${lineIndex}`}
                      className="leading-loose dev-code-line"
                      style={{ animationDelay: `${lineIndex * 80}ms` }}
                    >
                      <span className="inline-flex">
                        {line.split('').map((char, charIndex) => (
                          <span
                            key={`${activeTab}-${lineIndex}-${charIndex}`}
                            className="dev-code-char"
                            style={{
                              animationDelay: `${lineIndex * 80 + charIndex * 15}ms`,
                            }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* Links */}
            <div className="mt-6 flex items-center gap-6 text-sm">
              <a href="/login" className="text-foreground hover:underline underline-offset-4">
                Access Student Portal
              </a>
              <span className="text-foreground/20">|</span>
              <a href="#features" className="text-muted-foreground hover:text-foreground">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
