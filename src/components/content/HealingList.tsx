import type { ContentBlock } from "@/content/types";

type HealingListProps = {
  items: ContentBlock[];
};

export function HealingList({ items }: HealingListProps) {
  return (
    <ul className="mx-auto max-w-3xl space-y-10">
      {items.map((item) => (
        <li key={item.id} className="border-l-2 border-accent pl-8">
          <h2 className="font-display text-2xl font-medium text-foreground">
            {item.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
