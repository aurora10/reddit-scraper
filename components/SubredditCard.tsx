import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

interface SubredditCardProps {
  name: string;
  description: string;
}

export function SubredditCard({ name, description }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${name}`}>
      <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
        <CardHeader>
          <CardTitle>r/{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}