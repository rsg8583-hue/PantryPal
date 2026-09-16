export async function GET() {
    return Response.json({
        ok: true,
        service: "pantrypal",
        timestamp: new Date().toISOString(),
    });
}
