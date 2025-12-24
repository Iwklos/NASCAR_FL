import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const nextRace = await prisma.race.findFirst({
    where: {
      date: { gte: new Date() },
      completed: false,
    },
    orderBy: { date: "asc" },
  });

  const userPick = nextRace
    ? await prisma.pick.findUnique({
        where: {
          userId_raceId: {
            userId: session.user.id,
            raceId: nextRace.id,
          },
        },
        include: {
          driverA: true,
          driverB: true,
        },
      })
    : null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {session.user.name}!
      </h1>

      {nextRace && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Next Race</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{nextRace.name}</p>
            <p className="text-gray-600">{nextRace.track}</p>
            <p className="mt-2">
              {new Date(nextRace.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            
            {userPick ? (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <p className="font-semibold text-green-800">✓ Picks Submitted</p>
                <p>Group A: {userPick.driverA.name} (#{userPick.driverA.number})</p>
                <p>Group B: {userPick.driverB.name} (#{userPick.driverB.number})</p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-yellow-50 rounded">
                <p className="font-semibold text-yellow-800">⚠ No Picks Yet</p>
                <Link href="/picks" className="text-blue-600 hover:underline">
                  Make your picks now →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

