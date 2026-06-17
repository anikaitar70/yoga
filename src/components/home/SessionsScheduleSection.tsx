import Link from "next/link";
import { fetchHomepageSections } from "@/content/repositories/site";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function SessionsScheduleSection() {
  const sections = await fetchHomepageSections();
  const { weeklySessions, upcomingPrograms, schedule } = sections;
  const cta = schedule.primaryCta;

  return (
    <Section border="subtle" spacing="loose">
      <Container>
        <ScrollReveal animation="rise">
          <SectionHeading
            eyebrow={schedule.eyebrow}
            title={schedule.title}
            subtitle={schedule.subtitle}
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <ScrollReveal animation="slide-left">
            <div className="rounded-2xl border border-border/60 bg-card p-7 sm:p-8">
              <h3 className="font-display text-2xl text-foreground">
                {schedule.weeklyListTitle ?? "Weekly sessions"}
              </h3>
              <ul className="mt-6 space-y-5">
                {weeklySessions.map((session, index) => (
                  <li
                    key={`${session.day}-${session.time}-${index}`}
                    className="flex gap-4 border-b border-border/40 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="w-24 shrink-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-muted">
                        {session.day}
                      </p>
                      <p className="mt-1 text-sm text-muted">{session.time}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {session.location} · {session.language}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="slide-right" delay={120}>
            <div className="space-y-4">
              {upcomingPrograms.map((program) => (
                <article
                  key={program.title}
                  className="rounded-2xl border border-border/60 bg-card-elevated p-6 transition-transform duration-500 hover:scale-[1.01]"
                >
                  <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary-muted">
                    {program.type}
                  </span>
                  <h3 className="mt-3 font-display text-xl text-foreground">{program.title}</h3>
                  <p className="mt-2 text-sm text-muted">{program.location}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{program.dates}</p>
                  {program.detail ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{program.detail}</p>
                  ) : null}
                  <Link
                    href={program.href}
                    className="mt-4 inline-block text-sm font-medium text-primary-muted underline-offset-4 hover:text-primary hover:underline"
                  >
                    {schedule.programLinkLabel ?? "Learn more →"}
                  </Link>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {cta?.href && cta?.label ? (
          <div className="mt-12 text-center">
            <Button href={cta.href} variant="warm">
              {cta.label}
            </Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
