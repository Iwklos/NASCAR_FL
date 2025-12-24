"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Race {
  id: string;
  name: string;
  track: string;
  date: string;
  season: number;
  raceNumber: number;
  completed: boolean;
}

export default function AdminRacesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    track: "",
    date: "",
    season: new Date().getFullYear(),
    raceNumber: 1,
  });

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.push("/dashboard");
    }
    fetchRaces();
  }, [session, router]);

  const fetchRaces = async () => {
    const res = await fetch("/api/races?season=" + new Date().getFullYear());
    const data = await res.json();
    setRaces(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/races", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Race added successfully!");
        setIsDialogOpen(false);
        setFormData({
          name: "",
          track: "",
          date: "",
          season: new Date().getFullYear(),
          raceNumber: 1,
        });
        fetchRaces();
      } else {
        alert("Failed to add race");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const toggleCompleted = async (raceId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/races/${raceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (res.ok) {
        fetchRaces();
      }
    } catch (error) {
      alert("Failed to update race");
    }
  };

  if (session && !session.user.isAdmin) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Race Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Race</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Race</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Race Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="track">Track</Label>
                <Input
                  id="track"
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  type="number"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="raceNumber">Race Number</Label>
                <Input
                  id="raceNumber"
                  type="number"
                  value={formData.raceNumber}
                  onChange={(e) => setFormData({ ...formData, raceNumber: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Add Race</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Races</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Race #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Track</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {races.map((race) => (
                <TableRow key={race.id}>
                  <TableCell>{race.raceNumber}</TableCell>
                  <TableCell>{race.name}</TableCell>
                  <TableCell>{race.track}</TableCell>
                  <TableCell>{new Date(race.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={race.completed ? "text-green-600" : "text-yellow-600"}>
                      {race.completed ? "Completed" : "Upcoming"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCompleted(race.id, race.completed)}
                    >
                      {race.completed ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

