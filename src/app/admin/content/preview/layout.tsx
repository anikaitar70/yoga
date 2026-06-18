export default function HomepagePreviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="-m-6 w-[calc(100%+3rem)] max-w-none md:-m-8 md:w-[calc(100%+4rem)]">{children}</div>;
}
