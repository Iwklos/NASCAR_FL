"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Race {
  id: string;
  name: string;
  track: string;
  date: string;
  completed: boolean;
}

interface ResultRow {
  driverName: string;
  driverNumber: string;
  position: number;
  points: number;
}

export default function AdminResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ResultRow[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.push("/dashboard");
    }
    fetchRaces();
  }, [session, router]);

  const fetchRaces = async () => {
    const res = await fetch("/api/races?season=" + new Date().getFullYear());
    const data = await res.json();
    setRaces(data.filter((r: Race) => !r.completed));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Parse CSV/Excel file for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const results: ResultRow[] = [];

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(",");
        if (parts.length >= 4) {
          results.push({
            position: parseInt(parts[0]),
            driverNumber: parts[1],
            driverName: parts[2],
            points: parseInt(parts[3]),
          });
        }
      }

      setPreview(results);
    };

    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!selectedRace || !file) {
      alert("Please select a race and file");
      return;
    }

    setProcessing(true);

    try {
      // Upload results
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId: selectedRace,
          results: preview,
        }),
      });

      if (res.ok) {
        alert("Results uploaded and standings updated successfully!");
        setFile(null);
        setPreview([]);
        setSelectedRace("");
        fetchRaces();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload results");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  if (session && !session.user.isAdmin) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Race Results</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="file">Upload CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
            />
            <Alert className="mt-2">
              <AlertDescription>
                CSV format: Position, Driver Number, Driver Name, Points
                <br />
                Example: 1,11,Denny Hamlin,40
              </AlertDescription>
            </Alert>
          </div>

          {preview.length > 0 && (
            <Button onClick={handleUpload} disabled={processing}>
              {processing ? "Processing..." : "Upload Results & Calculate Points"}
            </Button>
          )}
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({preview.length} results)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.slice(0, 10).map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.position}</TableCell>
                    <TableCell>#{result.driverNumber}</TableCell>
                    <TableCell>{result.driverName}</TableCell>
                    <TableCell>{result.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {preview.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                ... and {preview.length - 10} more results
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

