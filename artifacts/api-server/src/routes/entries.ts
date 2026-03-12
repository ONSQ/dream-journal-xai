import { Router, type IRouter, type Request, type Response } from "express";
import { db, journalEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/entries", async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(journalEntriesTable)
      .orderBy(journalEntriesTable.createdAt);

    const entries = rows.map(r => ({
      clientId: r.clientId,
      mode: r.mode,
      phase: r.phase,
      entryDate: r.entryDate,
      data: r.data,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    res.json({ entries });
  } catch (err) {
    console.error("Failed to list entries:", err);
    res.status(500).json({ success: false, error: "Failed to load entries" });
  }
});

router.post("/entries", async (req: Request, res: Response) => {
  try {
    const { clientId, mode, phase, entryDate, data } = req.body;

    if (!clientId || !mode || !phase || !entryDate) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const now = new Date();

    const [row] = await db
      .insert(journalEntriesTable)
      .values({
        clientId: String(clientId),
        mode,
        phase,
        entryDate: String(entryDate),
        data: data ?? {},
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: journalEntriesTable.clientId,
        set: {
          mode,
          phase,
          entryDate: String(entryDate),
          data: data ?? {},
          updatedAt: now,
        },
      })
      .returning();

    res.json({
      clientId: row.clientId,
      mode: row.mode,
      phase: row.phase,
      entryDate: row.entryDate,
      data: row.data,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("Failed to upsert entry:", err);
    res.status(500).json({ success: false, error: "Failed to save entry" });
  }
});

router.delete("/entries/:clientId", async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const deleted = await db
      .delete(journalEntriesTable)
      .where(eq(journalEntriesTable.clientId, clientId))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ success: false, error: "Entry not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete entry:", err);
    res.status(500).json({ success: false, error: "Failed to delete entry" });
  }
});

export default router;
