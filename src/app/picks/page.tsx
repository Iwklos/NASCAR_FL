"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Driver {
  id: string;
  name: string;
  number: string;
  group: string;
}

interface Race {
  id: string;
  name: string;
  track: string;
  date: string;
  completed: boolean;
}

export default function PicksPage() {
  const { data: session } = useSession();
  const [races, setRaces] = useState<Race[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [driverA, setDriverA] = useState("");
  const [driverB, setDriverB] = useState("");
  const [useLeadDriver, setUseLeadDriver] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRaces();
    fetchDrivers();
  }, []);

  const fetchRaces = async () => {
    const res = await fetch("/api/races?season=2024");
    const data = await res.json();
    setRaces(data.filter((r: Race) => !r.completed && new Date(r.date) > new Date()));
  };

  const fetchDrivers = async () => {
    const res = await fetch("/api/drivers?season=2024");
    const data = await res.json();
    setDrivers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId: selectedRace,
          driverAId: driverA,
          driverBId: driverB,
          isLeadDriver: useLeadDriver,
        }),
      });

      if (res.ok) {
        alert("Picks submitted successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to submit picks");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const driversGroupA = drivers.filter((d) => d.group === "A");
  const driversGroupB = drivers.filter((d) => d.group === "B");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit Weekly Picks</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Select Race</Label>
              <Select value={selectedRace} onValueChange={setSelectedRace}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a race" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race.id} value={race.id}>
                      {race.name} - {new Date(race.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Group A Driver</Label>
              <Select value={driverA} onValueChange={setDriverA}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Group A driver" />
                </SelectTrigger>
                <SelectContent>
                  {driversGroupA.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      #{driver.number} {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Group B Driver</Label>
              <Select value={driverB} onValueChange={setDriverB}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Group B driver" />
                </SelectTrigger>
                <SelectContent>
                  {driversGroupB.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      #{driver.number} {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="leadDriver"
                checked={useLeadDriver}
                onCheckedChange={(checked) => setUseLeadDriver(checked as boolean)}
              />
              <Label htmlFor="leadDriver">Use Lead Driver This Week</Label>
            </div>

            <Button type="submit" disabled={loading || !selectedRace || !driverA || !driverB}>
              {loading ? "Submitting..." : "Submit Picks"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

