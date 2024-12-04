import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AddSubredditModalProps {
  onAdd: (subreddit: { name: string; description: string }) => void;
}

export function AddSubredditModal({ onAdd }: AddSubredditModalProps) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Extract subreddit name from URL
    try {
      const urlPattern = /reddit\.com\/r\/([^/]+)/;
      const match = url.match(urlPattern);
      
      if (!match) {
        setError("Please enter a valid subreddit URL");
        return;
      }

      const subredditName = match[1];
      
      // In a real app, you'd validate if the subreddit exists here
      onAdd({
        name: subredditName,
        description: `r/${subredditName} community`
      });

      setUrl("");
      setOpen(false);
    } catch (error) {
      setError("Failed to add subreddit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Subreddit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Enter subreddit URL (e.g., https://reddit.com/r/nextjs)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <Button type="submit">Add</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 