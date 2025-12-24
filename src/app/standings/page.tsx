import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StandingsPage() {
  const currentSeason = new Date().getFullYear();
  
  const standings = await prisma.standings.findMany({
    where: { season: currentSeason },
    include: {
      user: {
        select: { teamName: true },
      },
    },
    orderBy: { totalPoints: "desc" },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Season Standings</h1>

      <Card>
        <CardHeader>
          <CardTitle>{currentSeason} Season</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead className="text-right">Total Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((standing, index) => (
                <TableRow key={standing.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{standing.user.teamName}</TableCell>
                  <TableCell className="text-right">{standing.totalPoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

