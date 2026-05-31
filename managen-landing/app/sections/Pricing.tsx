"use client";
import ScrollReveal from "../components/ScrollReveal";
import PricingCard from "../components/PricingCard";

const PLANS = [
  {
    name: "Free Trial",
    price: "Free",
    period: "/ 7 days",
    features: [
      "Up to 50 students",
      "Attendance & fee tracking",
      "Basic reports",
      "Email support",
      "Setup in 10 minutes",
    ],
    ctaText: "Get Started",
  },
  {
    name: "Starter",
    price: "GHS 199",
    period: "/ month",
    features: [
      "Up to 150 students",
      "Everything in Free",
      "WhatsApp reports",
      "Exam scheduling",
      "CSV data import",
    ],
    ctaText: "Start Free Trial",
  },
  {
    name: "Growth",
    price: "GHS 499",
    period: "/ month",
    features: [
      "Up to 300 students",
      "Everything in Starter",
      "Fee tracking & invoicing",
      "Exams & admissions",
      "Unlimited WhatsApp reports",
      "Priority support",
    ],
    ctaText: "Start Free Trial",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Pro",
    price: "GHS 999",
    period: "/ month",
    features: [
      "Up to 800 students",
      "Everything in Growth",
      "Library, hostel & transport",
      "Payroll management",
      "All integrations",
    ],
    ctaText: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited students",
      "All modules",
      "Custom branding",
      "Dedicated account manager",
      "API access",
    ],
    ctaText: "Contact Sales",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-[100px] bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal className="text-center mb-14">
          <h2 className="text-4xl md:text-[40px] font-bold text-[#0B0F1C] mb-4">
            Simple pricing, no hidden fees
          </h2>
          <p className="text-lg text-gray-500">Start free. Upgrade when you&apos;re ready.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {PLANS.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 80}>
              <PricingCard {...plan} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
