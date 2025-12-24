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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Driver {
  id: string;
  name: string;
  number: string;
  group: string;
  season: number;
  active: boolean;
}

export default function AdminDriversPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    group: "A",
    season: new Date().getFullYear(),
  });

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.push("/dashboard");
    }
    fetchDrivers();
  }, [session, router]);

  const fetchDrivers = async () => {
    const res = await fetch("/api/drivers?season=" + new Date().getFullYear());
    const data = await res.json();
    setDrivers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Driver added successfully!");
        setIsDialogOpen(false);
        setFormData({
          name: "",
          number: "",
          group: "A",
          season: new Date().getFullYear(),
        });
        fetchDrivers();
      } else {
        alert("Failed to add driver");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const toggleActive = async (driverId: string, active: boolean) => {
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (res.ok) {
        fetchDrivers();
      }
    } catch (error) {
      alert("Failed to update driver");
    }
  };

  if (session && !session.user.isAdmin) {
    return <div>Unauthorized</div>;
  }

  const driversGroupA = drivers.filter((d) => d.group === "A");
  const driversGroupB = drivers.filter((d) => d.group === "B");

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Driver</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Driver Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="number">Car Number</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="group">Group</Label>
                <Select
                  value={formData.group}
                  onValueChange={(value) => setFormData({ ...formData, group: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Group A</SelectItem>
                    <SelectItem value="B">Group B</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button type="submit" className="w-full">Add Driver</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="groupA">
        <TabsList>
          <TabsTrigger value="groupA">Group A</TabsTrigger>
          <TabsTrigger value="groupB">Group B</TabsTrigger>
        </TabsList>
        <TabsContent value="groupA">
          <Card>
            <CardHeader>
              <CardTitle>Group A Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driversGroupA.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>#{driver.number}</TableCell>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>
                        <span className={driver.active ? "text-green-600" : "text-red-600"}>
                          {driver.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(driver.id, driver.active)}
                        >
                          {driver.active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="groupB">
          <Card>
            <CardHeader>
              <CardTitle>Group B Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driversGroupB.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>#{driver.number}</TableCell>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>
                        <span className={driver.active ? "text-green-600" : "text-red-600"}>
                          {driver.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(driver.id, driver.active)}
                        >
                          {driver.active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

