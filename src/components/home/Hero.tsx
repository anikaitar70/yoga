import Image from "next/image";
import { fetchHero } from "@/content";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export async function Hero() {
  const hero = await fetchHero();

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="grid min-h-[min(85vh,720px)] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:py-24">
          <Container className="max-w-xl px-0">
            <Eyebrow className="tracking-[0.25em]">Nirvana Yoga</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              {hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
              <Button href={hero.secondaryCta.href} variant="secondary">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </Container>
        </div>
        <div className="relative min-h-[280px] lg:min-h-0">
          <Image
            src={hero.imageSrc}
            alt={hero.imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 to-transparent lg:bg-gradient-to-l"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
